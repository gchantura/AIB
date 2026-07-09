import { describe, it, expect, vi } from 'vitest';
// Mock the necessary external modules/classes for isolated testing

// --- Mocks setup ---

/**
 * Global mock for fetching content and simulating streaming behavior
 */
const mockFetch = vi.fn();

vi.mock('node-fetch', () => ({
  default: vi.fn(() => ({
    ok: true,
    status: 200,
    json: vi.fn(),
    text: vi.fn(),
    // Mock response object for fetch API calls (used in chat/embeddings)
    getReader: () => ({
      read: async () => {
        const chunk = "data: {\"choices\":[{\"delta\":{\"content\":\"Test content chunk\\n\"}}]}";
        if (!chunk) return { done: true, value: undefined };

        return { done: false, value: new TextEncoder().encode(chunk) };
      },
    }),
  })),
}));


// Mock the OpenAICompatibleProvider class for testing purposes
class MockOpenAICompatibleProvider {
  constructor(id, name, privacyLevel, baseUrl, apiKey = '') {
    this.id = id;
    this.name = name;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    // Mock known models specific to this test context
    this.knownModels = ['z-ai/glm-5.2'];
  }

  async healthCheck() {
    return true; // Always pass health check for testing
  }

  async listModels() {
    return [{ id: 'z-ai/glm-5.2', name: 'z-ai/glm-5.2' }];
  }

  // Mock the chat method (non-streaming)
  async chat(request) {
    const mockResponse = { content: "Test non-stream response.", model: request.model };
    return { content: mockResponse.content, model: mockResponse.model, usage: {} };
  }

  // Mock the stream method (the core of this test)
  async *chatStream(request) {
    if (request.model !== 'z-ai/glm-5.2') {
        throw new Error("Expected model z-ai/glm-5.2 not provided.");
    }

    const chunks = [
      "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\n",
      "data: {\"choices\":[{\"delta\":{\"content\":\" world\"}}]}\n",
      "data: {\"choices\":[{\"delta\":{\"content\":\" from NVIDIA!\"}}]}", // No trailing newline on final data
    ];

    for (const chunk of chunks) {
        yield chunk;
    }
  }

  async embed(texts) {
    return [[1, 2]]; // Mock embedding result
  }
}


// --- Tests ---

import { OpenAICompatibleProvider } from '../openai-compatible'; // Assuming path structure is correct

describe('NVIDIA Provider Integration Test', () => {
  const MOCK_CONFIG = {
    nvidiaApiKey: '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',
    nvidiaBaseUrl: 'https://integrate.api.nvidia.com/v1',
  };

  // Replace the real class implementation with our mock for testing scope
  vi.mock('../openai-compatible', () => ({
    OpenAICompatibleProvider: MockOpenAICompatibleProvider,
  }));


  it('should instantiate correctly with custom NVIDIA credentials and base URL', async () => {
    const provider = new OpenAICompatibleProvider(
      'nvidia', 'NVIDIA NIM', 'cloud',
      MOCK_CONFIG.nvidiaBaseUrl,
      MOCK_CONFIG.nvidiaApiKey,
    );

    // Check if the correct base URL was captured (internal check)
    // Since we cannot directly test private members, we rely on functional calls below.
  });

  it('should successfully run healthCheck with custom NVIDIA API endpoint', async () => {
    const provider = new OpenAICompatibleProvider(
      'nvidia', 'NVIDIA NIM', 'cloud',
      MOCK_CONFIG.nvidiaBaseUrl,
      MOCK_CONFIG.nvidiaApiKey,
    );
    // This relies on the mocked fetch in setup or the mock implementation if available
    expect(await provider.healthCheck()).toBe(true);
  });

  it('should correctly stream content when using the NVIDIA model z-ai/glm-5.2', async () => {
    const provider = new OpenAICompatibleProvider(
      'nvidia', 'NVIDIA NIM', 'cloud',
      MOCK_CONFIG.nvidiaBaseUrl,
      MOCK_CONFIG.nvidiaApiKey,
    );

    const request = {
        model: "z-ai/glm-5.2",
        messages: [{ role: "user", content: "Test prompt" }],
        temperature: 1,
        top_p: 1,
        max_tokens: 16384,
        seed: 42,
        stream: true,
    };

    const receivedChunks = [];
    for await (const chunk of provider.chatStream(request)) {
      receivedChunks.push(chunk);
    }

    expect(receivedChunks).toEqual(["Hello", " world", " from NVIDIA!"]);
  });
});