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
| Ollama | PLANNED | 11434 | Primary local provider |
| LM Studio | PLANNED | 1234 | OpenAI-compatible API |
| llama.cpp server | PLANNED | 8080 | Raw llama.cpp HTTP |
| vLLM | PLANNED | 8000 | High-throughput local |

### Cloud (Optional, Opt-In)

| Provider | Status | Requires |
|---|---|---|
| OpenAI | PLANNED | `OPENAI_API_KEY` |
| Anthropic | PLANNED | `ANTHROPIC_API_KEY` |
| Google Gemini | PLANNED | `GOOGLE_API_KEY` |
| OpenRouter | PLANNED | `OPENROUTER_API_KEY` |

---

## Model Router Logic (Planned)

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

## Implementation Plan (Phase 4)

1. Create `src/lib/jarvis/llm/types.ts` — all interfaces.
2. Create `src/lib/jarvis/llm/config.ts` — read env vars.
3. Create `src/lib/jarvis/llm/errors.ts` — typed errors.
4. Create `src/lib/jarvis/llm/providers/ollama.ts` — first local provider.
5. Create `src/lib/jarvis/llm/providers/openai-compatible.ts` — shared base for LM Studio, vLLM, llama.cpp.
6. Create `src/lib/jarvis/llm/capabilities.ts` — model metadata registry.
7. Create `src/lib/jarvis/llm/router.ts` — task-based routing.
8. Create `src/lib/jarvis/llm/prompts.ts` — prompt templates.
9. Create `src/routes/api/models/+server.ts` — model listing API.
10. Add model status panel to dashboard.
