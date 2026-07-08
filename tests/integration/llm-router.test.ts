import { describe, expect, it, vi } from 'vitest';
import { LLMRouter } from '../../src/lib/jarvis/llm/router.js';
import { getLLMConfig } from '../../src/lib/jarvis/llm/config.js';

describe('LLMRouter provider integration', () => {
  it('routes to an available local provider without Ollama', async () => {
    const router = new LLMRouter(getLLMConfig({ JARVIS_PREFERRED_PROVIDER_ORDER: 'lm-studio,ollama' }));
    const ollama = router.getProvider('ollama')!;
    const local = router.getProvider('lm-studio')!;
    vi.spyOn(ollama, 'healthCheck').mockResolvedValue(false);
    vi.spyOn(local, 'healthCheck').mockResolvedValue(true);
    vi.spyOn(local, 'chat').mockResolvedValue({ content: 'local response', model: 'local-test' });
    const result = await router.chat({ model: 'local-test', messages: [{ role: 'user', content: 'hello' }] });
    expect(result.content).toBe('local response');
    expect(local.chat).toHaveBeenCalledOnce();
  });
});
