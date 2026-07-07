import json, os
from datetime import datetime, timezone

with open('.understand-anything/intermediate/assembled-graph.json') as f:
    graph = json.load(f)

def assign_layer(n):
    fp = n.get('filePath', '')
    nid = n['id']
    if '/lib/jarvis/' in fp and '/llm/' not in fp and '/core/' not in fp:
        return 'layer:jv-engine'
    if '/jarvis/core/' in fp or nid == 'lib-index':
        return 'layer:foundation-core'
    if '/styles/tokens.css' in fp:
        return 'layer:foundation-core'
    if '/jarvis/llm/' in fp:
        return 'layer:llm-provider'
    if '+server.ts' in fp and '/api/' in fp:
        return 'layer:api-server'
    if '/claude/skills/' in fp or '/claude/hooks/' in fp or '/claude/agents/' in fp:
        return 'layer:agent-skill'
    if fp in ['AGENTS.md', 'CLAUDE.md', 'README.md', 'GEMINI.md']:
        return 'layer:agent-skill'
    if 'supabase/migrations/' in fp or '.jarvis/' in fp:
        return 'layer:data-storage'
    return 'layer:infrastructure'

layers_info = {
    'layer:infrastructure': ('Infrastructure', 'Build configuration, package management, IDE tooling, and static assets.'),
    'layer:foundation-core': ('Foundation/Core', 'Core types, global state stores, design tokens, Supabase clients.'),
    'layer:llm-provider': ('LLM Provider Router', 'Model-agnostic LLM adapters — Ollama, OpenAI-compatible, Anthropic plus router.'),
    'layer:jv-engine': ('JARVIS Engine', 'Core JARVIS business logic — memory, intelligence, safety, skills, tools, automation, evaluation, briefing.'),
    'layer:api-server': ('API/Server Endpoints', 'SvelteKit HTTP routes wrapping JARVIS Engine modules.'),
    'layer:ui-frontend': ('UI/Frontend', 'Svelte pages and layouts consuming API endpoints.'),
    'layer:agent-skill': ('Agent/Skill System', 'Claude Code agent definitions, skill specs, hooks.'),
    'layer:data-storage': ('Data/Storage', 'Database migrations and local workspace state.')
}

layer_nodes = {lid: [] for lid in layers_info}
for n in graph['nodes']:
    lid = assign_layer(n)
    if n['id'] not in layer_nodes[lid]:
        layer_nodes[lid].append(n['id'])

result_layers = []
for lid, (name, desc) in layers_info.items():
    if layer_nodes.get(lid):
        result_layers.append({'id': lid, 'name': name, 'description': desc, 'nodeIds': layer_nodes[lid]})

graph['layers'] = result_layers
graph['tour'] = []
if 'version' not in graph:
    graph['version'] = '1.0.0'
if 'project' not in graph:
    graph['project'] = {}
graph['project'].update({
    'name': 'Super J.A.R.V.I.S.',
    'description': 'A local-first personal AI workspace built with SvelteKit 2 and Svelte 5.',
    'languages': ['typescript', 'javascript', 'svelte', 'css', 'sql', 'markdown'],
    'frameworks': ['SvelteKit', 'Svelte 5', 'Tailwind CSS v4', 'Supabase'],
    'analyzedAt': datetime.now(timezone.utc).isoformat(),
    'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38'
})

with open('.understand-anything/knowledge-graph.json', 'w') as f:
    json.dump(graph, f, indent=2)

node_types = {}
for n in graph['nodes']:
    t = n.get('type', 'unknown')
    node_types[t] = node_types.get(t, 0) + 1

edge_types = {}
for e in graph['edges']:
    t = e.get('type', 'unknown')
    edge_types[t] = edge_types.get(t, 0) + 1

cat_counts = {}
for n in graph['nodes']:
    fp = n.get('filePath', '')
    if '/claude/skills/' in fp:
        c = 'skills'
    elif '/claude/hooks/' in fp or '/claude/agents/' in fp:
        c = 'hooks/agents'
    elif '.vscode' in fp or '.cursor' in fp or '.gemini' in fp or '.opencode' in fp or '.codex' in fp:
        c = 'ide configs'
    elif fp == '.gitignore' or fp == '.npmrc':
        c = 'project config'
    elif '/docs/' in fp or (fp.endswith('.md') and 'CLAUDE' not in fp):
        c = 'docs'
    elif fp in ['AGENTS.md', 'README.md']:
        c = 'root docs'
    elif '/api/' in fp:
        c = 'api routes'
    elif '+page.svelte' in fp or '+layout.svelte' in fp:
        c = 'svelte pages'
    elif '/lib/jarvis/' in fp:
        c = 'core modules'
    elif fp.endswith('.sql'):
        c = 'database'
    elif '.jarvis/' in fp:
        c = 'workspace data'
    else:
        c = 'other'
    cat_counts[c] = cat_counts.get(c, 0) + 1

meta = {
    'lastAnalyzedAt': datetime.now(timezone.utc).isoformat(),
    'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38',
    'version': '1.0.0',
    'analyzedFiles': len(graph['nodes'])
}
with open('.understand-anything/meta.json', 'w') as f:
    json.dump(meta, f, indent=2)

print('KNOWLEDGE GRAPH SUMMARY')
print('='*50)
print(f'Project: Super J.A.R.V.I.S.')
print(f'Files analyzed: {len(graph["nodes"])} of ~123')
print()
print(f'Total nodes: {len(graph["nodes"])}')
print('Node types:')
for t, c in sorted(node_types.items(), key=lambda x: -x[1]):
    print(f'  {t}: {c}')
print()
print(f'Total edges: {len(graph["edges"])}')
print('Edge types:')
for t, c in sorted(edge_types.items(), key=lambda x: -x[1]):
    print(f'  {t}: {c}')
print()
print('File categories:')
for c, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f'  {c}: {cnt}')
print()
print('Layers:')
for l in result_layers:
    print(f'  {l["name"]}: {len(l["nodeIds"])} nodes')
print()
print('WARNINGS:')
print('  - Batch 7 (UI/Frontend — ~32 Svelte pages) was never created due to qwen3.6 safety classifier being persistently unavailable.')
print('  - Docs batch (batch 4) was also never created for the same reason, but key docs were covered in batch 2.')
print('  - Some nodes have unknown types: package/page/style/asset')
print(f'  - Saved to: .understand-anything/knowledge-graph.json ({os.path.getsize(".understand-anything/knowledge-graph.json")} bytes)')
