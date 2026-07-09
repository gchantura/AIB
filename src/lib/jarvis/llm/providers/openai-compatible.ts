import type { LLMProvider, ChatRequest, ChatResponse, ModelInfo, ProviderCapabilities } from '../types.js';
import { offline, authFailed, rateLimited } from '../errors.js';

/**
 * Shared base for any OpenAI-compatible REST API:
 * LM Studio, vLLM, llama.cpp server, OpenAI, OpenRouter, etc.
 */
export class OpenAICompatibleProvider implements LLMProvider {
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    toolCalling: true,
    jsonMode: true,
    embeddings: true,
    contextWindow: 128000,
    supportsImages: false,
  };

  constructor(
    readonly id: string,
    readonly name: string,
    readonly privacyLevel: 'local' | 'cloud',
    private baseUrl: string,
    private apiKey: string = '',
  ) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok || res.status === 401;
    } catch {
      return false;
    }
  }

  /** Pre-discovered models (e.g. for providers whose /v1/models endpoint is incomplete). */
  knownModels: string[] = [];

  async listModels(): Promise<ModelInfo[]> {
    // If the provider declared known models, use them first — faster and avoids
    // broken /v1/models endpoints (NVIDIA's GLM-5.2 lives at /chat/completions, not /v1/models).
    if (this.knownModels.length > 0) {
      return this.knownModels.map(id => ({ id, name: id, capabilities: {} }));
    }

    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return [];
      const data = await res.json() as { data?: Array<{ id: string }> };
      const rawModels = data.data ?? [];

      return rawModels.map(m => ({
        id: m.id,
        name: m.id,
        capabilities: {},
      }));
    } catch {
      return [];
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages = request.system
      ? [{ role: 'system' as const, content: request.system }, ...request.messages]
      : request.messages;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: request.model,
        messages,
        temperature: request.temperature ?? 0.7,
        top_p: request.top_p,
        max_tokens: request.max_tokens,
        seed: request.seed,
        stream: false,
      }),
    });

    if (res.status === 401) throw authFailed(this.id);
    if (res.status === 429) throw rateLimited(this.id);
    if (!res.ok) throw offline(this.id);

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      model?: string;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: data.model ?? request.model,
      usage: data.usage,
      finish_reason: data.choices?.[0]?.finish_reason,
    };
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<string> {
    const messages = request.system
      ? [{ role: 'system' as const, content: request.system }, ...request.messages]
      : request.messages;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: request.model,
        messages,
        temperature: request.temperature ?? 0.7,
        top_p: request.top_p,
        max_tokens: request.max_tokens,
        seed: request.seed,
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
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const chunk = JSON.parse(trimmed.slice(6)) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch { /* partial chunk */ }
      }
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
    });
    if (!res.ok) throw offline(this.id);
    const data = await res.json() as { data?: Array<{ embedding: number[] }> };
    return (data.data ?? []).map(d => d.embedding);
  }
}
