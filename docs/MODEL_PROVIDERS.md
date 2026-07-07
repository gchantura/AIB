# Model Providers

## Provider Abstraction

All LLM calls in J.A.R.V.I.S. go through `src/lib/jarvis/llm/router.ts`. Application code never calls a provider directly.

---

## Provider Interface (TypeScript concept)

```typescript
interface LLMProvider {
  id: string;
  name: string;
  privacyLevel: 'local' | 'cloud' | 'hybrid';
  capabilities: ProviderCapabilities;

  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncIterableIterator<string>;
  embed?(texts: string[]): Promise<number[][]>;
  listModels?(): Promise<ModelInfo[]>;
  healthCheck(): Promise<boolean>;
}

interface ProviderCapabilities {
  streaming: boolean;
  toolCalling: boolean;
  jsonMode: boolean;
  embeddings: boolean;
  contextWindow: number;       // tokens
  costPerMillionTokens?: number;
  supportsImages: boolean;
}
```

---

## Supported Providers

### Local (Privacy-First)

| Provider | Status | Port | Notes |
|---|---|---|---|
| Ollama | IMPLEMENTED | 11434 | Primary local provider; chat, streaming, models and health |
| LM Studio | IMPLEMENTED | 1234 | OpenAI-compatible adapter |
| llama.cpp server | COMPATIBLE | configurable | Usable through the OpenAI-compatible adapter |
| vLLM | COMPATIBLE | configurable | Usable through the OpenAI-compatible adapter |

### Cloud (Optional, Opt-In)

| Provider | Status | Requires |
|---|---|---|
| OpenAI | IMPLEMENTED, OPT-IN | `OPENAI_API_KEY` and cloud models enabled |
| Anthropic | IMPLEMENTED, OPT-IN | `ANTHROPIC_API_KEY` and cloud models enabled |
| Google Gemini | FUTURE | `GOOGLE_API_KEY` |
| OpenRouter | COMPATIBLE/FUTURE CONFIG | OpenAI-compatible endpoint configuration |

---

## Model Router Logic

```
Task type → Provider selection order

chat (general)         → Ollama → LM Studio → OpenAI → Anthropic
coding                 → Ollama (deepseek-coder/codellama) → OpenAI (gpt-4o) → Anthropic
research/summarize     → Ollama → Gemini → OpenAI
embeddings             → Ollama (nomic-embed) → OpenAI (text-embedding-3-small)
fast/cheap             → Ollama → OpenRouter (cheapest match)
high-quality           → Anthropic (claude-3-5-sonnet) → OpenAI (gpt-4o)
offline-only           → Ollama → LM Studio → llama.cpp (fail if none available)
```

---

## Model Configuration (Environment Variables)

```env
# Provider enables (all optional)
OLLAMA_BASE_URL=http://localhost:11434
LM_STUDIO_BASE_URL=http://localhost:1234
LLAMA_CPP_BASE_URL=http://localhost:8080
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
OPENROUTER_API_KEY=

# Routing preferences
JARVIS_DEFAULT_LOCAL_CHAT_MODEL=llama3.2
JARVIS_DEFAULT_CODING_MODEL=deepseek-coder-v2
JARVIS_DEFAULT_EMBED_MODEL=nomic-embed-text
JARVIS_DEFAULT_RESEARCH_MODEL=llama3.2
JARVIS_ALLOW_CLOUD_MODELS=false
JARVIS_PRIVACY_MODE=true
JARVIS_MAX_COST_PER_RUN=0.10
JARVIS_PREFERRED_PROVIDER_ORDER=ollama,lm-studio,openai,anthropic
```

---

## Implemented Phase 4 Components

- `src/lib/jarvis/llm/types.ts`, `config.ts`, and `errors.ts`
- Ollama, OpenAI-compatible, and Anthropic provider adapters
- Local-first task router with privacy enforcement
- `/api/models` health/model inventory and dashboard status
- Streaming `/api/chat`, persistent conversations, research and coding endpoints
