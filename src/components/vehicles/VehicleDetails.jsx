import Panel from '../ui/Panel';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { formatTime, formatTimeRange } from '../../utils/formatTime';
import { demoRoadNetwork } from '../../data/mock/roadNetwork';
import { configurationLabel } from '../../data/mock/vehiclePresentation';

export default function VehicleDetails({ vehicle }) {
  const entryName = demoRoadNetwork.nodes.find(node => node.id === vehicle.entryPointId)?.displayName;
  return <Panel className="vehicle-details" aria-label={`Detalle del vehículo ${vehicle.id}`}>
    <div className="vehicle-detail-header"><span className="module-icon"><Icon name="local_shipping" /></span><div><h2>Detalle: Vehículo {vehicle.id}</h2><p>Tipo / uso: {vehicle.type}</p><p>Configuración vehicular: {configurationLabel(vehicle)}</p><p>Operador: {vehicle.operator} · Registro DEMO</p></div><StatusBadge tone={vehicle.priority === 'Crítica' ? 'danger' : 'primary'}>Prioridad {vehicle.priority}</StatusBadge></div>
    <div className="vehicle-facts"><div><small>Procedencia</small><strong>{vehicle.originCity ?? vehicle.origin}</strong><span>{vehicle.arrivalCorridor}</span></div><div><small>Punto de ingreso urbano</small><strong>{entryName}</strong><span>Dijkstra empieza aquí, no desde la ciudad de procedencia.</span></div><div><small>Destino de abastecimiento</small><strong>{vehicle.destination}</strong></div><div><small>Llegada estimada</small><strong className="numeric">{formatTime(vehicle.arrival)}</strong><span>Ventana: {formatTimeRange(vehicle.window)}</span></div></div>
    <h3 className="comparison-heading"><Icon name="compare_arrows" />Comparación preliminar del viaje (Actual vs. Propuesta del Sistema)</h3>
    <div className="comparison-columns"><div className="comparison-box"><div className="section-header"><span>Configuración actual del transportista</span><code>Itinerario DEMO</code></div><dl><dt>Horario de ingreso programado:</dt><dd className="numeric">{formatTime(vehicle.arrival)}</dd><dt>Corredor de tránsito actual:</dt><dd>{vehicle.route}</dd></dl><div className="comparison-footer">Impacto estimado en red: <strong>— Sin calcular</strong></div></div>
      <div className="comparison-box proposed"><div className="section-header"><span><Icon name="lightbulb" />Propuesta SITRAC</span><code>Pendiente</code></div><dl><dt>Horario propuesto:</dt><dd className="pending">— Pendiente de calcular solución</dd><dt>Ruta recomendada:</dt><dd className="pending">— Pendiente de optimización</dd></dl><p>Abre Planificar viaje para recomendar el horario y calcular la ruta del vehículo.</p><div className="comparison-footer">Ahorro proyectado: — <span>Cumplimiento: —</span></div></div></div>
    <div className="vehicle-detail-footer"><p><Icon name="info" />Los datos de este itinerario son ficticios y no han sido validados.</p><Button to={`/planificar-viaje?vehiculo=${vehicle.id}`} variant="primary" endIcon="arrow_forward">Planificar viaje</Button></div>
  </Panel>;
}
