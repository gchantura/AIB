<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		AUTO_INTERVALS,
		OUTPUT_LANGUAGES,
		defaultVoiceState,
		downloadTextFile,
		formatSummariesJson,
		formatTranscriptTxt,
		loadVoiceState,
		saveVoiceState,
		transcriptSliceText
	} from '$lib/stores/voice-transcript.js';
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
	import {
		Mic,
		WandSparkles,
		Download,
		Trash2,
		RotateCcw,
		AlertCircle
	} from 'lucide-svelte';

	let state = $state(defaultVoiceState());
	let listeningStatus = $state('idle');
	let error = $state('');
	let summarizing = $state(false);

	/** @type {ReturnType<typeof setInterval> | null} */
	let autoTimer = null;

	const unsummarizedCount = $derived(
		Math.max(0, state.fullTranscript.length - state.lastSummarizedPosition)
	);

	const unsummarizedText = $derived(
		transcriptSliceText(
			state.fullTranscript,
			state.lastSummarizedPosition,
			state.fullTranscript.length
		)
	);

	onMount(() => {
		state = loadVoiceState();
		restartAutoSummary();
	});

	onDestroy(() => {
		if (autoTimer) clearInterval(autoTimer);
	});

	function persist() {
		saveVoiceState(state);
	}

	function restartAutoSummary() {
		if (autoTimer) clearInterval(autoTimer);

		autoTimer = setInterval(() => {
			const pending = state.fullTranscript.length - state.lastSummarizedPosition;
			if (pending > 0 && !summarizing) {
				summarize('auto');
			}
		}, state.config.autoIntervalMs);
	}

	/** @param {{ text: string, lang: 'en' | 'ka' | 'ru' }} detail */
	function handleChunk(detail) {
		state = {
			...state,
			fullTranscript: [
				...state.fullTranscript,
				{
					timestamp: Date.now(),
					text: detail.text,
					lang: detail.lang
				}
			]
		};
		persist();
	}

	function handleRecorderError(message) {
		error = message;
	}

	/** @param {'en' | 'ka' | 'ru'} code */
	function setLanguage(code) {
		state = {
			...state,
			config: { ...state.config, language: code }
		};
		persist();
	}

	/** @param {number} ms */
	function setAutoInterval(ms) {
		state = {
			...state,
			config: { ...state.config, autoIntervalMs: ms }
		};
		persist();
		restartAutoSummary();
	}

	/** @param {'manual' | 'auto'} source */
	async function summarize(source = 'manual') {
		if (summarizing) return;
		error = '';

		if (unsummarizedCount === 0) {
			error = 'No new transcript text to summarize.';
			return;
		}

		const from = state.lastSummarizedPosition;
		const to = state.fullTranscript.length;
		const transcript = transcriptSliceText(state.fullTranscript, from, to);

		summarizing = true;

		try {
			const res = await fetch('/api/voice', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					transcript,
					language: state.config.language
				})
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error ?? 'Summarization failed.';
				return;
			}

			if (!data.summary) {
				error = 'Invalid AI response from local model.';
				return;
			}

			state = {
				...state,
				summaryHistory: [
					...state.summaryHistory,
					{
						timestamp: Date.now(),
						source,
						sourcePosition: from,
						endPosition: to,
						result: data.summary
					}
				],
				lastSummarizedPosition: to
			};
			persist();
		} catch {
			error = 'Local LLM unavailable. Start Ollama or LM Studio and try again.';
		} finally {
			summarizing = false;
		}
	}

	function exportTranscript() {
		if (state.fullTranscript.length === 0) {
			error = 'Transcript is empty. Nothing to export.';
			return;
		}

		error = '';
		downloadTextFile(
			`voice-transcript-${Date.now()}.txt`,
			formatTranscriptTxt(state.fullTranscript)
		);
	}

	function exportSummaries() {
		if (state.summaryHistory.length === 0) {
			error = 'No summaries to export.';
			return;
		}

		error = '';
		downloadTextFile(
			`voice-summaries-${Date.now()}.json`,
			formatSummariesJson(state.summaryHistory),
			'application/json;charset=utf-8'
		);
	}

	function clearTranscript() {
		state = {
			...state,
			fullTranscript: [],
			lastSummarizedPosition: 0
		};
		persist();
		error = '';
	}

	function clearSummaries() {
		state = {
			...state,
			summaryHistory: []
		};
		persist();
		error = '';
	}

	function resetConversation() {
		state = {
			...state,
			fullTranscript: [],
			summaryHistory: [],
			lastSummarizedPosition: 0
		};
		persist();
		error = '';
	}
</script>

<svelte:head>
	<title>Voice AI · J.A.R.V.I.S.</title>
</svelte:head>

<div class="page">
	<header>
		<Mic size={20} />
		<div>
			<h1>Voice AI</h1>
			<p>Listen, transcribe, and summarize conversations with local AI.</p>
		</div>
	</header>

	<section class="controls-grid">
		<div class="field">
			<label for="output-language">Output language</label>
			<select
				id="output-language"
				value={state.config.language}
				onchange={(e) => setLanguage(/** @type {'en'|'ka'|'ru'} */ (e.currentTarget.value))}
			>
				{#each OUTPUT_LANGUAGES as lang (lang.code)}
					<option value={lang.code}>{lang.label}</option>
				{/each}
			</select>
		</div>

		<div class="field">
			<label for="auto-interval">Auto-summary interval</label>
			<select
				id="auto-interval"
				value={state.config.autoIntervalMs}
				onchange={(e) => setAutoInterval(Number(e.currentTarget.value))}
			>
				{#each AUTO_INTERVALS as interval (interval.ms)}
					<option value={interval.ms}>{interval.label}</option>
				{/each}
			</select>
		</div>
	</section>

	<VoiceRecorder
		mode='ollama'
		language={state.config.language}
		onchunk={handleChunk}
		onstatus={(s) => (listeningStatus = s)}
		onerror={handleRecorderError}
	/>

	<section class="actions">
		<button class="btn" onclick={() => summarize('manual')} disabled={summarizing || unsummarizedCount === 0}>
			<WandSparkles size={15} />
			{summarizing ? 'Summarizing…' : 'Summarize now'}
		</button>
		<button class="btn secondary" onclick={exportTranscript}>
			<Download size={15} />
			Export transcript (TXT)
		</button>
		<button class="btn secondary" onclick={exportSummaries}>
			<Download size={15} />
			Export summaries (JSON)
		</button>
	</section>

	<section class="actions danger">
		<button class="btn secondary" onclick={clearTranscript}>
			<Trash2 size={14} />
			Clear transcript
		</button>
		<button class="btn secondary" onclick={clearSummaries}>
			<Trash2 size={14} />
			Clear summaries
		</button>
		<button class="btn secondary" onclick={resetConversation}>
			<RotateCcw size={14} />
			Reset conversation
		</button>
	</section>

	{#if error}
		<p class="error">
			<AlertCircle size={14} />
			{error}
		</p>
	{/if}

	<section class="panel">
		<div class="panel-head">
			<h2>Full transcript</h2>
			<span>{state.fullTranscript.length} entries · {unsummarizedCount} unsummarized</span>
		</div>

		{#if state.fullTranscript.length === 0}
			<p class="empty">No transcript yet. Start listening to capture speech.</p>
		{:else}
			<ul class="transcript-list">
				{#each state.fullTranscript as entry, index (entry.timestamp + '-' + index)}
					<li>
						<time datetime={new Date(entry.timestamp).toISOString()}>
							{new Date(entry.timestamp).toLocaleString()}
						</time>
						<span class="lang">{entry.lang.toUpperCase()}</span>
						<p>{entry.text}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="panel">
		<div class="panel-head">
			<h2>Summary history</h2>
			<span>{state.summaryHistory.length} summaries</span>
		</div>

		{#if state.summaryHistory.length === 0}
			<p class="empty">No summaries yet. Use “Summarize now” or wait for auto-summary.</p>
		{:else}
			<div class="summary-list">
				{#each [...state.summaryHistory].reverse() as item, index (item.timestamp + '-' + index)}
					<article>
						<header>
							<strong>{item.source === 'auto' ? 'Auto summary' : 'Manual summary'}</strong>
							<time datetime={new Date(item.timestamp).toISOString()}>
								{new Date(item.timestamp).toLocaleString()}
							</time>
						</header>
						<dl>
							<div>
								<dt>Summary</dt>
								<dd>{item.result.summary}</dd>
							</div>
							<div>
								<dt>Interesting moments</dt>
								<dd>{item.result.interestingMoments}</dd>
							</div>
							<div>
								<dt>Notes</dt>
								<dd>{item.result.notes}</dd>
							</div>
							<div>
								<dt>Tasks</dt>
								<dd>{item.result.tasks}</dd>
							</div>
							<div>
								<dt>Reminders</dt>
								<dd>{item.result.reminders}</dd>
							</div>
							<div>
								<dt>Detected languages</dt>
								<dd>{item.result.detectedLanguages}</dd>
							</div>
						</dl>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.page {
		padding: var(--space-6);
		max-width: 1100px;
		display: grid;
		gap: var(--space-5);
	}

	header {
		display: flex;
		gap: 0.8rem;
		align-items: center;
		color: var(--text-primary);
	}

	h1 {
		margin: 0;
		font-size: var(--text-2xl);
	}

	header p,
	.empty {
		margin: 0.25rem 0 0;
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}

	.controls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: var(--space-3);
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}

	.field label {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.field select {
		border: 1px solid var(--surface-border);
		border-radius: var(--radius-md);
		background: var(--surface-card);
		color: var(--text-primary);
		padding: 0.65rem 0.75rem;
		font-size: var(--text-sm);
	}

	.actions {
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
		padding: 0.6rem 0.85rem;
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.btn.secondary {
		background: transparent;
		border: 1px solid var(--surface-border);
		color: var(--text-primary);
	}

	.error {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin: 0;
		color: var(--color-error-500);
		font-size: var(--text-sm);
	}

	.panel {
		border: 1px solid var(--surface-border);
		border-radius: var(--radius-lg);
		background: var(--surface-card);
		padding: var(--space-4);
		display: grid;
		gap: var(--space-3);
	}

	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-2);
	}

	.panel-head h2 {
		margin: 0;
		font-size: var(--text-base);
		color: var(--text-primary);
	}

	.panel-head span {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.transcript-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3);
		max-height: 420px;
		overflow-y: auto;
	}

	.transcript-list li {
		border-bottom: 1px solid var(--surface-border-subtle);
		padding-bottom: var(--space-2);
	}

	.transcript-list time,
	.transcript-list .lang {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		margin-right: var(--space-2);
	}

	.transcript-list p {
		margin: 0.35rem 0 0;
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.summary-list {
		display: grid;
		gap: var(--space-3);
	}

	.summary-list article {
		border: 1px solid var(--surface-border-subtle);
		border-radius: var(--radius-md);
		padding: var(--space-3);
	}

	.summary-list header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		margin-bottom: var(--space-2);
	}

	.summary-list dl {
		margin: 0;
		display: grid;
		gap: var(--space-2);
	}

	.summary-list dt {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.summary-list dd {
		margin: 0.15rem 0 0;
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	@media (max-width: 640px) {
		.page {
			padding: var(--space-4);
		}
	}
</style>
