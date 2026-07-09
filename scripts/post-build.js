#!/usr/bin/env node
/**
 * J.A.R.V.I.S. Post-Build Script
 * Runs after `npm run build` to update documentation and code graph.
 * Add to package.json: "postbuild": "node scripts/post-build.js"
 */

import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const timestamp = new Date().toISOString();

function run(cmd, label) {
  console.log(`\n[post-build] ${label}...`);
  try {
    const out = execSync(cmd, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    console.log(`[post-build] ✓ ${label}`);
    return out;
  } catch (err) {
    console.warn(`[post-build] ⚠ ${label} failed: ${err.message}`);
    return null;
  }
}

// 1. Run graphify if available
const graphOut = run('npx graphify . --output graphify-out --format json 2>&1 || npx -y graphify . --output graphify-out 2>&1', 'Graphify code graph');

// 2. Append to VALIDATION_REPORT.md
const validationPath = join(root, 'docs', 'VALIDATION_REPORT.md');
if (existsSync(validationPath)) {
  const entry = `\n## Auto-run: ${timestamp}\n\n- \`npm run build\`: ✅ Success\n- Graphify: ${graphOut ? '✅ Updated' : '⚠ Skipped (not installed)'}\n\n---\n`;
  const content = Buffer.from(entry);
  // Prepend to file after the first ---
  const existing = Buffer.from(readFileSync(validationPath, 'utf8'));
  const insertAt = existing.indexOf('---\n') + 4;
  writeFileSync(validationPath, existing.slice(0, insertAt).toString() + entry + existing.slice(insertAt).toString(), 'utf8');
  console.log('[post-build] ✓ Updated docs/VALIDATION_REPORT.md');
}

// 3. Append to SELF_IMPROVEMENT_LOG.md
const logPath = join(root, 'docs', 'SELF_IMPROVEMENT_LOG.md');
if (existsSync(logPath)) {
  appendFileSync(logPath, `\n## ${timestamp} — Automated Post-Build\n\n- Build: ✅\n- Graphify: ${graphOut ? '✅' : '⚠ skipped'}\n`);
  console.log('[post-build] ✓ Updated docs/SELF_IMPROVEMENT_LOG.md');
}

console.log('\n[post-build] Done ✓\n');
