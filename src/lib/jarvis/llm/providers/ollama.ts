import type { LLMProvider, ChatRequest, ChatResponse, ModelInfo, ProviderCapabilities } from '../types.js';
import { offline } from '../errors.js';

export class OllamaProvider implements LLMProvider {
  readonly id = 'ollama';
  readonly name = 'Ollama';
  readonly privacyLevel = 'local' as const;
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    toolCalling: false,
    jsonMode: true,
    embeddings: true,
    contextWindow: 128000,
    supportsImages: false,
  };

  constructor(private baseUrl: string) {}

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return [];
      const data = await res.json() as { models?: Array<{ name: string; details?: { parameter_size?: string } }> };
      return (data.models ?? []).map(m => ({
        id: m.name,
        name: m.name,
        capabilities: { streaming: true, embeddings: m.name.includes('embed') },
      }));
    } catch {
      return [];
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.max_tokens,
        },
      }),
    });
    if (!res.ok) throw offline(this.id);
    const data = await res.json() as { message?: { content?: string }; model?: string };
    return {
      content: data.message?.content ?? '',
      model: data.model ?? request.model,
    };
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: true,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.max_tokens,
        },
      }),
    });

    if (!res.ok || !res.body) throw offline(this.id);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
          if (chunk.message?.content) yield chunk.message.content;
          if (chunk.done) return;
        } catch { /* partial line — skip */ }
      }
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      });
      if (!res.ok) throw offline(this.id);
      const data = await res.json() as { embedding?: number[] };
      results.push(data.embedding ?? []);
    }
    return results;
  }
}
