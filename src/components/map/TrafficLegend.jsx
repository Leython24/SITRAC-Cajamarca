import { trafficLegend } from '../../data/mock/traffic';
export default function TrafficLegend({ compact = false }) {
  return <div className={`traffic-legend ${compact ? 'legend-compact' : ''}`} aria-label="Leyenda de tráfico de demostración">
    {compact && <small>Nivel de flujo:</small>}
    {trafficLegend.map(item => <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>)}
  </div>;
}
