import json, os
from datetime import datetime, timezone

with open('.understand-anything/intermediate/assembled-graph.json') as f:
    graph = json.load(f)

def assign_layer(n):
    fp = n.get('filePath', '')
    nid = n['id']

    # JARVIS Engine first — most files have filePath with /jarvis/ but NOT core or llm
    if '/lib/jarvis/' in fp and '/llm/' not in fp and '/core/' not in fp:
        return 'layer:jv-engine'

    # Foundation/Core
    if '/jarvis/core/' in fp:
        return 'layer:foundation-core'
    if '/styles/tokens.css' in fp or nid == 'lib-index':
        return 'layer:foundation-core'
    if '/supabase.ts' == fp[-10:] or '/supabase.server.ts' == fp[-16:]:
        return 'layer:foundation-core'

    # LLM Provider Router
    if '/jarvis/llm/' in fp:
        return 'layer:llm-provider'

    # API/Server Endpoints
    if '+server.ts' in fp and '/api/' in fp:
        return 'layer:api-server'

    # UI/Frontend — check for jarvis route group in path
    if 'jarvis' in fp.lower() and ('+page.svelte' in fp or '+layout.svelte' in fp):
        return 'layer:ui-frontend'

    # Agent/Skill System
    if '/claude/skills/' in fp or '/claude/hooks/' in fp or '/claude/agents/' in fp:
        return 'layer:agent-skill'
    if fp in ['AGENTS.md', 'CLAUDE.md', 'README.md', 'GEMINI.md']:
        return 'layer:agent-skill'

    # Data/Storage
    if 'supabase/migrations/' in fp or '.jarvis/' in fp:
        return 'layer:data-storage'

    # Infrastructure — everything else
    return 'layer:infrastructure'

# Assign nodes to layers
layer_names = {
    'layer:infrastructure': 'Infrastructure',
    'layer:foundation-core': 'Foundation/Core',
    'layer:llm-provider': 'LLM Provider Router',
    'layer:jv-engine': 'JARVIS Engine',
    'layer:api-server': 'API/Server Endpoints',
    'layer:ui-frontend': 'UI/Frontend',
    'layer:agent-skill': 'Agent/Skill System',
    'layer:data-storage': 'Data/Storage'
}

final_layers = {}
unassigned = []

for n in graph['nodes']:
    lid = assign_layer(n)
    if lid not in final_layers:
        final_layers[lid] = {'name': layer_names[lid], 'description': '', 'nodeIds': []}
    if n['id'] not in final_layers[lid]['nodeIds']:
        final_layers[lid]['nodeIds'].append(n['id'])

# Check unassigned nodes
for n in graph['nodes']:
    found = any(n['id'] in v['nodeIds'] for v in final_layers.values())
    if not found:
        unassigned.append(n['id'])

# Add descriptions
descriptions = {
    'layer:infrastructure': 'Build configuration, package management, IDE tooling, and static assets. Purely bootstrapping.',
    'layer:foundation-core': 'Core types, global state stores, design tokens, Supabase clients. Shared contract between all layers.',
    'layer:llm-provider': 'Model-agnostic LLM adapter layer — Ollama, OpenAI-compatible, Anthropic providers plus central router.',
    'layer:jv-engine': 'Core JARVIS business logic — memory CRUD, conversation intelligence, tool registry, skill system, safety policy, automation scheduler, evaluation analytics, briefing engine.',
    'layer:api-server': 'SvelteKit HTTP routes wrapping JARVIS Engine modules with request parsing and response serialization.',
    'layer:ui-frontend': 'Svelte pages and layouts consuming API endpoints for interactive workspace views.',
    'layer:agent-skill': 'Claude Code agent definitions, skill specs, hooks. Governs development-time AI interaction.',
    'layer:data-storage': 'Database schema migrations and local workspace state.'
}

result = []
for lid in ['layer:infrastructure', 'layer:foundation-core', 'layer:llm-provider', 'layer:jv-engine', 'layer:api-server', 'layer:ui-frontend', 'layer:agent-skill', 'layer:data-storage']:
    if lid in final_layers and len(final_layers[lid]['nodeIds']) > 0:
        result.append({
            'id': lid,
            'name': final_layers[lid]['name'],
            'description': descriptions.get(lid, ''),
            'nodeIds': final_layers[lid]['nodeIds']
        })

graph['layers'] = result
graph['tour'] = []

if 'version' not in graph:
    graph['version'] = '1.0.0'
if 'project' not in graph:
    graph['project'] = {
        'name': 'Super J.A.R.V.I.S.',
        'languages': ['typescript', 'javascript', 'svelte'],
        'frameworks': ['SvelteKit', 'Tailwind CSS v4'],
        'description': 'A local-first personal AI workspace.',
        'analyzedAt': datetime.now(timezone.utc).isoformat(),
        'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38'
    }
else:
    graph['project']['analyzedAt'] = datetime.now(timezone.utc).isoformat()

with open('.understand-anything/knowledge-graph.json', 'w') as f:
    json.dump(graph, f, indent=2)

meta = {
    'lastAnalyzedAt': datetime.now(timezone.utc).isoformat(),
    'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38',
    'version': '1.0.0',
    'analyzedFiles': 91
}
with open('.understand-anything/meta.json', 'w') as f:
    json.dump(meta, f, indent=2)

print(f'knowledge-graph.json saved: {len(graph["nodes"])} nodes, {len(graph["edges"])} edges, {len(result)} layers')
for l in result:
    print(f'  {l["name"]}: {len(l["nodeIds"])} nodes')
if unassigned:
    print(f'WARNING: {len(unassigned)} unassigned nodes:')
    for u in unassigned[:10]:
        print(f'    - {u}')
