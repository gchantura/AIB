#!/usr/bin/env node
/**
 * J.A.R.V.I.S. AI Validation Suite
 * Run with: npm run ai:validate
 * 
 * Checks:
 * 1. CLAUDE.md exists
 * 2. docs/REPOSITORY_MAP.md exists
 * 3. docs/SELF_IMPROVEMENT_LOG.md exists and has entries
 * 4. All .claude/skills/ directories have SKILL.md
 * 5. docs/SKILL_REGISTRY.md references all skills
 * 6. docs/TOOL_REGISTRY.md exists
 * 7. No hardcoded secret patterns in src/
 * 8. No protected paths accidentally created
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, hint = '') {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}${hint ? ` — ${hint}` : ''}`);
    failed++;
    failures.push(name);
  }
}

function fileExists(rel) {
  return existsSync(join(ROOT, rel));
}

function readFile(rel) {
  try {
    return readFileSync(join(ROOT, rel), 'utf8');
  } catch {
    return '';
  }
}

function getDirs(rel) {
  try {
    const p = join(ROOT, rel);
    return readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
  } catch {
    return [];
  }
}

console.log('\nJ.A.R.V.I.S. AI Validation Suite\n');

// 1. Core files
console.log('1. Core operating files');
check('CLAUDE.md exists', fileExists('CLAUDE.md'));
check('docs/REPOSITORY_MAP.md exists', fileExists('docs/REPOSITORY_MAP.md'));
check('docs/SELF_IMPROVEMENT_LOG.md exists', fileExists('docs/SELF_IMPROVEMENT_LOG.md'));
check('docs/SAFETY_POLICY.md exists', fileExists('docs/SAFETY_POLICY.md'));
check('docs/ARCHITECTURE.md exists', fileExists('docs/ARCHITECTURE.md'));
check('docs/ROADMAP.md exists', fileExists('docs/ROADMAP.md'));

// 2. Self-improvement log has entries
console.log('\n2. Self-improvement log');
const logContent = readFile('docs/SELF_IMPROVEMENT_LOG.md');
check('Log has at least one entry', logContent.includes('## 20'), 'Add a dated entry');

// 3. Skills
console.log('\n3. Skill system');
const skillDirs = getDirs('.claude/skills');
check('At least 10 skills exist', skillDirs.length >= 10, `Found ${skillDirs.length}`);

for (const skillDir of skillDirs) {
  check(
    `Skill ${skillDir} has SKILL.md`,
    fileExists(`.claude/skills/${skillDir}/SKILL.md`)
  );
}

// 4. Skill registry consistency
console.log('\n4. Skill registry consistency');
const skillRegistry = readFile('docs/SKILL_REGISTRY.md');
for (const skillDir of skillDirs) {
  check(
    `${skillDir} in SKILL_REGISTRY.md`,
    skillRegistry.includes(skillDir),
    'Add to docs/SKILL_REGISTRY.md'
  );
}

// 5. Tool registry
console.log('\n5. Tool registry');
check('docs/TOOL_REGISTRY.md exists', fileExists('docs/TOOL_REGISTRY.md'));

// 6. Secret patterns in src/
console.log('\n6. Secret pattern scan (src/)');
const SECRET_PATTERNS = [
  { pattern: /sk-[A-Za-z0-9]{20,}/, name: 'OpenAI API key' },
  { pattern: /xoxb-[A-Za-z0-9-]{20,}/, name: 'Slack token' },
  { pattern: /ghp_[A-Za-z0-9]{36}/, name: 'GitHub PAT' },
  { pattern: /AIza[0-9A-Za-z-_]{35}/, name: 'Google API key' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS key' },
];

function scanDirForSecrets(dirPath, relPath) {
  if (!existsSync(dirPath)) return;
  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    const full = join(dirPath, entry);
    const rel = `${relPath}/${entry}`;
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (!['node_modules', '.svelte-kit', '.git', 'dist'].includes(entry)) {
          scanDirForSecrets(full, rel);
        }
      } else if (entry.endsWith('.ts') || entry.endsWith('.svelte') || entry.endsWith('.js')) {
        const content = readFileSync(full, 'utf8');
        for (const { pattern, name } of SECRET_PATTERNS) {
          if (pattern.test(content)) {
            check(`No ${name} in ${rel}`, false, 'Remove secret from source file');
          }
        }
      }
    } catch {}
  }
}

scanDirForSecrets(join(ROOT, 'src'), 'src');
check('Secret scan of src/ complete', true);

// 7. Protected paths not accidentally created
console.log('\n7. Protected path check');
const protectedPaths = [
  'secrets', 'credentials', 'keys', 'private', 'production', 'backups',
  'customer-data', 'personal-data'
];
for (const p of protectedPaths) {
  if (existsSync(join(ROOT, p))) {
    check(`Protected path /${p} not created`, false, 'This path requires explicit approval');
  }
}
check('Protected paths check complete', true);

// Summary
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error('\nFailed checks:');
  failures.forEach(f => console.error(`  - ${f}`));
  console.error('\nFix all failures before proceeding.\n');
  process.exit(1);
} else {
  console.log('\nAll validation checks passed.\n');
  process.exit(0);
}
