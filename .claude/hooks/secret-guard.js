#!/usr/bin/env node
/**
 * Secret guard: Scan file content for secret patterns before writing.
 * Pass file content via stdin or as argument.
 */

let content = '';

if (process.stdin.isTTY) {
  content = process.argv.slice(2).join(' ');
} else {
  const chunks = [];
  process.stdin.on('data', chunk => chunks.push(chunk));
  process.stdin.on('end', () => {
    content = chunks.join('');
    checkSecrets(content);
  });
  return;
}

checkSecrets(content);

function checkSecrets(text) {
  const SECRET_PATTERNS = [
    { pattern: /sk-[A-Za-z0-9]{20,}/, name: 'OpenAI API key' },
    { pattern: /xoxb-[A-Za-z0-9-]{20,}/, name: 'Slack bot token' },
    { pattern: /ghp_[A-Za-z0-9]{36}/, name: 'GitHub personal access token' },
    { pattern: /AIza[0-9A-Za-z-_]{35}/, name: 'Google API key' },
    { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS access key ID' },
    { pattern: /[A-Za-z0-9+/]{40}=/, name: 'Possible base64 secret' },
  ];

  const found = SECRET_PATTERNS.filter(({ pattern }) => pattern.test(text));

  if (found.length > 0) {
    console.error('[JARVIS SECRET GUARD] Potential secrets detected:');
    found.forEach(({ name }) => console.error(`  - ${name}`));
    console.error('[JARVIS SECRET GUARD] BLOCKED: Do not write secrets to files.');
    console.error('[JARVIS SECRET GUARD] Store secrets in .env files only.');
    process.exit(1);
  }
}
