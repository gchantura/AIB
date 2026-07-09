import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { transcribeAudio } from '$lib/jarvis/voice/transcribe.js';
import { appendTranscriptLine } from '$lib/jarvis/voice/storage.js';

/** Upload raw audio → Ollama Whisper transcription. */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.formData();
	const file = body.get('audio');
	const language = body.get('language')?.toString() ?? 'auto';

	if (!file || !(file instanceof Blob)) {
		return json({ error: 'Missing audio blob.' }, { status: 400 });
	}

	if (file.size === 0) {
		return json({ error: 'Empty audio file.' }, { status: 400 });
	}

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		const text = await transcribeAudio(buffer, language);

		if (!text) {
			return json({ error: 'Transcription returned empty result. Check Ollama Whisper model.' }, { status: 502 });
		}

		// ponytail: append to local transcript.txt for persistence (user requested "append to text file")
		appendTranscriptLine(text).catch(() => {/* fire-and-forget */});

		return json({ text });
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Transcription failed';
		return json({ error: msg }, { status: 502 });
	}
};
