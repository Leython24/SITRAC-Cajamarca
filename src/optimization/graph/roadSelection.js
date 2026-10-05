import { geometryDistance } from './buildGraph';

// Local projection onto OSM road geometry; no geocoding or routing service.
export function findNearestRoadSegment(point, edges, maxDistance = 65) {
  const scale = Math.cos(point[0] * Math.PI / 180);
  let nearest = null;
  for (const edge of edges) {
    const geometry = edge.geometry ?? edge.positions ?? [];
    for (let index = 0; index < geometry.length - 1; index++) {
      const a = geometry[index], b = geometry[index + 1];
      const dx = (b[1] - a[1]) * scale, dy = b[0] - a[0];
      const t = Math.max(0, Math.min(1, (((point[1] - a[1]) * scale) * dx + (point[0] - a[0]) * dy) / (dx * dx + dy * dy || 1)));
      const projected = [a[0] + t * dy, a[1] + t * (b[1] - a[1])];
      const distance = geometryDistance([point, projected]);
      if (!nearest || distance < nearest.distance) nearest = { edgeId: edge.id, road: edge, segmentIndex: index, projected, distance };
    }
  }
  return nearest && nearest.distance <= maxDistance ? nearest : null;
}

export function splitRoadAtPoint(network, selection, id = 'selected-destination') {
  if (!selection) return { network, destinationId: null };
  const edge = network.edges.find(item => item.id === selection.edgeId);
  if (!edge) throw new RangeError('La vía seleccionada no pertenece a la red.');
  const { projected, segmentIndex } = selection;
  const geometry = edge.geometry;
  for (const [endpoint, position] of [[edge.from, geometry[0]], [edge.to, geometry.at(-1)]]) {
    if (geometryDistance([position, projected]) < .05) return { network, destinationId: endpoint };
  }
  const before = [...geometry.slice(0, segmentIndex + 1), projected];
  const after = [projected, ...geometry.slice(segmentIndex + 1)];
  const ratio = geometryDistance(before) / geometryDistance(geometry);
  const streetName = edge.streetName ?? edge.name;
  const node = { id, name: `${streetName} · punto seleccionado`, displayName: `${streetName} · punto seleccionado`, latitude: projected[0], longitude: projected[1], temporary: true };
  const parts = [
    { ...edge, id: `${edge.id}:start`, to: id, geometry: before, distance: edge.distance * ratio, parentEdgeId: edge.id },
    { ...edge, id: `${edge.id}:end`, from: id, geometry: after, distance: edge.distance * (1 - ratio), parentEdgeId: edge.id },
  ];
  return { network: { ...network, nodes: [...network.nodes, node], edges: [...network.edges.filter(item => item.id !== edge.id), ...parts] }, destinationId: id };
}

export function conditionsForNetwork(network, conditions) {
  const blocked = new Set(conditions.blockedEdgeIds ?? []);
  return { ...conditions, blockedEdgeIds: network.edges.filter(edge => blocked.has(edge.id) || blocked.has(edge.parentEdgeId)).map(edge => edge.id),
    congestionOverrides: Object.fromEntries(network.edges.filter(edge => conditions.congestionOverrides?.[edge.parentEdgeId] || conditions.congestionOverrides?.[edge.id]).map(edge => [edge.id, conditions.congestionOverrides[edge.id] ?? conditions.congestionOverrides[edge.parentEdgeId]])) };
}
