import type { LLMConfig } from './types.js';

export type { LLMConfig };

export function getLLMConfig(env: Record<string, string | undefined>): LLMConfig {
  return {
    ollamaBaseUrl: env.OLLAMA_BASE_URL || 'http://localhost:11434',
    lmStudioBaseUrl: env.LM_STUDIO_BASE_URL || 'http://localhost:1234',
    openaiApiKey: env.OPENAI_API_KEY || '',
    anthropicApiKey: env.ANTHROPIC_API_KEY || '',
    defaultLocalChatModel: env.JARVIS_DEFAULT_LOCAL_CHAT_MODEL || 'llama3.2',
    defaultCodingModel: env.JARVIS_DEFAULT_CODING_MODEL || 'deepseek-coder-v2',
    defaultResearchModel: env.JARVIS_DEFAULT_RESEARCH_MODEL || 'llama3.2',
    defaultEmbedModel: env.JARVIS_DEFAULT_EMBED_MODEL || 'nomic-embed-text',
    allowCloudModels: env.JARVIS_ALLOW_CLOUD_MODELS === 'true',
    privacyMode: env.JARVIS_PRIVACY_MODE !== 'false',
    preferredProviderOrder: (env.JARVIS_PREFERRED_PROVIDER_ORDER || 'ollama,lm-studio,openai,anthropic').split(','),
  };
}
