import type { LLMConfig } from './types.js';

export type { LLMConfig };

export function getLLMConfig(
  env: Record<string, string | undefined>,
  overrides?: Partial<LLMConfig>,
): LLMConfig {
  const base = {
    ollamaBaseUrl: env.OLLAMA_BASE_URL || 'http://localhost:11434',
    lmStudioBaseUrl: env.LM_STUDIO_BASE_URL || 'http://localhost:1234',
    openaiApiKey: env.OPENAI_API_KEY || '',
    anthropicApiKey: env.ANTHROPIC_API_KEY || '',
    nvidiaApiKey: env.NVIDIA_API_KEY || '',
    nvidiaBaseUrl: env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    defaultNvidiaModel: env.JARVIS_DEFAULT_NVIDIA_MODEL || 'z-ai/glm-5.2',
    defaultLocalChatModel: env.JARVIS_DEFAULT_LOCAL_CHAT_MODEL || 'llama3.2',
    defaultCodingModel: env.JARVIS_DEFAULT_CODING_MODEL || 'deepseek-coder-v2',
    defaultResearchModel: env.JARVIS_DEFAULT_RESEARCH_MODEL || 'llama3.2',
    defaultEmbedModel: env.JARVIS_DEFAULT_EMBED_MODEL || 'nomic-embed-text',
    allowCloudModels: env.JARVIS_ALLOW_CLOUD_MODELS === 'true',
    privacyMode: env.JARVIS_PRIVACY_MODE !== 'false',
    preferredProviderOrder: (env.JARVIS_PREFERRED_PROVIDER_ORDER || 'ollama,lm-studio,nvidia,openai,anthropic').split(',').map((id) => id.trim()).filter(Boolean),
  };

  if (!overrides) return base;

  // Per-provider API key overrides (forwarded from client UI)
  const nvidiaKey = overrides.nvidiaApiKey ?? env.NVIDIA_API_KEY ?? '';
  const openaiKey = overrides.openaiApiKey ?? env.OPENAI_API_KEY ?? '';
  const anthropicKey = overrides.anthropicApiKey ?? env.ANTHROPIC_API_KEY ?? '';

  // Any configured cloud key implies temporary cloud access for that provider
  const hasConfiguredCloudKey = !!(nvidiaKey || openaiKey || anthropicKey);

  return {
    ...base,
    nvidiaApiKey: nvidiaKey,
    nvidiaBaseUrl: overrides.nvidiaBaseUrl ?? base.nvidiaBaseUrl,
    allowCloudModels: base.allowCloudModels || hasConfiguredCloudKey,
    openaiApiKey: openaiKey,
    anthropicApiKey: anthropicKey,
  };
}
