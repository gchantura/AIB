const fs = require('fs');
const scan = JSON.parse(fs.readFileSync('.understand-anything/intermediate/scan-result.json', 'utf8'));

const files = [];
const importMap = {};

for (const [category, items] of Object.entries(scan.file_categories || {})) {
  for (const item of items) {
    const path = item.path;
    if (!path || path.endsWith('/')) continue;

    let fileCategory = 'other';
    switch (category) {
      case 'routes_ui': fileCategory = 'markup'; break;
      case 'api_routes': fileCategory = 'code'; break;
      case 'lib_core':
        if (path.endsWith('.sql')) fileCategory = 'data';
        else if (path.endsWith('.css')) fileCategory = 'code';
        else fileCategory = 'code';
        break;
      case 'supabase_migrations': fileCategory = 'data'; break;
      case 'documentation': fileCategory = 'docs'; break;
      case 'claude_skills': fileCategory = 'docs'; break;
      case 'claude_hooks': fileCategory = 'code'; break;
      case 'scripts': fileCategory = 'script'; break;
      case 'static_assets': fileCategory = 'markup'; break;
      case 'configuration': fileCategory = 'config'; break;
      case 'ide_ai_configs': fileCategory = 'config'; break;
      case 'deploy_config': fileCategory = 'infra'; break;
    }

    let language = 'unknown';
    if (path.endsWith('.ts') || path.endsWith('.svelte.ts')) language = 'typescript';
    else if (path.endsWith('.js') || path.endsWith('.svelte.js')) language = 'javascript';
    else if (path.endsWith('.svelte')) language = 'svelte';
    else if (path.endsWith('.css')) language = 'css';
    else if (path.endsWith('.sql')) language = 'sql';
    else if (path.endsWith('.md')) language = 'markdown';
    else if (path.endsWith('.json')) language = 'json';
    else if (path.endsWith('.toml')) language = 'toml';
    else if (path.endsWith('.svg')) language = 'svg';
    else if (path.match(/^\.env/)) language = 'dotenv';

    let sizeLines = 10;
    try { const stat = fs.statSync(path); sizeLines = Math.max(5, Math.round(stat.size / 80)); } catch {}

    files.push({ path, language, sizeLines, fileCategory });
    importMap[path] = [];
  }
}

const result = {
  project: scan.project,
  frameworks_and_languages: scan.frameworks_and_languages,
  dependencies: scan.dependencies,
  language_distribution: scan.language_distribution,
  file_categories: scan.file_categories,
  files,
  importMap,
  scan_metadata: scan.scan_metadata
};

fs.writeFileSync('.understand-anything/intermediate/scan-result.json', JSON.stringify(result, null, 2));
console.log('Converted ' + files.length + ' files');
