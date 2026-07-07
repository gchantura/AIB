import json, sys

# Load assembled graph (without layers)
with open('.understand-anything/intermediate/assembled-graph.json') as f:
    graph = json.load(f)

# Build node lookup by filePath and by id
nodes_by_filepath = {}
nodes_by_id = {}
for n in graph['nodes']:
    nodes_by_id[n['id']] = n
    if 'filePath' in n:
        # Strip any prefix for comparison
        fp = n['filePath']
        nodes_by_filepath[fp] = n['id']

# Load layers from architecture analyzer
with open('.understand-anything/intermediate/layers.json') as f:
    layers = json.load(f)

# For each layer, remap nodeIds to match actual graph node IDs
for layer in layers:
    new_ids = []
    for nid in layer.get('nodeIds', []):
        # Direct match
        if nid in nodes_by_id:
            new_ids.append(nid)
            continue

        # Try matching by extracting path from various ID patterns
        resolved = None

        # Pattern: "file:path" or "config:path" etc.
        if ':' in nid and not nid.startswith('layer:'):
            prefix, base = nid.split(':', 1)
            candidates = [nid, f'{prefix}:{base}', base]

        else:
            candidates = [nid]

        # Direct match on any candidate
        for c in candidates:
            if c in nodes_by_id:
                resolved = nodes_by_id[c]
                break

        # Try common path remapping
        if not resolved:
            path_map = {
                'vscode-extensions': '.vscode/extensions.json',
                'vscode-mcp': '.vscode/mcp.json',
                'vscode-settings': '.vscode/settings.json',
                'codex-config': '.codex/config.toml',
                'cursor-mcp': '.cursor/mcp.json',
                'gemini-settings-json': '.gemini/settings.json',
                'jarvis-workspace-json': '.jarvis/workspace.json',
                'opencode-opencode-json': '.opencode/opencode.json',
                'opencode-svelte-json': '.opencode/svelte.json',
                'app-html': 'src/app.html',
                'favicon-svg': 'static/favicon.svg',
                'layout-css': 'src/routes/layout.css',
            }
            if nid in path_map:
                fp = path_map[nid]
                if fp in nodes_by_filepath:
                    resolved = nodes_by_filepath[fp]

        # Try matching base against common node name patterns
        if not resolved:
            base_name = nid.split(':')[-1] if ':' in nid else nid
            for k, v in nodes_by_id.items():
                fp = v.get('filePath', '')
                # Check if the candidate looks like it could map to this filePath
                if base_name.lower() in fp.lower() or fp.lower().split('/')[-1].lower() in base_name.lower():
                    resolved = k
                    break

        if resolved:
            new_ids.append(resolved)
        else:
            print(f'WARN: Could not resolve {nid} -> using partial match or skipping', file=sys.stderr)
            # Try prefix stripping approach - the merged graph may have different prefixes
            for pattern_id, pattern_node in nodes_by_id.items():
                fp = pattern_node.get('filePath', '')
                # If the candidate looks like a config ID for this file
                if 'vscode' in nid and '.vscode' in fp:
                    resolved = pattern_id
                    break

    layer['nodeIds'] = new_ids

graph['layers'] = layers
fs = open('.understand-anything/intermediate/assembled-graph.json', 'w')
json.dump(graph, fs, indent=2)
fs.close()

print('Layers remapped:')
for l in layers:
    print(f'  {l["name"]}: {len(l["nodeIds"])} nodes')
