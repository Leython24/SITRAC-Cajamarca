// DEMO ACADEMICO basado en la geometria visible de OpenStreetMap.
// Red pequena de demostracion: no es un levantamiento topografico ni un itinerario legal.
const source = 'DEMO ACADEMICO';
const node = (id, displayName, latitude, longitude, streetName = displayName, name = displayName) => ({ id, name, displayName, streetName, description: `${displayName} · punto DEMO`, latitude, longitude, source });
const nodeById = {};
const point = id => {
  const item = nodeById[id];
  return [item.latitude, item.longitude];
};
const streetGeometry = (from, to, bend = 0) => {
  const start = point(from);
  const end = point(to);
  return [start, [(start[0] + end[0]) / 2 + bend, (start[1] + end[1]) / 2 - bend], end];
};
const edgeDistances = {
  'atahualpa-sur': 420, atahualpa: 380, 'atahualpa-norte': 390, comercio: 360, chanchamayo: 380, 'dos-mayo': 380,
  'evitamiento-sur': 480, evitamiento: 520, 'corredor-este': 650, 'acceso-este': 600, 'conexion-centro': 850,
  'desvio-oeste-entrada': 250, 'desvio-oeste-salida': 340,
};
const edge = (id, streetName, from, to, response = 'primary', bend = 0) => ({
  id, name: streetName, displayName: streetName, streetName, distance: edgeDistances[id], from, to, geometry: streetGeometry(from, to, bend),
  congestion: 'low', status: 'open', cost: null, directed: false, response, source,
});

export const demoRoadNetwork = {
  source,
  nodes: [
    node('A', 'Ingreso sur · origen de ejemplo', -7.1764, -78.4994, 'Av. Atahualpa', 'Ingreso sur · origen de ejemplo'),
    node('B', 'Av. Atahualpa - tramo sur', -7.1744, -78.5024),
    node('C', 'Av. Atahualpa - tramo central', -7.1724, -78.5051),
    node('D', 'Av. Atahualpa con Jr. Comercio', -7.1706, -78.5076),
    node('E', 'Jr. Comercio con Jr. Chanchamayo', -7.1668, -78.5095),
    node('F', 'Jr. Chanchamayo con Jr. Dos de Mayo', -7.1635, -78.5119),
    node('G', 'Jr. Dos de Mayo – zona centro', -7.1606, -78.5111, 'Jr. Dos de Mayo'),
    node('H', 'Via de Evitamiento Sur - ingreso', -7.1759, -78.4958),
    node('I', 'Via de Evitamiento Norte - tramo sur', -7.1716, -78.4944),
    node('J', 'Via de Evitamiento Norte - tramo norte', -7.1649, -78.4976),
    node('K', 'Via de Evitamiento Norte con Jr. Dos de Mayo', -7.1591, -78.5020),
    node('L', 'Av. Atahualpa con acceso occidental', -7.1688, -78.5120),
  ],
  edges: [],
};
for (const item of demoRoadNetwork.nodes) nodeById[item.id] = item;
demoRoadNetwork.edges = [
  edge('atahualpa-sur', 'Avenida Atahualpa', 'A', 'B', 'primary', .00008),
  edge('atahualpa', 'Avenida Atahualpa', 'B', 'C', 'primary', -.00006),
  edge('atahualpa-norte', 'Avenida Atahualpa', 'C', 'D', 'primary', .00007),
  edge('comercio', 'Jirón Comercio', 'D', 'E', 'primary', -.00008),
  edge('chanchamayo', 'Jirón Chanchamayo', 'E', 'F', 'primary', .00006),
  edge('dos-mayo', 'Jirón Dos de Mayo', 'F', 'G', 'primary', -.00005),
  edge('evitamiento-sur', 'Avenida Vía de Evitamiento Sur', 'A', 'H', 'alternative', .00007),
  edge('evitamiento', 'Avenida Vía de Evitamiento', 'H', 'I', 'alternative', -.00006),
  edge('corredor-este', 'Avenida Vía de Evitamiento', 'I', 'J', 'alternative', .00005),
  edge('acceso-este', 'Avenida Vía de Evitamiento Norte', 'J', 'K', 'alternative', -.00007),
  edge('conexion-centro', 'Avenida Andrés Zevallos', 'K', 'G', 'alternative', .00006),
  edge('desvio-oeste-entrada', 'Avenida Atahualpa', 'D', 'L', 'alternative', -.00006),
  edge('desvio-oeste-salida', 'Jirón Chanchamayo', 'L', 'E', 'alternative', .00005),
];
export const demoRouteEndpoints = { origin: 'A', destination: 'G', incidentEdgeId: 'comercio' };
