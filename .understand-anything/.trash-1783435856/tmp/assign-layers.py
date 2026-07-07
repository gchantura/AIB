import json, os
from datetime import datetime, timezone

with open('.understand-anything/intermediate/assembled-graph.json') as f:
    graph = json.load(f)

# Assign nodes to layers based on their filePath
layers = {
    'layer:infrastructure': {'name': 'Infrastructure', 'description': 'Build configuration, package management, IDE tooling, and static assets. Purely bootstrapping — no domain logic.'},
    'layer:foundation-core': {'name': 'Foundation/Core', 'description': 'Core types, global state stores, design tokens, Supabase clients. Shared contract between all layers.'},
    'layer:llm-provider': {'name': 'LLM Provider Router', 'description': 'Model-agnostic LLM adapter layer — Ollama, OpenAI-compatible, Anthropic providers plus central router.'},
    'layer:jv-engine': {'name': 'JARVIS Engine', 'description': 'Core JARVIS business logic — memory CRUD, conversation intelligence, tool registry, skill system, safety policy, automation scheduler, evaluation analytics, briefing engine.'},
    'layer:api-server': {'name': 'API/Server Endpoints', 'description': 'SvelteKit HTTP routes wrapping JARVIS Engine modules with request parsing and response serialization.'},
    'layer:ui-frontend': {'name': 'UI/Frontend', 'description': 'Svelte pages and layouts consuming API endpoints for interactive workspace views.'},
    'layer:agent-skill': {'name': 'Agent/Skill System', 'description': 'Claude Code agent definitions, skill specs, hooks. External to the running application but governs development-time AI interaction.'},
    'layer:data-storage': {'name': 'Data/Storage', 'description': 'Database schema migrations and local workspace state.'}
}

def assign_layer(fp):
    """Determine which layer a file belongs to based on its path."""
    # Agent/Skill System — .claude/skills, .claude/hooks, .claude/agents
    if '/.claude/skills/' in fp or '/.claude/hooks/' in fp or '/.claude/agents/' in fp:
        return 'layer:agent-skill'

    # Data/Storage — migrations and jarvis workspace
    if 'supabase/migrations/' in fp or '.jarvis/workspace.json' == fp:
        return 'layer:data-storage'

    # LLM Provider Router
    if '/llm/' in fp:
        return 'layer:llm-provider'

    # API/Server Endpoints
    if '+server.ts' in fp and '/api/' in fp:
        return 'layer:api-server'

    # UI/Frontend — Svelte pages/layouts
    if ('+page.svelte' in fp or '+layout.svelte' in fp) and '(jarvis)' in fp:
        return 'layer:ui-frontend'

    # Foundation/Core — core types, stores, design tokens, Supabase clients
    if fp.endswith('/core/types.ts') or fp.endswith('/core/store.ts'):
        return 'layer:foundation-core'
    if '/styles/tokens.css' in fp:
        return 'layer:foundation-core'
    if fp.endswith('/supabase.ts') or fp.endswith('/supabase.server.ts'):
        return 'layer:foundation-core'
    if fp.endswith('/index.js'):
        return 'layer:foundation-core'

    # JARVIS Engine — all /jarvis/ modules except LLM (already handled) and core (already handled)
    if '/jarvis/' in fp:
        return 'layer:jv-engine'

    # Agent/Skill System key docs (root-level markdown)
    if fp in ['AGENTS.md', 'CLAUDE.md', 'README.md', 'GEMINI.md']:
        return 'layer:agent-skill'

    # Infrastructure — everything else: configs, IDE files, static assets
    return 'layer:infrastructure'

# Assign all nodes to layers
layer_nodes = {lid: [] for lid in layers}
for n in graph['nodes']:
    fp = n.get('filePath', '')
    layer_id = assign_layer(fp)
    if layer_id and n['id'] not in layer_nodes[layer_id]:
        layer_nodes[layer_id].append(n['id'])

# Build final layers array
final_layers = []
for lid, info in layers.items():
    if layer_nodes[lid]:  # Only include non-empty layers
        final_layers.append({
            'id': lid,
            'name': info['name'],
            'description': info['description'],
            'nodeIds': layer_nodes[lid]
        })

graph['layers'] = final_layers
graph['tour'] = []  # Phase 5 skipped in output (partial results)
if 'version' not in graph:
    graph['version'] = '1.0.0'
if 'project' not in graph:
    graph['project'] = {
        'name': 'Super J.A.R.V.I.S.',
        'languages': ['typescript', 'javascript', 'svelte', 'css', 'sql', 'markdown'],
        'frameworks': ['SvelteKit', 'Svelte 5', 'Tailwind CSS v4', 'Supabase'],
        'description': 'A local-first personal AI workspace built with SvelteKit 2 and Svelte 5.',
        'analyzedAt': datetime.now(timezone.utc).isoformat(),
        'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38'
    }
else:
    graph['project']['analyzedAt'] = datetime.now(timezone.utc).isoformat()
    graph['project']['gitCommitHash'] = 'd6b39a29d2135e18cf50bed8418aeb464703ce38'

# Write final knowledge graph
with open('.understand-anything/knowledge-graph.json', 'w') as f:
    json.dump(graph, f, indent=2)
print(f'knowledge-graph.json: {len(graph["nodes"])} nodes, {len(graph["edges"])} edges, {len(final_layers)} layers')

# Write meta.json
meta = {
    'lastAnalyzedAt': datetime.now(timezone.utc).isoformat(),
    'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38',
    'version': '1.0.0',
    'analyzedFiles': 91
}
with open('.understand-anything/meta.json', 'w') as f:
    json.dump(meta, f, indent=2)
print('meta.json written.')

# Print layer assignments for verification
for l in final_layers:
    print(f'  {l["name"]}: {len(l["nodeIds"])} nodes')
unassigned = [n['id'] for n in graph['nodes'] if not any(n['id'] in ln for ln in [l['nodeIds'] for l in final_layers])]
if unassigned:
    print(f'WARNING: {len(unassigned)} unassigned nodes')
