// DEMO ACADÉMICO: factors and thresholds are assumptions, not calibrated traffic data.
export const congestionConfig = {
  levels: ['low', 'moderate', 'high', 'congested'],
  factors: { low: 1, moderate: 1.2, high: 1.5, congested: 2 },
  labels: { low: 'Tráfico bajo', moderate: 'Tráfico moderado', high: 'Tráfico alto', congested: 'Congestión' },
  colors: { low: '#16a34a', moderate: '#eab308', high: '#ea580c', congested: '#dc2626' },
  // Each crossed threshold raises congestion by one level, capped at congested.
  trafficThresholds: { primary: [10, 20, 30], alternative: [30] },
  incidents: { accident: 'congested', lane: 'high' },
};
