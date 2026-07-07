import type { LLMProvider, ChatRequest, ChatResponse, ModelInfo, ProviderCapabilities } from '../types.js';
import { authFailed, rateLimited, offline } from '../errors.js';

export class AnthropicProvider implements LLMProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic';
  readonly privacyLevel = 'cloud' as const;
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    toolCalling: true,
    jsonMode: false,
    embeddings: false,
    contextWindow: 200000,
    supportsImages: true,
    costPerMillionTokensInput: 3,
    costPerMillionTokensOutput: 15,
  };

  private readonly baseUrl = 'https://api.anthropic.com/v1';

  constructor(private apiKey: string) {}

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok || res.status === 200;
    } catch {
      return false;
    }
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', capabilities: {} },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', capabilities: {} },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', capabilities: {} },
    ];
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.max_tokens ?? 4096,
        system: request.system,
        messages: request.messages.filter(m => m.role !== 'system'),
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (res.status === 401) throw authFailed(this.id);
    if (res.status === 429) throw rateLimited(this.id);
    if (!res.ok) throw offline(this.id);

    const data = await res.json() as {
      content?: Array<{ type: string; text?: string }>;
      model?: string;
      usage?: { input_tokens: number; output_tokens: number };
    };

    const text = data.content?.find(b => b.type === 'text')?.text ?? '';
    return {
      content: text,
      model: data.model ?? request.model,
      usage: data.usage ? {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
    };
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<string> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.max_tokens ?? 4096,
        system: request.system,
        messages: request.messages.filter(m => m.role !== 'system'),
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (res.status === 401) throw authFailed(this.id);
    if (res.status === 429) throw rateLimited(this.id);
    if (!res.ok || !res.body) throw offline(this.id);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(trimmed.slice(6)) as {
            type?: string;
            delta?: { type?: string; text?: string };
          };
          if (event.type === 'content_block_delta' && event.delta?.text) {
            yield event.delta.text;
          }
        } catch { /* partial */ }
      }
    }
  }
}
