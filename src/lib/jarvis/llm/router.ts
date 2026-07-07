import type { LLMProvider, ChatRequest, ChatResponse, ProviderHealth, TaskType, ModelInfo } from './types.js';
import type { LLMConfig } from './config.js';
import { OllamaProvider } from './providers/ollama.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { LLMError, offline } from './errors.js';

export class LLMRouter {
  private providers: Map<string, LLMProvider> = new Map();
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.registerProviders();
  }

  private registerProviders() {
    this.providers.set('ollama', new OllamaProvider(this.config.ollamaBaseUrl));

    this.providers.set('lm-studio', new OpenAICompatibleProvider(
      'lm-studio', 'LM Studio', 'local',
      this.config.lmStudioBaseUrl,
    ));

    if (this.config.openaiApiKey && this.config.allowCloudModels) {
      this.providers.set('openai', new OpenAICompatibleProvider(
        'openai', 'OpenAI', 'cloud',
        'https://api.openai.com/v1',
        this.config.openaiApiKey,
      ));
    }

    if (this.config.anthropicApiKey && this.config.allowCloudModels) {
      this.providers.set('anthropic', new AnthropicProvider(this.config.anthropicApiKey));
    }
  }

  /** Pick the best available provider for a task, local-first. */
  private providerOrder(task: TaskType): string[] {
    const order = [...this.config.preferredProviderOrder];
    if (task === 'coding') {
      // prefer ollama with coding models
      return ['ollama', 'lm-studio', ...order.filter(p => p !== 'ollama' && p !== 'lm-studio')];
    }
    if (task === 'quality') {
      if (this.config.allowCloudModels) {
        return ['anthropic', 'openai', 'ollama', 'lm-studio'];
      }
    }
    if (task === 'embed') {
      return ['ollama', 'lm-studio', 'openai'];
    }
    return order;
  }

  private modelForTask(task: TaskType): string {
    switch (task) {
      case 'coding': return this.config.defaultCodingModel;
      case 'research':
      case 'summarize': return this.config.defaultResearchModel;
      case 'embed': return this.config.defaultEmbedModel;
      default: return this.config.defaultLocalChatModel;
    }
  }

  async getAvailableProvider(task: TaskType = 'chat'): Promise<LLMProvider> {
    const order = this.providerOrder(task);
    for (const id of order) {
      const provider = this.providers.get(id);
      if (!provider) continue;
      if (provider.privacyLevel === 'cloud' && this.config.privacyMode) continue;
      const online = await provider.healthCheck();
      if (online) return provider;
    }
    throw offline('all-providers');
  }

  async chat(request: ChatRequest, task: TaskType = 'chat'): Promise<ChatResponse> {
    const provider = await this.getAvailableProvider(task);
    const model = request.model || this.modelForTask(task);
    return provider.chat({ ...request, model });
  }

  async *chatStream(request: ChatRequest, task: TaskType = 'chat'): AsyncGenerator<string> {
    const provider = await this.getAvailableProvider(task);
    const model = request.model || this.modelForTask(task);
    yield* provider.chatStream({ ...request, model });
  }

  async checkAllProviders(): Promise<ProviderHealth[]> {
    const results: ProviderHealth[] = [];
    for (const [id, provider] of this.providers) {
      const start = Date.now();
      try {
        const online = await provider.healthCheck();
        const latencyMs = Date.now() - start;
        let models: string[] = [];
        if (online && provider.listModels) {
          const list = await provider.listModels();
          models = list.slice(0, 10).map(m => m.id);
        }
        results.push({ id, name: provider.name, online, latencyMs, models });
      } catch (e) {
        results.push({
          id,
          name: provider.name,
          online: false,
          error: e instanceof LLMError ? e.message : 'Unknown error',
        });
      }
    }
    return results;
  }

  async listAllModels(): Promise<{ providerId: string; models: ModelInfo[] }[]> {
    const results = [];
    for (const [id, provider] of this.providers) {
      if (!provider.listModels) continue;
      try {
        const online = await provider.healthCheck();
        if (!online) continue;
        const models = await provider.listModels();
        results.push({ providerId: id, models });
      } catch {
        // skip offline providers
      }
    }
    return results;
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers.get(id);
  }
}

let _router: LLMRouter | null = null;

export function getRouter(config: LLMConfig): LLMRouter {
  if (!_router) {
    _router = new LLMRouter(config);
  }
  return _router;
}

export function resetRouter(): void {
  _router = null;
}
