import { buildGraph } from './buildGraph';

// O(V² + E) is sufficient for this small academic network. No fixed itinerary.
export function dijkstra(graph, origin, destination, conditions = {}) {
  const { nodeById, adjacency } = buildGraph(graph, conditions);
  if (!nodeById.has(origin) || !nodeById.has(destination)) throw new RangeError('Origen o destino desconocido.');
  const distances = new Map([...nodeById.keys()].map(id => [id, Infinity]));
  const previous = new Map();
  const visited = new Set();
  // Stable ordering and strict improvement make ties deterministic.
  const orderedIds = [...nodeById.keys()].sort();
  distances.set(origin, 0);
  while (visited.size < orderedIds.length) {
    let current = null;
    for (const id of orderedIds) {
      if (!visited.has(id) && (current === null || distances.get(id) < distances.get(current))) current = id;
    }
    if (current === null || !Number.isFinite(distances.get(current))) break;
    visited.add(current);
    if (current === destination) break;
    for (const { to, edge } of adjacency.get(current)) {
      if (visited.has(to)) continue;
      const candidate = distances.get(current) + edge.cost;
      if (candidate < distances.get(to)) {
        distances.set(to, candidate);
        previous.set(to, { from: current, edge });
      }
    }
  }
  if (!visited.has(destination)) return { status: 'unreachable', nodeIds: [], edgeIds: [], segments: [], distanceTotal: null, costTotal: null, coordinates: [] };
  const nodeIds = [destination];
  const segments = [];
  let current = destination;
  while (current !== origin) {
    const step = previous.get(current);
    segments.unshift({ ...step.edge, from: step.from, to: current });
    current = step.from;
    nodeIds.unshift(current);
  }
  const coordinates = segments.reduce((path, edge, index) => {
    const geometry = edge.geometry ?? [];
    return index === 0 ? geometry.slice() : path.concat(geometry.slice(1));
  }, []);
  return {
    status: 'found', nodeIds, edgeIds: segments.map(edge => edge.id), segments,
    distanceTotal: segments.reduce((sum, edge) => sum + edge.distance, 0),
    costTotal: distances.get(destination),
    coordinates: coordinates.length ? coordinates : nodeIds.map(id => { const node = nodeById.get(id); return [node.latitude, node.longitude]; }),
  };
}
