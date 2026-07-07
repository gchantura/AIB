const fs = require('fs');
const path = require('path');

// All project files (excludes node_modules, .git, .svelte-kit, build, dist)
const allFiles = [
  '.claude/agents/AGENTS.md', '.claude/commands/README.md',
  '.claude/hooks/post-edit-checklist.js', '.claude/hooks/pre-command-guard.js',
  '.claude/hooks/pre-search-reminder.js', '.claude/hooks/secret-guard.js',
  '.claude/hooks/session-end-protocol.js', '.claude/settings.local.json',
  '.claude/skills/ai-researcher/SKILL.md', '.claude/skills/app-factory-engineer/SKILL.md',
  '.claude/skills/automation-engineer/SKILL.md', '.claude/skills/coding-agent-engineer/SKILL.md',
  '.claude/skills/documentation-engineer/SKILL.md', '.claude/skills/graphify-navigator/SKILL.md',
  '.claude/skills/memory-engineer/SKILL.md', '.claude/skills/model-provider-engineer/SKILL.md',
  '.claude/skills/safety-guardian/SKILL.md', '.claude/skills/senior-ai-engineer-coach/SKILL.md',
  '.claude/skills/skill-generator/SKILL.md', '.claude/skills/svelte-architect/SKILL.md',
  '.claude/skills/svelte-ui-engineer/SKILL.md', '.claude/skills/tool-factory-engineer/SKILL.md',
  '.claude/skills/validation-engineer/SKILL.md', '.codex/config.toml',
  '.cursor/mcp.json', '.gemini/settings.json', '.gitignore',
  '.jarvis/workspace.json', '.mcp.json', '.npmrc',
  '.opencode/opencode.json', '.opencode/svelte.json', '.understand-anything/.understandignore',
  '.vscode/extensions.json', '.vscode/mcp.json', '.vscode/settings.json',
  'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'README.md',
  'docs/ARCHITECTURE.md', 'docs/JARVIS_CONSTITUTION.md', 'docs/MEMORY_SYSTEM.md',
  'docs/MODEL_PROVIDERS.md', 'docs/REPOSITORY_INTELLIGENCE.md', 'docs/REPOSITORY_MAP.md',
  'docs/ROADMAP.md', 'docs/SAFETY_POLICY.md', 'docs/SELF_IMPROVEMENT_LOG.md',
  'docs/SKILL_REGISTRY.md', 'docs/TOOL_REGISTRY.md', 'docs/VALIDATION_REPORT.md',
  'jsconfig.json', 'package-lock.json', 'package.json',
  'scripts/ai/validate.js', 'src/app.html', 'src/hooks.server.ts',
  'src/lib/index.js', 'src/lib/jarvis/automation/runtime.ts',
  'src/lib/jarvis/briefing/runtime.ts', 'src/lib/jarvis/core/store.ts',
  'src/lib/jarvis/core/types.ts', 'src/lib/jarvis/evaluation/runtime.ts',
  'src/lib/jarvis/evaluation/upgrades.ts', 'src/lib/jarvis/intelligence/runtime.ts',
  'src/lib/jarvis/llm/config.ts', 'src/lib/jarvis/llm/errors.ts',
  'src/lib/jarvis/llm/providers/anthropic.ts', 'src/lib/jarvis/llm/providers/ollama.ts',
  'src/lib/jarvis/llm/providers/openai-compatible.ts', 'src/lib/jarvis/llm/router.ts',
  'src/lib/jarvis/llm/types.ts', 'src/lib/jarvis/memory/api.ts',
  'src/lib/jarvis/memory/relevance.ts', 'src/lib/jarvis/memory/types.ts',
  'src/lib/jarvis/safety/runtime.ts', 'src/lib/jarvis/skills/runtime.ts',
  'src/lib/jarvis/tools/runtime.ts', 'src/lib/styles/tokens.css',
  'src/lib/supabase.server.ts', 'src/lib/supabase.ts',
  'src/routes/(jarvis)/+layout.svelte', 'src/routes/(jarvis)/automations/+page.svelte',
  'src/routes/(jarvis)/briefing/+page.svelte', 'src/routes/(jarvis)/calendar/+page.svelte',
  'src/routes/(jarvis)/chat/+page.svelte', 'src/routes/(jarvis)/coding/+page.svelte',
  'src/routes/(jarvis)/dashboard/+page.svelte', 'src/routes/(jarvis)/docs/+page.svelte',
  'src/routes/(jarvis)/evaluation/+page.svelte', 'src/routes/(jarvis)/learning/+page.svelte',
  'src/routes/(jarvis)/memory/+page.svelte', 'src/routes/(jarvis)/repository/+page.svelte',
  'src/routes/(jarvis)/research/+page.svelte', 'src/routes/(jarvis)/safety/+page.svelte',
  'src/routes/(jarvis)/settings/+page.svelte', 'src/routes/(jarvis)/skills/+page.svelte',
  'src/routes/(jarvis)/tools/+page.svelte', 'src/routes/+layout.svelte',
  'src/routes/+page.svelte', 'src/routes/layout.css',
  'src/routes/api/automations/run/+server.ts', 'src/routes/api/chat/+server.ts',
  'src/routes/api/conversations/+server.ts', 'src/routes/api/evaluation/+server.ts',
  'src/routes/api/intelligence/briefing/+server.ts', 'src/routes/api/intelligence/coding/+server.ts',
  'src/routes/api/intelligence/research/+server.ts', 'src/routes/api/memory/+server.ts',
  'src/routes/api/memory/[id]/+server.ts', 'src/routes/api/models/+server.ts',
  'src/routes/api/notifications/+server.ts', 'src/routes/api/repository/+server.ts',
  'src/routes/api/safety/+server.ts', 'src/routes/api/skills/+server.ts',
  'src/routes/api/tools/+server.ts', 'src/routes/api/upgrades/+server.ts',
  'src/routes/api/workspace/+server.ts',
  'static/favicon.svg', 'supabase/migrations/20260707114040_create_memory_tables.sql',
  'svelte.config.js', 'vite.config.js'
];

function getLang(p) {
  if (p.endsWith('.ts') || p.endsWith('.svelte.ts')) return 'typescript';
  if (p.endsWith('.js') || p.endsWith('.svelte.js')) return 'javascript';
  if (p.endsWith('.svelte')) return 'svelte';
  if (p.endsWith('.css')) return 'css';
  if (p.endsWith('.sql')) return 'sql';
  if (p.endsWith('.md')) return 'markdown';
  if (p.endsWith('.json')) return 'json';
  if (p.endsWith('.toml')) return 'toml';
  if (p.endsWith('.svg')) return 'svg';
  if (p.endsWith('.html')) return 'html';
  if (p.startsWith('.env') || p === '.gitignore' || p === '.npmrc') return 'dotenv';
  return 'unknown';
}

function getCat(p) {
  if (/^\.claude\/skills\//.test(p)) return 'docs';
  if (/^\.claude\/hooks\//.test(p)) return 'code';
  if (/^\.claude\/agents\//.test(p) || /^\.claude\/commands\//.test(p)) return 'docs';
  if (/^docs\//.test(p) && p.endsWith('.md')) return 'docs';
  if (/^AGENTS\.md$|README\.md$|^GEMINI\.md$|^CLAUDE\.md$/.test(p)) return 'docs';
  if (/^src\/routes\/.*\.svelte$/.test(p)) return 'markup';
  if (/^src\/routes\/layout\.css$/.test(p)) return 'code';
  if (p.endsWith('.css')) return 'code';
  if (p.endsWith('.sql')) return 'data';
  if (/^src\/lib\//.test(p)) return 'code';
  if (/^src\/routes\/api\//.test(p)) return 'code';
  if (/^src\/hooks\.server$/.test(p) || p === 'src/app.html') return 'markup';
  if (/^scripts\//.test(p)) return 'script';
  if (p === 'package.json' || p === 'svelte.config.js' || p === 'vite.config.js' || p === 'jsconfig.json' || p === 'package-lock.json') return 'config';
  if (/^\.mcp\.json$|^\.vscode\/.*$|^\.cursor\/.*$|^\.gemini\/.*$|^\.opencode\/.*$|^\.codex\/.*$/.test(p)) return 'config';
  if (p === '.gitignore' || p === '.npmrc') return 'config';
  if (/^static\//.test(p)) return 'markup';
  if (/^supabase\//.test(p)) return 'data';
  if (/^\.understand-anything\//.test(p)) return 'other';
  return 'config'; // .jarvis, etc.
}

const files = [];
const importMap = {};

for (const f of allFiles) {
  const abs = path.resolve(f);
  let sizeLines = 10;
  try { sizeLines = Math.max(5, fs.statSync(abs).size / 80); } catch {}
  files.push({ path: f, language: getLang(f), sizeLines: Math.round(sizeLines), fileCategory: getCat(f) });
  importMap[f] = [];
}

const result = {
  project: { name: 'Super J.A.R.V.I.S.', description: 'A local-first personal AI workspace built with SvelteKit 2 and Svelte 5. Combines model-agnostic chat, persistent memory, tasks, notes, projects, calendar events, research dossiers, skills, tools, automations, repository intelligence, learning, and an audit trail.', version: '0.0.1', package_manager: 'npm' },
  frameworks_and_languages: { primary_framework: { name: 'SvelteKit 2.x + Svelte 5', version: '@sveltejs/kit ^2.63.0, svelte ^5.56.1' }, build_tool: { name: 'Vite', version: '^8.0.16' } },
  languages: ['typescript', 'javascript', 'svelte', 'css', 'sql', 'markdown', 'json', 'toml', 'html', 'svg'],
  frameworks: ['SvelteKit', 'Svelte 5', 'Tailwind CSS v4', 'Supabase'],
  files,
  importMap,
  scan_metadata: { totalFiles: allFiles.length }
};

fs.writeFileSync('.understand-anything/intermediate/scan-result.json', JSON.stringify(result, null, 2));
console.log('Written ' + files.length + ' files to scan-result.json');
