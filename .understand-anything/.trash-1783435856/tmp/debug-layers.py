import json

# Check what's in assembled graph vs layers
with open('.understand-anything/intermediate/assembled-graph.json') as f:
    g = json.load(f)

# Show some node IDs from graph
print("GRAPH NODES (first 20):")
for n in g['nodes'][:20]:
    print(f"  {n['id']} -> filePath: {n.get('filePath','?')}")

with open('.understand-anything/intermediate/layers.json') as f:
    layers = json.load(f)

print("\nLAYERS (first layer):")
for l in layers[:1]:
    print(f"  Layer '{l['name']}' has {len(l['nodeIds'])} nodeIds:")
    for nid in l['nodeIds'][:5]:
        print(f"    - {nid}")
