import json, os
from datetime import datetime, timezone

with open('.understand-anything/intermediate/assembled-graph.json') as f:
    graph = json.load(f)

# Debug: show all nodes and their filePaths before assignment
print("=== ALL NODES BEFORE ASSIGNMENT ===")
for n in sorted(graph['nodes'], key=lambda x: (x.get('filePath',''), x['id'])):
    print(f"  {n['id']} -> fp={n.get('filePath','?')}")
