<script>
	/** @type {{ language?: 'en' | 'ka' | 'ru', mode?: 'web'|'ollama', onchunk?: (detail: { text: string, lang: 'en' | 'ka' | 'ru' }) => void, onstatus?: (status: string) => void, onerror?: (message: string) => void }} */
	let { language = 'en', mode = 'web', onchunk, onstatus, onerror } = $props();

	import { SPEECH_LANG_MAP } from '$lib/stores/voice-transcript.js';
	import { Mic, Square } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	let status = $state('idle');
	let errorMessage = $state('');
	let busy = $state(false);

	/** @type {SpeechRecognition | null} */
	let recognition = null;

	// Ollama local recording mode
	let audioStream = null;
	let audioRec = null;
	let audioChunks = [];

	function speechSupported() {
		if (typeof window === 'undefined') return false;
		return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
	}

	function notifyStatus(next) {
		status = next;
		onstatus?.(next);
	}

	function notifyError(message) {
		errorMessage = message;
		notifyStatus('error');
		onerror?.(message);
	}

	function createRecognition() {
		const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognitionCtor) return null;

		const instance = new SpeechRecognitionCtor();
		instance.continuous = true;
		instance.interimResults = true;
		instance.lang = SPEECH_LANG_MAP[language] ?? 'en-US';

		instance.onresult = (event) => {
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (!result.isFinal) continue;

				const text = result[0]?.transcript?.trim();
				if (!text) continue;

				onchunk?.({ text, lang: language });
			}
		};

		instance.onerror = (event) => {
			if (event.error === 'not-allowed') {
				notifyError('Microphone permission denied. Allow microphone access in browser settings.');
				return;
			}
			if (event.error === 'no-speech') return;
			if (event.error === 'aborted') return;

			notifyError(`Speech recognition error: ${event.error}`);
		};

		instance.onend = () => {
			if (status === 'listening') {
				try {
					instance.start();
				} catch {
					notifyStatus('idle');
				}
			}
		};

		return instance;
	}

	async function startListening() {
		if (busy || status === 'listening') return;
		busy = true;
		errorMessage = '';

		try {
			if (!navigator.mediaDevices?.getUserMedia) {
				throw new Error('Microphone access is not supported in this browser.');
			}

			if (mode === 'ollama') {
				// Ollama Whisper mode: record locally, upload on stop
				await initOllamaRecording();
				return;
			}

			// Web Speech API mode (default)
			if (!speechSupported()) {
				notifyError('Speech recognition is not supported in this browser.');
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach((track) => track.stop());

			recognition?.abort();
			recognition = createRecognition();
			if (!recognition) {
				throw new Error('Speech recognition is not supported in this browser.');
			}

			recognition.lang = SPEECH_LANG_MAP[language] ?? 'en-US';
			recognition.start();
			notifyStatus('listening');
		} catch (err) {
			const name = err instanceof Error ? err.name : '';
			if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
				notifyError('Microphone permission denied. Allow microphone access in browser settings.');
			} else {
				notifyError(err instanceof Error ? err.message : 'Failed to start microphone.');
			}
		} finally {
			busy = false;
		}
	}

	async function initOllamaRecording() {
		try {
			audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			audioChunks = [];

			audioRec = new MediaRecorder(audioStream, { mimeType: getSupportedMimeType() });
			audioRec.ondataavailable = (e) => {
				if (e.data.size > 0) audioChunks.push(e.data);
			};
			audioRec.start();

			recognition?.abort();
			recognition = null;
			notifyStatus('listening');
		} catch (err) {
			const name = err instanceof Error ? err.name : '';
			if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
				notifyError('Microphone permission denied. Allow microphone access in browser settings.');
			} else {
				notifyError(err instanceof Error ? err.message : 'Failed to start recording.');
			}
		}
	}

	function getSupportedMimeType() {
		const types = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
		for (const t of types) {
			if (MediaRecorder.isTypeSupported(t)) return t;
		}
		return '';
	}

	async function uploadAndTranscribe() {
		if (!audioRec || audioRec.state === 'inactive') return;
		audioRec.stop();
		audioStream?.getTracks().forEach((t) => t.stop());
		notifyStatus('transcribing');

		const blob = new Blob(audioChunks, { type: audioRec.mimeType || 'audio/webm' });
		const formData = new FormData();
		formData.append('audio', blob, 'recording.webm');
		formData.append('language', language);

		try {
			const res = await fetch('/api/voice/transcribe', { method: 'POST', body: formData });
			const data = await res.json();

			if (!res.ok) {
				notifyError(data.error ?? 'Transcription failed.');
				return;
			}

			onchunk?.({ text: data.text, lang: language });
			notifyStatus('listening');
		} catch {
			notifyError('Local Ollama unavailable. Start Ollama and try again.');
		} finally {
			audioChunks = [];
			audioStream = null;
			audioRec = null;
		}
	}

	function stopListening() {
		if (busy) return;
		busy = true;

		if (mode === 'ollama' && audioRec?.state === 'recording') {
			uploadAndTranscribe();
			return;
		}

		try {
			recognition?.stop();
		} catch {
			recognition?.abort();
		}

		notifyStatus('idle');
		busy = false;
	}

	function resetError() {
		errorMessage = '';
		notifyStatus('idle');
	}

	$effect(() => {
		if (recognition && status === 'listening') {
			recognition.lang = SPEECH_LANG_MAP[language] ?? 'en-US';
		}
	});

	onDestroy(() => {
		try {
			recognition?.abort();
		} catch {
			/* ignore */
		}
		audioStream?.getTracks().forEach((t) => t.stop());
		recognition = null;
		audioStream = null;
	});
</script>

<div class="panel">
	<div class="controls">
		{#if status === 'listening'}
			<button class="btn stop" onclick={stopListening} disabled={busy}>
				<Square size={15} />
				Stop listening
			</button>
		{:else}
			<button class="btn" onclick={startListening} disabled={busy || status === 'error'}>
				<Mic size={15} />
				Start listening
			</button>
		{/if}

		{#if status === 'error'}
			<button class="btn secondary" onclick={resetError}>Dismiss</button>
		{/if}
	</div>

	<p class="status">
		<span class="dot" class:listening={status === 'listening'} class:error={status === 'error'}></span>
		{#if status === 'listening'}
			{mode === 'ollama' ? 'Listening — recording locally. Stop to transcribe via Ollama.' : 'Listening — speech is converted to text in real time.'}
		{:else if status === 'transcribing'}
			Transcribing via local Ollama…
		{:else if status === 'error'}
			{errorMessage}
		{:else}
			Idle — click Start to begin microphone capture.
		{/if}
	</p>
</div>

<style>
	.panel {
		border: 1px solid var(--surface-border);
		border-radius: var(--radius-lg);
		background: var(--surface-card);
		padding: var(--space-4);
		display: grid;
		gap: var(--space-3);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		border: 0;
		border-radius: var(--radius-md);
		background: var(--color-neutral-900);
		color: white;
		padding: 0.55rem 0.85rem;
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.btn.stop {
		background: var(--color-neutral-700);
	}

	.btn.secondary {
		background: transparent;
		border: 1px solid var(--surface-border);
		color: var(--text-primary);
	}

	.status {
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
		background: var(--color-neutral-400);
		flex-shrink: 0;
	}

	.dot.listening {
		background: var(--color-success-500);
		animation: pulse 1.2s infinite;
	}

	.dot.error {
		background: var(--color-error-500);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}
</style>
