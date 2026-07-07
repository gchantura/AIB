import json, re

with open('.understand-anything/intermediate/assembled-graph.json') as f:
    graph = json.load(f)

with open('.understand-anything/intermediate/layers.json') as f:
    layers = json.load(f)

# Build two mappings from graph nodes:
# 1. Direct ID map
nodes_by_id = {n['id']: n for n in graph['nodes']}

# 2. FilePath-based map (strip prefix and node- prefix)
def strip_prefix_and_node(id_str):
    # Strip type prefix
    base = id_str.split(':', 1)[-1] if ':' in id_str else id_str
    # Strip node- prefix if present
    if base.startswith('node-'):
        base = base[5:]
    return base

# Build path -> id mapping (original) and stripped-id -> id mapping
path_to_orig_id = {}  # filePath -> original graph ID
stripped_to_orig_id = {}  # stripped ID -> original graph ID
for n in graph['nodes']:
    fp = n.get('filePath', '')
    path_to_orig_id[fp] = n['id']
    stripped = strip_prefix_and_node(n['id'])
    if stripped not in stripped_to_orig_id:
        stripped_to_orig_id[stripped] = n['id']

# Remap each layer's nodeIds
for layer in layers:
    new_ids = []
    for nid in layer.get('nodeIds', []):
        # Direct match first
        if nid in nodes_by_id:
            new_ids.append(nid)
            continue

        # Try stripping prefix from candidate and matching against graph stripped IDs
        stripped_candidate = strip_prefix_and_node(nid)

        # Check direct stripped match
        if stripped_candidate in stripped_to_orig_id:
            new_ids.append(stripped_to_orig_id[stripped_candidate])
            continue

        # Try matching by filePath patterns
        candidates = []
        if ':' in nid and not nid.startswith('layer:'):
            prefix, base = nid.split(':', 1)
            candidates.append(f'{prefix}:node-{base}')  # e.g., config:node-vite-config-js
            candidates.append(f'file:{base}')

        for c in candidates:
            if c in nodes_by_id:
                new_ids.append(c)
                break
        else:
            # Try to find by filePath matching
            base = nid.split(':', 1)[-1] if ':' in nid else nid
            for fp, gid in path_to_orig_id.items():
                if base.lower() in fp.lower() or fp.replace('.','_').split('/')[-1].lower() in base.lower():
                    new_ids.append(gid)
                    break

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for nid in new_ids:
        if nid not in seen:
            seen.add(nid)
            unique.append(nid)
    layer['nodeIds'] = unique

graph['layers'] = layers

with open('.understand-anything/intermediate/assembled-graph.json', 'w') as f:
    json.dump(graph, f, indent=2)

print('Remapped layers:')
total_assigned = 0
for l in layers:
    print(f'  {l["name"]}: {len(l["nodeIds"])} nodes')
    total_assigned += len(l['nodeIds'])
print(f'Total assigned: {total_assigned}')

# Now write final knowledge graph with metadata
graph['version'] = '1.0.0'
from datetime import datetime, timezone
graph['project']['analyzedAt'] = datetime.now(timezone.utc).isoformat()
graph['project']['gitCommitHash'] = 'd6b39a29d2135e18cf50bed8418aeb464703ce38'

# Write final knowledge graph
with open('.understand-anything/knowledge-graph.json', 'w') as f:
    json.dump(graph, f, indent=2)

print(f'\nKnowledge graph saved with {len(graph["nodes"])} nodes, {len(graph["edges"])} edges, {len(layers)} layers')

# Write meta
meta = {
    'lastAnalyzedAt': datetime.now(timezone.utc).isoformat(),
    'gitCommitHash': 'd6b39a29d2135e18cf50bed8418aeb464703ce38',
    'version': '1.0.0',
    'analyzedFiles': 91
}
with open('.understand-anything/meta.json', 'w') as f:
    json.dump(meta, f, indent=2)
print('meta.json written.')
