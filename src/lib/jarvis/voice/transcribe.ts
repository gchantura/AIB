import { env } from '$env/dynamic/private';
import { getLLMConfig } from '$lib/jarvis/llm/config.js';

const WHISPER_HINT = 'Install a Whisper model in Ollama, e.g. `ollama pull whisper` or `ollama pull dimavz/whisper-tiny`.';

function ollamaBaseUrl() {
	return getLLMConfig(env).ollamaBaseUrl.replace(/\/$/, '');
}

function whisperModel() {
	return env.JARVIS_WHISPER_MODEL?.trim() || '';
}

async function listOllamaModels(): Promise<string[]> {
	const res = await fetch(`${ollamaBaseUrl()}/api/tags`, { signal: AbortSignal.timeout(5000) });
	if (!res.ok) return [];
	const data = (await res.json()) as { models?: Array<{ name: string }> };
	return (data.models ?? []).map((model) => model.name);
}

async function resolveWhisperModel(): Promise<string> {
	const configured = whisperModel();
	if (configured) return configured;

	const models = await listOllamaModels();
	const match = models.find((name) => /whisper|dimavz\/whisper/i.test(name));
	if (match) return match;

	throw new Error(`No Whisper model found in Ollama. ${WHISPER_HINT}`);
}

async function transcribeViaOllamaEndpoint(model: string, audio: Buffer): Promise<string | null> {
	const res = await fetch(`${ollamaBaseUrl()}/api/transcribe`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/octet-stream' },
		body: audio,
		signal: AbortSignal.timeout(120_000)
	});

	if (!res.ok) return null;

	const data = (await res.json()) as { text?: string };
	return data.text?.trim() || null;
}

async function transcribeViaGenerate(model: string, audio: Buffer, language: string): Promise<string> {
	const res = await fetch(`${ollamaBaseUrl()}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model,
			prompt: '',
			stream: false,
			raw: true,
			keep_alive: '5m'
		}),
		signal: AbortSignal.timeout(120_000)
	});

	if (!res.ok) {
		throw new Error(`Ollama transcription failed (${res.status}). ${WHISPER_HINT}`);
	}

	const data = (await res.json()) as { response?: string };
	const text = data.response?.trim();
	if (!text) {
		throw new Error(`Ollama returned empty transcription. ${WHISPER_HINT}`);
	}

	return text;
}

/** Transcribe audio bytes with a local Ollama Whisper model. */
export async function transcribeAudio(audio: Buffer, language: string): Promise<string> {
	const model = await resolveWhisperModel();

	const fromTranscribeEndpoint = await transcribeViaOllamaEndpoint(model, audio);
	if (fromTranscribeEndpoint) return fromTranscribeEndpoint;

	// Some Ollama Whisper builds expose only /api/generate with binary payloads.
	try {
		const res = await fetch(`${ollamaBaseUrl()}/api/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model,
				prompt: language === 'auto' ? '' : language,
				stream: false
			}),
			signal: AbortSignal.timeout(120_000)
		});

		if (res.ok) {
			const data = (await res.json()) as { response?: string };
			if (data.response?.trim()) return data.response.trim();
		}
	} catch {
		/* fall through */
	}

	return transcribeViaGenerate(model, audio, language);
}

export async function ollamaIsReachable(): Promise<boolean> {
	try {
		const res = await fetch(`${ollamaBaseUrl()}/api/tags`, { signal: AbortSignal.timeout(3000) });
		return res.ok;
	} catch {
		return false;
	}
}

export { WHISPER_HINT };
