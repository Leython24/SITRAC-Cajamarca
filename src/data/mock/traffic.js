// Estados DEMO. La base OSM es geográfica; estos estados no son mediciones reales.
export const trafficLegend = [
  { label: 'Tráfico bajo', color: 'var(--traffic-fluid)' },
  { label: 'Tráfico moderado', color: 'var(--traffic-moderate)' },
  { label: 'Tráfico alto', color: 'var(--traffic-high)' },
  { label: 'Congestión', color: 'var(--traffic-congested)' },
];
export const mockTraffic = [
  { id: 'atahualpa', name: 'Av. Atahualpa', state: 'Tráfico alto', tone: 'warning', color: '#ea580c', usage: 84 },
  { id: 'evitamiento', name: 'Vía de Evitamiento Norte', state: 'Tráfico bajo', tone: 'success', color: '#16a34a', usage: 38 },
  { id: 'dos-mayo', name: 'Jr. Dos de Mayo', state: 'Tráfico moderado', tone: 'warning', color: '#eab308', usage: 65 },
  { id: 'chanchamayo', name: 'Jr. Chanchamayo', state: 'Congestión', tone: 'danger', color: '#dc2626', usage: 94 },
];
