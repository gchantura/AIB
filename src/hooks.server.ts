import type { Handle } from '@sveltejs/kit';
import { startScheduler } from '$lib/jarvis/automation/runtime.js';

startScheduler();
export const handle: Handle = async ({ event, resolve }) => resolve(event);
