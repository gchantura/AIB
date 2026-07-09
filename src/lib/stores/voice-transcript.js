/** @typedef {'en' | 'ka' | 'ru'} VoiceLang */

/**
 * @typedef {object} TranscriptEntry
 * @property {number} timestamp
 * @property {string} text
 * @property {VoiceLang} lang
 */

/**
 * @typedef {object} SummaryResult
 * @property {string} summary
 * @property {string} interestingMoments
 * @property {string} notes
 * @property {string} tasks
 * @property {string} reminders
 * @property {string} detectedLanguages
 */

/**
 * @typedef {object} SummaryHistoryEntry
 * @property {number} timestamp
 * @property {'auto' | 'manual'} source
 * @property {number} sourcePosition
 * @property {number} endPosition
 * @property {SummaryResult} result
 */

/**
 * @typedef {object} VoiceConfig
 * @property {VoiceLang} language
 * @property {number} autoIntervalMs
 */

/**
 * @typedef {object} VoiceState
 * @property {TranscriptEntry[]} fullTranscript
 * @property {SummaryHistoryEntry[]} summaryHistory
 * @property {VoiceConfig} config
 * @property {number} lastSummarizedPosition
 */

const STORAGE_KEY = 'jarvis_voice_state';

export const AUTO_INTERVALS = [
	{ label: '1 minute', ms: 60_000 },
	{ label: '5 minutes', ms: 300_000 },
	{ label: '10 minutes', ms: 600_000 }
];

export const OUTPUT_LANGUAGES = [
	{ code: 'ka', label: 'Georgian' },
	{ code: 'en', label: 'English' },
	{ code: 'ru', label: 'Russian' }
];

export const SPEECH_LANG_MAP = {
	en: 'en-US',
	ka: 'ka-GE',
	ru: 'ru-RU'
};

/** @returns {VoiceState} */
export function defaultVoiceState() {
	return {
		fullTranscript: [],
		summaryHistory: [],
		config: { language: 'en', autoIntervalMs: 300_000 },
		lastSummarizedPosition: 0
	};
}

/** @returns {VoiceState} */
export function loadVoiceState() {
	if (typeof localStorage === 'undefined') return defaultVoiceState();

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultVoiceState();

		const parsed = JSON.parse(raw);
		const defaults = defaultVoiceState();

		return {
			fullTranscript: Array.isArray(parsed.fullTranscript) ? parsed.fullTranscript : [],
			summaryHistory: Array.isArray(parsed.summaryHistory) ? parsed.summaryHistory : [],
			config: {
				language: parsed.config?.language ?? defaults.config.language,
				autoIntervalMs: parsed.config?.autoIntervalMs ?? defaults.config.autoIntervalMs
			},
			lastSummarizedPosition:
				typeof parsed.lastSummarizedPosition === 'number' ? parsed.lastSummarizedPosition : 0
		};
	} catch {
		return defaultVoiceState();
	}
}

/** @param {VoiceState} state */
export function saveVoiceState(state) {
	if (typeof localStorage === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (e) {
		console.error('Failed to save voice state:', e);
	}
}

/** @param {TranscriptEntry[]} transcript */
export function formatTranscriptTxt(transcript) {
	let output = '--- Full Conversation Transcript ---\n\n';
	for (const entry of transcript) {
		const time = new Date(entry.timestamp).toLocaleString();
		output += `[${time} | ${entry.lang.toUpperCase()}] ${entry.text}\n`;
	}
	return output;
}

/** @param {SummaryHistoryEntry[]} history */
export function formatSummariesJson(history) {
	return JSON.stringify(history, null, 2);
}

/** @param {string} filename @param {string} content @param {string} mime */
export function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

/** @param {TranscriptEntry[]} transcript @param {number} from @param {number} [to] */
export function transcriptSliceText(transcript, from, to = transcript.length) {
	return transcript
		.slice(from, to)
		.map((entry) => `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.text}`)
		.join('\n');
}
