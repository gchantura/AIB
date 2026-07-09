import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export type VoiceLang = 'en' | 'ka' | 'ru';

export interface SummaryResult {
	summary: string;
	interestingMoments: string;
	notes: string;
	tasks: string;
	reminders: string;
	detectedLanguages: string;
}

export interface SummaryEntry {
	timestamp: number;
	source: 'auto' | 'manual';
	sourcePosition: number;
	endPosition: number;
	result: SummaryResult;
}

export interface VoiceFileState {
	language: VoiceLang;
	autoIntervalMs: number;
	lastSummarizedPosition: number;
}

const VOICE_DIR = join(process.cwd(), '.jarvis', 'voice');
const TRANSCRIPT_PATH = join(VOICE_DIR, 'transcript.txt');
const SUMMARIES_PATH = join(VOICE_DIR, 'summaries.json');
const STATE_PATH = join(VOICE_DIR, 'state.json');

const DEFAULT_STATE: VoiceFileState = {
	language: 'en',
	autoIntervalMs: 300_000,
	lastSummarizedPosition: 0
};

export const VOICE_DIR_PATH = VOICE_DIR;

async function ensureDir() {
	await mkdir(VOICE_DIR, { recursive: true });
}

export async function readTranscript(): Promise<string> {
	await ensureDir();
	try {
		return await readFile(TRANSCRIPT_PATH, 'utf8');
	} catch {
		return '';
	}
}

export async function appendTranscriptLine(text: string): Promise<string> {
	await ensureDir();
	const line = `[${new Date().toISOString()}] ${text.trim()}\n`;
	await appendFile(TRANSCRIPT_PATH, line, 'utf8');
	return line;
}

export async function readSummaries(): Promise<SummaryEntry[]> {
	await ensureDir();
	try {
		const raw = await readFile(SUMMARIES_PATH, 'utf8');
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export async function writeSummaries(entries: SummaryEntry[]) {
	await ensureDir();
	await writeFile(SUMMARIES_PATH, JSON.stringify(entries, null, 2), 'utf8');
}

export async function readVoiceState(): Promise<VoiceFileState> {
	await ensureDir();
	try {
		const raw = await readFile(STATE_PATH, 'utf8');
		const parsed = JSON.parse(raw) as Partial<VoiceFileState>;
		return {
			language: parsed.language ?? DEFAULT_STATE.language,
			autoIntervalMs: parsed.autoIntervalMs ?? DEFAULT_STATE.autoIntervalMs,
			lastSummarizedPosition: parsed.lastSummarizedPosition ?? 0
		};
	} catch {
		return { ...DEFAULT_STATE };
	}
}

export async function writeVoiceState(state: VoiceFileState) {
	await ensureDir();
	await writeFile(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

export async function clearTranscriptFile() {
	await ensureDir();
	await writeFile(TRANSCRIPT_PATH, '', 'utf8');
}

export async function clearSummariesFile() {
	await writeSummaries([]);
}

export async function getUnsummarizedText(state: VoiceFileState) {
	const transcript = await readTranscript();
	return transcript.slice(state.lastSummarizedPosition).trim();
}

export async function loadVoiceSnapshot() {
	const [transcript, summaryHistory, config] = await Promise.all([
		readTranscript(),
		readSummaries(),
		readVoiceState()
	]);

	return { transcript, summaryHistory, config };
}
