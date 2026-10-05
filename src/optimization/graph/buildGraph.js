import { evaluateEdge } from './costFunctions';

const earthRadiusMeters = 6371000;
const toRadians = value => value * Math.PI / 180;
const coordinateDistance = (a, b) => {
  const latitudeDelta = toRadians(b[0] - a[0]);
  const longitudeDelta = toRadians(b[1] - a[1]);
  const latitudeA = toRadians(a[0]);
  const latitudeB = toRadians(b[0]);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};
export const geometryDistance = geometry => geometry?.slice(1).reduce((sum, point, index) => sum + coordinateDistance(geometry[index], point), 0) ?? null;

export function buildGraph(network, conditions = {}) {
  const nodes = network.nodes;
  const baseEdges = network.baseEdges ?? network.edges;
  const nodeById = new Map();
  for (const node of nodes) {
    if (nodeById.has(node.id)) throw new Error('Nodo duplicado.');
    if (!Number.isFinite(node.latitude) || !Number.isFinite(node.longitude)
      || Math.abs(node.latitude) > 90 || Math.abs(node.longitude) > 180) throw new RangeError('Coordenadas inválidas.');
    nodeById.set(node.id, node);
  }
  const adjacency = new Map(nodes.map(node => [node.id, []]));
  const seen = new Set();
  const edges = baseEdges.map(edge => {
    if (seen.has(edge.id)) throw new Error('Tramo duplicado.');
    seen.add(edge.id);
    if (!nodeById.has(edge.from) || !nodeById.has(edge.to)) throw new Error('El tramo referencia un nodo inexistente.');
    const resolved = evaluateEdge({ ...edge, distance: edge.distance ?? geometryDistance(edge.geometry) }, conditions);
    if (resolved.status !== 'blocked') {
      adjacency.get(edge.from).push({ to: edge.to, edge: resolved });
      if (!edge.directed) adjacency.get(edge.to).push({ to: edge.from, edge: { ...resolved, geometry: resolved.geometry?.slice().reverse() } });
    }
    return resolved;
  });
  return { nodes, baseEdges, edges, nodeById, adjacency };
}
