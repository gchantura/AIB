#!/usr/bin/env node
/**
 * PostEdit manual fallback script.
 *
 * Native PostEdit hooks are NOT supported in the current Claude Code (Bolt)
 * environment. This script is the MANUAL FALLBACK — it should be called by
 * Claude after making significant code edits.
 *
 * Usage (Claude runs this after edits):
 *   node .claude/hooks/post-edit-checklist.js [changed-file-path]
 *
 * Or run manually:
 *   node .claude/hooks/post-edit-checklist.js src/routes/(jarvis)/dashboard/+page.svelte
 */

const changedFile = process.argv[2] || '(not specified)';

console.log('\n[JARVIS POST-EDIT CHECKLIST]');
console.log(`Changed file: ${changedFile}\n`);

const checks = [];

// Determine which docs need updating based on the changed path
if (changedFile.includes('src/routes/') && !changedFile.includes('api/')) {
  checks.push('[ ] Update docs/REPOSITORY_MAP.md — new route or page added/changed');
}

if (changedFile.includes('src/routes/api/')) {
  checks.push('[ ] Update docs/REPOSITORY_MAP.md — new API endpoint');
  checks.push('[ ] Update docs/TOOL_REGISTRY.md if this is a tool endpoint');
}

if (changedFile.includes('src/lib/jarvis/llm/')) {
  checks.push('[ ] Update docs/MODEL_PROVIDERS.md');
  checks.push('[ ] Update docs/ARCHITECTURE.md — LLM layer change');
}

if (changedFile.includes('src/lib/jarvis/memory/')) {
  checks.push('[ ] Update docs/MEMORY_SYSTEM.md');
}

if (changedFile.includes('.claude/skills/')) {
  checks.push('[ ] Update docs/SKILL_REGISTRY.md — skill changed');
}

if (changedFile.includes('src/lib/jarvis/tools/')) {
  checks.push('[ ] Update docs/TOOL_REGISTRY.md');
}

// Always-required checks
checks.push('[ ] Run: npm run build');
checks.push('[ ] Run: npm run ai:validate');
checks.push('[ ] Update docs/VALIDATION_REPORT.md with results');

console.log('Required post-edit actions:');
checks.forEach(c => console.log('  ' + c));

console.log('\nNative PostEdit hooks are not supported. These checks are manual.');
console.log('The documentation-engineer and validation-engineer skills enforce this workflow.\n');
