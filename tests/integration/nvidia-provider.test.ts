import { describe, expect, it, vi } from 'vitest';
import { OpenAICompatibleProvider } from '../../src/lib/jarvis/llm/providers/openai-compatible.js';

describe('NVIDIA NIM integration', () => {
  it('sends OpenAI-compatible streaming parameters and parses SSE content', async () => {
    let requestBody: Record<string, unknown> = {};
    vi.stubGlobal('fetch', vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body));
      return new Response('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: [DONE]\n\n', {
        headers: { 'content-type': 'text/event-stream' }
      });
    }));

    const provider = new OpenAICompatibleProvider('nvidia', 'NVIDIA NIM', 'cloud', 'https://integrate.api.nvidia.com/v1', 'test-key');
    const chunks: string[] = [];
    for await (const chunk of provider.chatStream({ model: 'z-ai/glm-5.2', messages: [{ role: 'user', content: 'Hi' }], temperature: 1, top_p: 1, max_tokens: 16384, seed: 42 })) chunks.push(chunk);

    expect(chunks).toEqual(['Hello']);
    expect(requestBody).toMatchObject({ model: 'z-ai/glm-5.2', temperature: 1, top_p: 1, max_tokens: 16384, seed: 42, stream: true });
    vi.unstubAllGlobals();
  });
});
