#!/usr/bin/env node
/**
 * PreCommand hook: Detect and block or warn about destructive commands.
 * Called before terminal/bash command execution.
 */

const command = process.argv.slice(2).join(' ');

const DESTRUCTIVE_PATTERNS = [
  /\brm\s+-rf?\b/,
  /\brmdir\b/,
  /DROP\s+TABLE/i,
  /TRUNCATE\s+TABLE/i,
  /DELETE\s+FROM\s+\w+\s*;?\s*$/i,
  /git\s+push\s+--force/,
  /git\s+reset\s+--hard/,
  /chmod\s+777/,
  /curl\s+.*\|\s*bash/,
  /wget\s+.*\|\s*sh/,
  /npm\s+publish/,
  /npx\s+publish/,
  /sudo\s+rm/,
];

const INSTALL_PATTERNS = [
  /npm\s+install\b/,
  /npm\s+i\b/,
  /npx\s+[^@-]/,
];

const isDestructive = DESTRUCTIVE_PATTERNS.some(p => p.test(command));
const isInstall = INSTALL_PATTERNS.some(p => p.test(command));

if (isDestructive) {
  console.error('[JARVIS SAFETY] BLOCKED: Destructive command detected.');
  console.error('[JARVIS SAFETY] Command:', command);
  console.error('[JARVIS SAFETY] This requires Level 3 explicit user approval.');
  console.error('[JARVIS SAFETY] Ask the user: "This action requires explicit approval: [description]. Confirm?"');
  process.exit(1);
}

if (isInstall) {
  console.warn('[JARVIS SAFETY] WARNING: Package installation detected.');
  console.warn('[JARVIS SAFETY] Command:', command);
  console.warn('[JARVIS SAFETY] This requires Level 2 confirmation. Inform user before proceeding.');
}
