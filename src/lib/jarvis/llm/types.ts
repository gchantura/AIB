export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  system?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  finish_reason?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  context_window?: number;
  capabilities: Partial<ProviderCapabilities>;
}

export interface ProviderCapabilities {
  streaming: boolean;
  toolCalling: boolean;
  jsonMode: boolean;
  embeddings: boolean;
  contextWindow: number;
  supportsImages: boolean;
  costPerMillionTokensInput?: number;
  costPerMillionTokensOutput?: number;
}

export interface LLMProvider {
  id: string;
  name: string;
  privacyLevel: 'local' | 'cloud';
  capabilities: ProviderCapabilities;
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncGenerator<string>;
  embed?(texts: string[]): Promise<number[][]>;
  listModels?(): Promise<ModelInfo[]>;
  healthCheck(): Promise<boolean>;
}

export interface ProviderHealth {
  id: string;
  name: string;
  online: boolean;
  latencyMs?: number;
  models?: string[];
  error?: string;
}

export interface LLMConfig {
  ollamaBaseUrl: string;
  lmStudioBaseUrl: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  defaultLocalChatModel: string;
  defaultCodingModel: string;
  defaultResearchModel: string;
  defaultEmbedModel: string;
  allowCloudModels: boolean;
  privacyMode: boolean;
  preferredProviderOrder: string[];
}

export type TaskType = 'chat' | 'coding' | 'research' | 'summarize' | 'embed' | 'fast' | 'quality';
