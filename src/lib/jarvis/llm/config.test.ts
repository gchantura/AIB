import { describe, expect, it } from 'vitest';
import { getLLMConfig } from './config.js';

describe('getLLMConfig', () => {
  it('is local-first and private by default', () => {
    const config = getLLMConfig({});
    expect(config.ollamaBaseUrl).toBe('http://localhost:11434');
    expect(config.allowCloudModels).toBe(false);
    expect(config.privacyMode).toBe(true);
    expect(config.preferredProviderOrder.slice(0, 2)).toEqual(['ollama', 'lm-studio']);
  });

  it('accepts explicit cloud and provider configuration', () => {
    const config = getLLMConfig({ JARVIS_ALLOW_CLOUD_MODELS: 'true', JARVIS_PRIVACY_MODE: 'false', JARVIS_PREFERRED_PROVIDER_ORDER: 'openai,anthropic', OPENAI_API_KEY: 'test' });
    expect(config.allowCloudModels).toBe(true);
    expect(config.privacyMode).toBe(false);
    expect(config.preferredProviderOrder).toEqual(['openai', 'anthropic']);
  });
});
