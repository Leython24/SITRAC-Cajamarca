import { useRouting } from '../../app/routingState';
import { formatTime } from '../../utils/formatTime';

export default function PlanTechnicalDetails() {
  const { schedule, demo, origin, destination, network } = useRouting();
  const options = schedule.model?.candidates.get(schedule.vehicleId) ?? [];
  return <div className="plan-technical"><h3>Programación Entera Binaria</h3>
    <p>x(i,h) = 1 si el vehículo i se asigna a la franja h. Una franja por vehículo; llegada, fin de ventana, franjas restringidas y capacidad. El planificador evalúa el vehículo seleccionado; el solver existente también admite el caso conjunto.</p>
    <p>Combinaciones factibles para este vehículo: {options.length}. Horario seleccionado: {formatTime(schedule.assignment?.slot ?? schedule.result?.assignments?.[0]?.slot ?? '—')}. Costo horario: {schedule.assignment?.cost.total.toFixed(3) ?? schedule.result?.objective?.toFixed(3) ?? '—'}.</p>
    <div className="table-scroll"><table><thead><tr><th>Franja</th><th>Congestión DEMO</th><th>Espera</th><th>Costo total</th></tr></thead><tbody>{options.map(option => <tr key={option.slot}><td>{formatTime(option.slot)}</td><td>{option.cost.congestionCost}</td><td>{option.cost.waitingCost.toFixed(3)}</td><td>{option.cost.total.toFixed(3)}</td></tr>)}</tbody></table></div>
    <h3>Dijkstra</h3><p>Origen: {origin}. Destino: {destination}. Bloqueos: {demo.edgeIds.join(', ') || 'Ninguno'}.</p>
    <p>Tramos de la red: {network.edges.length}. Tramos seleccionados: {schedule.route?.segments.length ?? 0}. Costo acumulado: {schedule.route?.costTotal?.toFixed(1) ?? '—'}. Costo del tramo = distancia × factor de congestión.</p>
    <p>Las geometrías son OSM. No se importan rutas calculadas por servicios externos. La operación, los factores de congestión y los horarios son DEMO.</p>
    <div className="table-scroll"><table><thead><tr><th>Orden</th><th>Edge</th><th>Calle</th><th>Distancia m</th><th>Factor</th><th>Costo</th><th>Acumulado</th></tr></thead><tbody>{schedule.route?.segments.map((segment, index, segments) => <tr key={segment.edgeId}><td>{segment.order}</td><td>{segment.edgeId}</td><td>{segment.streetName}</td><td>{segment.distance.toFixed(1)}</td><td>{segment.congestionFactor}</td><td>{segment.cost.toFixed(1)}</td><td>{segments.slice(0, index + 1).reduce((sum, item) => sum + item.cost, 0).toFixed(1)}</td></tr>)}</tbody></table></div>
  </div>;
}
