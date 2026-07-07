import json, re
from datetime import datetime, timezone

with open('.understand-anything/intermediate/assembled-graph.json') as f:
    graph = json.load(f)

with open('.understand-anything/intermediate/layers.json') as f:
    layers = json.load(f)

# Build mapping from expected file path to actual node ID
# For each layer, we know what files it should reference. Match them to actual graph nodes.

# First, build a complete filePath -> id map from the graph
fp_to_id = {}
for n in graph['nodes']:
    fp = n.get('filePath', '')
    if fp:
        fp_to_id[fp] = n['id']

# The architecture-analyzer used these paths as node IDs. Map them to actual graph IDs.
# Build a mapping from "expected" path-based ID to "actual" graph ID

def expected_id(path):
    """Convert a file path to the kind of ID the arch-analyzer would have produced."""
    prefix = ''
    base = path

    # Determine type prefix based on known conventions
    if 'api/' in path and '+server' in path:
        prefix = 'endpoint:'
    elif path.endswith('.sql'):
        prefix = 'table:'
    elif 'docs/' in path or path.endswith('.md') and 'AGENTS' not in path:
        prefix = 'document:'
    elif '.vscode' in path or '.mcp' in path or '.npmrc' in path or '.gitignore' in path:
        prefix = 'config:'
    elif '/jarvis/' in path and path.endswith('.ts'):
        # Use the base name as ID (what arch-analyzer did)
        base = path.replace('src/lib/jarvis/', '').replace('.ts', '').replace('/', '-').replace('\\', '-')
        prefix = 'file:'
    elif '+page.svelte' in path or '+layout.svelte' in path:
        # Use page name as ID
        base = re.search(r'/(\w+)\+page\.svelte$|/(\w+)\+layout\.svelte$', path)
        if base:
            base = base.group(1) or base.group(2)
        prefix = 'file:'
    elif path == 'src/lib/styles/tokens.css':
        base = 'tokens-css'
        prefix = 'config:'
    elif path == 'supabase/migrations/20260707114040_create_memory_tables.sql':
        base = 'node-migration-memory-tables'  # Already table: from batch 1
        return fp_to_id.get(path, 'file:' + path)

    # For node files that have "node-" prefix in the graph
    if ':node-' not in str(fp_to_id.get(path, '')):
        base_with_prefix = f'file:{base}'
    else:
        base_with_prefix = f'config:node-{base.split(":")[-1]}' if ':' in base else f'config:node-{base}'

# Better approach: just look at the actual graph nodes and assign them to layers directly
# based on their filePath matching the layer's expected path patterns.

# Build a mapping of what each arch-analyzer layer references as paths
layer_paths = {}  # layer id -> set of filePaths that belong there

# Map from the architecture-analyzer output to file paths
# We know the layer nodeIds correspond to files by their naming conventions
# Let's directly assign graph nodes to layers based on their file paths

for layer in layers:
    matched = []
    for n in graph['nodes']:
        fp = n.get('filePath', '')
        nid = n['id']

        # Check if this node belongs to this layer by path pattern

        if layer['id'] == 'layer:infrastructure':
            infra_paths = [
                'package.json', 'package-lock.json', 'vite.config.js', 'svelte.config.js',
                'jsconfig.json', '.npmrc', '.gitignore', '.mcp.json',
                '.vscode/', '.cursor/', '.gemini/', '.opencode/', '.codex/',
                'src/app.html', 'static/favicon.svg'
            ]
            if any(fp.endswith(p) or fp.startswith(p.rstrip('/')) for p in infra_paths):
                matched.append(nid)

        elif layer['id'] == 'layer:foundation':
            foundation_paths = [
                'core/types.ts', 'core/store.ts', 'styles/tokens.css',
                'supabase.ts', 'supabase.server.ts', 'lib/index.js'
            ]
            if any(fp.endswith(p) or fp in n['id'] for p in foundation_paths):
                matched.append(nid)

        elif layer['id'] == 'layer:llm-provider':
            if '/jarvis/llm/' in fp or 'jarvis-llm' in nid:
                matched.append(nid)

        elif layer['id'] == 'layer:jv-engine':
            # Core JARVIS modules that are NOT llm (which is its own layer)
            if '/jarvis/' in fp and not '/llm/' in fp and '/core/' not in fp:
                matched.append(nid)

        elif layer['id'] == 'layer:api-server':
            if '/api/' in fp or '/jarvis/' not in fp:
                # Wait, API endpoints are under src/routes/api/
                if '+server.ts' in fp and '/api/' in fp:
                    matched.append(nid)

        elif layer['id'] == 'layer:ui-frontend':
            if '+page.svelte' in fp or '+layout.svelte' in fp:
                if '(jarvis)' in fp:
                    matched.append(nid)

        elif layer['id'] == 'layer:agent-skill':
            if '/claude/skills/' in fp or '/claude/hooks/' in fp or '/claude/agents/' in fp:
                matched.append(nid)
            # Also include key docs
            if '.md' in fp and ('CLAUDE' in fp or 'README' in fp):
                matched.append(nid)

        elif layer['id'] == 'layer:data-storage':
            if '/supabase/migrations/' in fp or '.jarvis/' in fp:
                matched.append(nid)

    layer['nodeIds'] = list(dict.fromkeys(matched))  # deduplicate preserving order

# Now write the final knowledge graph
graph['layers'] = layers
graph['tour'] = []
graph['version'] = '1.0.0'

if 'project' not in graph:
    graph['project'] = {
        'name': 'Super J.A.R.V.I.S.',
        'languages': ['typescript', 'javascript', 'svelte', 'css', 'sql', 'markdown'],
        'frameworks': ['SvelteKit', 'Svelte 5', 'Tailwind CSS v4', 'Supabase'],
        'description': graph.get('project', {}).get('description', 'A local-first personal AI workspace'),
        'analyzedAt': datetime.now(timezone.utc).isoformat(),
        'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38'
    }

# Write knowledge graph
with open('.understand-anything/knowledge-graph.json', 'w') as f:
    json.dump(graph, f, indent=2)

print(f'Saved knowledge-graph.json: {len(graph["nodes"])} nodes, {len(graph["edges"])} edges, {len(layers)} layers')

# Write meta
meta = {
    'lastAnalyzedAt': datetime.now(timezone.utc).isoformat(),
    'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38',
    'version': '1.0.0',
    'analyzedFiles': 91
}
with open('.understand-anything/meta.json', 'w') as f:
    json.dump(meta, f, indent=2)

# Print layer assignments
for l in layers:
    print(f'  {l["name"]}: {len(l["nodeIds"])} nodes')
print('meta.json written.')
