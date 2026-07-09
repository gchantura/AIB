import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { env } from '$env/dynamic/private';
import { getLLMConfig } from '$lib/jarvis/llm/config.js';
import { getRouter, resetRouter } from '$lib/jarvis/llm/router.js';
import { LLMError } from '$lib/jarvis/llm/errors.js';

const LANG_NAMES: Record<string, string> = {
	en: 'English',
	ka: 'Georgian',
	ru: 'Russian'
};

const REQUIRED_FIELDS = [
	'summary',
	'interestingMoments',
	'notes',
	'tasks',
	'reminders',
	'detectedLanguages'
] as const;

type SummaryField = (typeof REQUIRED_FIELDS)[number];
type SummaryPayload = Record<SummaryField, string>;

function buildPrompt(transcript: string, language: string) {
	const langName = LANG_NAMES[language] ?? 'English';

	return `You summarize spoken conversation transcripts.

Write ALL output fields in ${langName}.

Return ONLY valid JSON with exactly these string fields:
- summary
- interestingMoments
- notes
- tasks
- reminders
- detectedLanguages

Transcript:
${transcript}`;
}

function extractJsonObject(content: string): unknown {
	const trimmed = content.trim();

	try {
		return JSON.parse(trimmed);
	} catch {
		const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
		if (fenced?.[1]) return JSON.parse(fenced[1].trim());

		const start = trimmed.indexOf('{');
		const end = trimmed.lastIndexOf('}');
		if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));

		throw new Error('Model did not return valid JSON.');
	}
}

function normalizeSummaryPayload(raw: unknown, language: string): SummaryPayload {
	if (!raw || typeof raw !== 'object') {
		throw new Error('Invalid AI response format.');
	}

	const source = raw as Record<string, unknown>;
	const result = {} as SummaryPayload;

	for (const field of REQUIRED_FIELDS) {
		const value = source[field];
		if (typeof value !== 'string' || !value.trim()) {
			throw new Error(`Invalid AI response: missing or empty "${field}".`);
		}
		result[field] = value.trim();
	}

	if (!result.detectedLanguages) {
		result.detectedLanguages = LANG_NAMES[language] ?? language;
	}

	return result;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: { transcript?: string; language?: string };

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body.' }, { status: 400 });
	}

	const transcript = body.transcript?.trim();
	const language = body.language?.trim();

	if (!transcript) {
		return json({ error: 'Transcript is empty. Nothing to summarize.' }, { status: 400 });
	}

	if (!language || !LANG_NAMES[language]) {
		return json({ error: 'Invalid or missing output language.' }, { status: 400 });
	}

	resetRouter();
	const router = getRouter(getLLMConfig(env));

	try {
		const response = await router.chat(
			{
				model: '',
				messages: [
					{
						role: 'system',
						content:
							'You are a conversation analyst. Respond with strict JSON only. Do not wrap JSON in markdown unless necessary.'
					},
					{ role: 'user', content: buildPrompt(transcript, language) }
				],
				temperature: 0.2
			},
			'summarize'
		);

		const parsed = extractJsonObject(response.content);
		const summary = normalizeSummaryPayload(parsed, language);

		return json({ summary, model: response.model });
	} catch (error) {
		const message =
			error instanceof LLMError
				? error.message
				: error instanceof Error
					? error.message
					: 'Summarization failed.';

		const status = error instanceof LLMError ? 503 : 502;
		return json({ error: message }, { status });
	}
};
