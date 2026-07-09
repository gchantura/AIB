import { describe, it, expect } from 'vitest';
import { resolveProviderForModel } from './router.js';

describe('resolveProviderForModel', () => {
  it('routes z-ai/* models to nvidia', () => {
    expect(resolveProviderForModel('z-ai/glm-5.2')).toBe('nvidia');
  });

  it('routes meta/* models to nvidia', () => {
    expect(resolveProviderForModel('meta/llama-3.1-70b-instruct')).toBe('nvidia');
  });

  it('returns null for local model names without slash prefix', () => {
    expect(resolveProviderForModel('llama3.2')).toBeNull();
    expect(resolveProviderForModel('deepseek-coder-v2')).toBeNull();
  });

  it('returns null for empty/missing model', () => {
    expect(resolveProviderForModel('')).toBeNull();
    expect(resolveProviderForModel(undefined as unknown as string)).toBeNull();
  });
});
