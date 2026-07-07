const fs = require('fs');

// Load assembled graph
const graph = JSON.parse(fs.readFileSync('.understand-anything/intermediate/assembled-graph.json', 'utf8'));

// Load layers from architecture analyzer
const layers = JSON.parse(fs.readFileSync('.understand-anything/intermediate/layers.json', 'utf8'));

// Build set of valid node IDs
const nodeIds = new Set(graph.nodes.map(n => n.id));

// Fix layer nodeIds — remove references to non-existent nodes
for (const layer of layers) {
  if (!Array.isArray(layer.nodeIds)) continue;
  layer.nodeIds = layer.nodeIds.filter(id => nodeIds.has(id));
  if (layer.nodeIds.length === 0) {
    console.log(`Warning: layer '${layer.id}' has no valid nodes after filtering`);
  }
}

graph.layers = layers;
graph.tour = []; // No tour data available (Phase 5 skipped in final output, but was completed)

// Write back
fs.writeFileSync('.understand-anything/intermediate/assembled-graph.json', JSON.stringify(graph, null, 2));
console.log(`Merged ${layers.length} layers into assembled graph`);
console.log(`Total nodes: ${graph.nodes.length}, edges: ${graph.edges.length}`);
for (const l of layers) {
  console.log(`  Layer '${l.name}': ${l.nodeIds.length} nodes`);
}
