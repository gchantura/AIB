# Skill: Model Provider Engineer

## Purpose
Create model provider adapters for Ollama, LM Studio, llama.cpp, vLLM, OpenAI-compatible APIs, Anthropic, OpenAI, Gemini, OpenRouter, and future providers.

## Activation Triggers
- Adding a new LLM provider
- Fixing streaming behavior for a provider
- Adding embedding support to a provider
- Implementing model listing for a provider
- Updating the model router

## When to Use
- Any work in `src/lib/jarvis/llm/`

## When NOT to Use
- Building chat UI (use svelte-ui-engineer)
- Memory retrieval (use memory-engineer)

## Required Inputs
- Provider name and base URL
- Provider's API spec (OpenAI-compatible vs custom)
- Capabilities: streaming, tool calling, embeddings, JSON mode
- Context window and cost metadata

## Step-by-Step Workflow

1. Read `src/lib/jarvis/llm/types.ts` — understand the `LLMProvider` interface.
2. Read `src/lib/jarvis/llm/config.ts` — understand how env vars are read.
3. Create `src/lib/jarvis/llm/providers/<name>.ts`.
4. Implement the `LLMProvider` interface:
   - `chat()` — non-streaming
   - `chatStream()` — streaming via `ReadableStream` or `AsyncIterableIterator`
   - `embed()` — optional if supported
   - `listModels()` — optional if supported
   - `healthCheck()` — ping the provider URL
5. Set `privacyLevel`: local providers = `'local'`, cloud = `'cloud'`.
6. Add capability metadata in `src/lib/jarvis/llm/capabilities.ts`.
7. Register the provider in `src/lib/jarvis/llm/router.ts`.
8. Add env var to `docs/MODEL_PROVIDERS.md`.
9. Test health check against a running provider.

## Provider Interface

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
```

## Local-First Rule
When routing, always try local providers first:
1. Ollama (localhost:11434)
2. LM Studio (localhost:1234)
3. llama.cpp (localhost:8080)
4. vLLM (localhost:8000)
5. Cloud providers (only if `JARVIS_ALLOW_CLOUD_MODELS=true`)

## Output Format
- `src/lib/jarvis/llm/providers/<name>.ts`
- Updated `src/lib/jarvis/llm/capabilities.ts`
- Updated `src/lib/jarvis/llm/router.ts`
- Updated `docs/MODEL_PROVIDERS.md`

## Validation Checklist
- [ ] Implements full `LLMProvider` interface
- [ ] No hardcoded model names in application logic
- [ ] `privacyLevel` correctly set
- [ ] `healthCheck()` returns false gracefully if provider is offline
- [ ] Streaming uses proper async iteration
- [ ] No secrets in source code
- [ ] `npm run check` passes

## Failure Handling
- If provider is offline: `healthCheck()` returns `false`, router falls back to next provider
- If provider returns unexpected format: typed error from `errors.ts`, never crash

## Examples
**Ollama:** GET `http://localhost:11434/api/tags` for model list, POST `/api/chat` for chat.

## Registry Update Requirements
- Update `docs/MODEL_PROVIDERS.md` provider table
- Update `docs/REPOSITORY_MAP.md` if new file structure added
