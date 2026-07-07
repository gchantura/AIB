export class LLMError extends Error {
  constructor(
    message: string,
    public readonly providerId: string,
    public readonly code: 'OFFLINE' | 'AUTH' | 'RATE_LIMIT' | 'CONTEXT_LENGTH' | 'UNKNOWN',
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export function isLLMError(e: unknown): e is LLMError {
  return e instanceof LLMError;
}

export function offline(providerId: string): LLMError {
  return new LLMError(`Provider ${providerId} is offline`, providerId, 'OFFLINE', true);
}

export function authFailed(providerId: string): LLMError {
  return new LLMError(`Authentication failed for ${providerId}`, providerId, 'AUTH', false);
}

export function rateLimited(providerId: string): LLMError {
  return new LLMError(`Rate limit hit for ${providerId}`, providerId, 'RATE_LIMIT', true);
}
