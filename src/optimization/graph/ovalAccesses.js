// Derive access groups from the actual local graph; never invent connections.
export function getOvalAccesses(network) {
  const ring = network.edges.filter(edge => edge.streetName === 'Óvalo Musical');
  if (!ring.length) return [];
  const ringNodes = new Set(ring.flatMap(edge => [edge.from, edge.to]));
  const nodes = new Map(network.nodes.map(node => [node.id, node]));
  const center = [...ringNodes].reduce((point, id) => [point[0] + nodes.get(id).latitude / ringNodes.size, point[1] + nodes.get(id).longitude / ringNodes.size], [0, 0]);
  const sectors = ['este', 'noreste', 'norte', 'noroeste', 'oeste', 'suroeste', 'sur', 'sureste'];
  const groups = new Map();
  for (const edge of network.edges) {
    if (ringNodes.has(edge.from) === ringNodes.has(edge.to)) continue;
    const exterior = nodes.get(ringNodes.has(edge.from) ? edge.to : edge.from);
    const angle = Math.atan2(exterior.latitude - center[0], (exterior.longitude - center[1]) * Math.cos(center[0] * Math.PI / 180));
    const sector = sectors[(Math.round(angle / (Math.PI / 4)) + 8) % 8];
    const id = `${edge.streetName}:${sector}`;
    if (!groups.has(id)) groups.set(id, { id, label: `Conexión con ${edge.streetName} · ${sector}`, edgeIds: [], segments: [] });
    groups.get(id).edgeIds.push(edge.id);
    groups.get(id).segments.push(edge);
  }
  return [...groups.values(), { id: 'oval-total', label: 'Cierre total del Óvalo Musical', edgeIds: ring.map(edge => edge.id), segments: ring, total: true }];
}
