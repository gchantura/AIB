import type { LLMProvider, ChatRequest, ChatResponse, ProviderHealth, TaskType, ModelInfo } from './types.js';
import type { LLMConfig } from './config.js';
import { OllamaProvider } from './providers/ollama.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { LLMError, offline } from './errors.js';

/** Maps known model name prefixes to their provider id. */
const MODEL_PROVIDER_MAP: Record<string, string> = {
  'z-ai/': 'nvidia',         // NVIDIA NIM models (GLM series etc.)
  'meta/': 'nvidia',          // Meta models on NVIDIA NIM
};

/** Resolve which provider a model name belongs to, or null for local/default. */
export function resolveProviderForModel(model: string): string | null {
  if (!model) return null;
  const slash = model.includes('/') ? model.substring(0, model.indexOf('/') + 1) : '';
  return MODEL_PROVIDER_MAP[slash] ?? null;
}

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

    if (this.config.openaiApiKey) {
      this.providers.set('openai', new OpenAICompatibleProvider(
        'openai', 'OpenAI', 'cloud',
        'https://api.openai.com/v1',
        this.config.openaiApiKey,
      ));
    }

    if (this.config.nvidiaApiKey) {
      const nvidiaProvider = new OpenAICompatibleProvider(
        'nvidia', 'NVIDIA NIM', 'cloud',
        this.config.nvidiaBaseUrl,
        this.config.nvidiaApiKey,
      );
      // NVIDIA's /models endpoint doesn't return GLM-5.2 because it lives at a different base URL path (/chat/completions).
      // Use known models as the primary list so chat selector shows usable text-completion models only.
      nvidiaProvider.knownModels = [
        'z-ai/glm-5.2',            // default, on /chat/completions endpoint
        'meta/llama-3.1-70b-instruct',
        'meta/llama-3.1-405b-instruct',
        'meta/llama-3.2-90b-vision-instruct',
        'mistralai/mistral-large2-instruct-2407',
      ];
      this.providers.set('nvidia', nvidiaProvider);
    }

    if (this.config.anthropicApiKey) {
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

  /**
   * Resolve which provider should handle a request. When an explicit model is given,
   * check if it belongs to a known provider (e.g. z-ai/* → nvidia). Fall back to
   * the priority order otherwise.
   */
  async getAvailableProvider(task: TaskType = 'chat', requestedModel?: string): Promise<LLMProvider> {
    const modelProvider = requestedModel ? resolveProviderForModel(requestedModel) : null;

    // If model maps to a specific provider, use it directly (check key + health).
    if (modelProvider) {
      const provider = this.providers.get(modelProvider);
      if (!provider) throw offline(modelProvider);  // provider not registered → needs key/config
      const online = await provider.healthCheck();
      if (online) return provider;
      throw offline(modelProvider);  // key configured but endpoint unreachable
    }

    // No model mapping — use priority order as fallback.
    const order = this.providerOrder(task);
    for (const id of order) {
      const provider = this.providers.get(id);
      if (!provider) continue;
      // Privacy mode blocks unconfigured cloud providers, but allows ones with real keys
      if (provider.privacyLevel === 'cloud' && this.config.privacyMode) {
        const keySet = (id === 'openai' && this.config.openaiApiKey)
          || (id === 'nvidia' && this.config.nvidiaApiKey)
          || (id === 'anthropic' && this.config.anthropicApiKey);
        if (!keySet) continue;
      }
      const online = await provider.healthCheck();
      if (online) return provider;
    }
    throw offline('all-providers');
  }

  async chat(request: ChatRequest, task: TaskType = 'chat'): Promise<ChatResponse> {
    const provider = await this.getAvailableProvider(task, request.model);
    const model = request.model || this.modelForTask(task);
    return provider.chat({ ...request, model: provider.id === 'nvidia' && !request.model ? this.config.defaultNvidiaModel : model });
  }

  async *chatStream(request: ChatRequest, task: TaskType = 'chat'): AsyncGenerator<string> {
    const provider = await this.getAvailableProvider(task, request.model);
    const model = request.model || this.modelForTask(task);
    yield* provider.chatStream({ ...request, model: provider.id === 'nvidia' && !request.model ? this.config.defaultNvidiaModel : model });
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
          // Use known models first for providers that declare them (e.g. NVIDIA — GLM-5.2 lives at /chat/completions, not /v1/models)
          const known = (provider as unknown as { knownModels?: string[] }).knownModels;
          if (known && known.length > 0) {
            models = known;
          } else {
            const list = await provider.listModels();
            models = list.slice(0, 10).map(m => m.id);
          }
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
