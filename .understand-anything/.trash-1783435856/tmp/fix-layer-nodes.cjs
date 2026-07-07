const fs = require('fs');

// Load assembled graph
const graph = JSON.parse(fs.readFileSync('.understand-anything/intermediate/assembled-graph.json', 'utf8'));

// Build a map from filePath to node.id
const pathToId = new Map();
for (const n of graph.nodes) {
  if (n.filePath) {
    pathToId.set(n.filePath, n.id);
  }
}

// Load layers
const layers = JSON.parse(fs.readFileSync('.understand-anything/intermediate/layers.json', 'utf8'));

let fixed = 0;
let dropped = 0;

for (const layer of layers) {
  const originalCount = layer.nodeIds.length;
  layer.nodeIds = layer.nodeIds.map(id => {
    // Check if this ID exists directly in the graph
    if (graph.nodes.some(n => n.id === id)) return id;

    // Try to find by matching against known normalized IDs patterns
    const node = graph.nodes.find(n => {
      if (!n.filePath) return false;
      const fp = n.filePath.replace(/^file:|^config:|^document:|^endpoint:|^table:|^markup:/, '');
      return id === `file:${fp}` || id === `config:${fp}` || id === `document:${fp}` ||
             id === `endpoint:${fp}` || id === id; // keep original if no match
    });
    return node ? node.id : null;
  }).filter(Boolean);

  dropped += originalCount - layer.nodeIds.length;
}

// For infrastructure layer, the IDs from arch-analyzer are different from merged graph.
// Do a smarter mapping: try to map by checking what's in the node set
for (const layer of layers) {
  const fixedNodes = [];
  for (const id of layer.nodeIds) {
    if (graph.nodes.some(n => n.id === id)) {
      fixedNodes.push(id);
    } else {
      // This ID doesn't exist - the arch analyzer used its own naming
      console.log(`Layer '${layer.name}' needs fallback for ID: ${id}`);
      dropped++;
    }
  }
  layer.nodeIds = fixedNodes;
}

// Now do a filePath-based fallback: find nodes whose filePath matches the pattern in the original IDs
for (const layer of layers) {
  const fixedIds = [];
  for (let i = 0; i < layer.nodeIds.length; i++) {
    const id = layer.nodeIds[i];
    if (graph.nodes.some(n => n.id === id)) {
      fixedIds.push(id);
      continue;
    }

    // Try to derive filePath from the ID pattern
    // e.g., 'file:package.json' -> check graph nodes for that filePath
    // or 'vscode-extensions' -> '.vscode/extensions.json'
    let filePath = null;
    if (id.startsWith('file:')) {
      filePath = id.replace('file:', '');
    } else if (id.startsWith('config:') || id.startsWith('document:')) {
      const base = id.split(':')[1];
      // Map known patterns
      const nameMap = {
        'AGENTS.md': 'AGENTS.md',
        'CLAUDE.md': 'CLAUDE.md',
        'README.md': 'README.md',
        'GEMINI.md': 'GEMINI.md',
        'node-agents-md': 'AGENTS.md',
        'node-claude-md': 'CLAUDE.md',
        'node-readme-md': 'README.md',
        'node-gemini-md': 'GEMINI.md',
        'node-memory-system-docs': 'docs/MEMORY_SYSTEM.md',
        'node-memory-core-phase5': 'docs/MODEL_PROVIDERS.md',
        'vscode-extensions': '.vscode/extensions.json',
        'vscode-mcp': '.vscode/mcp.json',
        'vscode-settings': '.vscode/settings.json',
        'codex-config': '.codex/config.toml',
        'cursor-mcp': '.cursor/mcp.json',
      };
      filePath = nameMap[base];
    }

    if (filePath) {
      const matchedNode = graph.nodes.find(n => n.filePath === filePath);
      if (matchedNode) {
        fixedIds.push(matchedNode.id);
        console.log(`Mapped layer '${layer.name}': ${id} -> ${matchedNode.id}`);
        continue;
      }
    }

    // Last resort: try to find by checking if id is in the merged node set
    const exactMatch = graph.nodes.find(n => n.id === id || n.id.includes(id));
    if (exactMatch) {
      fixedIds.push(exactMatch.id);
      continue;
    }

    console.log(`Could not map ID '${id}' for layer '${layer.name}'`);
  }
  layer.nodeIds = fixedIds;
}

graph.layers = layers;
fs.writeFileSync('.understand-anything/intermediate/assembled-graph.json', JSON.stringify(graph, null, 2));
console.log('Fixed layers. Final counts:');
for (const l of layers) {
  console.log(`  Layer '${l.name}': ${l.nodeIds.length} nodes`);
}
