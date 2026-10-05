import { useRouting } from '../../app/routingState';
import { formatTime } from '../../utils/formatTime';

export default function PlanExplanation() {
  const { schedule, demo } = useRouting();
  const assignment = schedule.assignment ?? schedule.result?.assignments?.[0];
  const initial = schedule.model?.candidates.get(schedule.vehicleId)?.[0];
  const route = schedule.route;
  return <details className="plan-explanation"><summary>VER POR QUÉ</summary>
    {assignment && <><h3>Horario · Programación Entera</h3><p>{assignment.slot !== schedule.alternatives[0]?.slot ? `Seleccionaste la segunda mejor alternativa factible: ${formatTime(assignment.slot)}. Su costo se calculó con las mismas restricciones; no es la opción de menor costo.` : assignment.slot === initial?.slot ? 'El horario inicialmente considerado ya es una alternativa factible y conveniente dentro del modelo.' : `Se recomienda ${formatTime(assignment.slot)} porque es una franja factible de menor costo dentro de la ventana disponible del vehículo.`}</p><p>Costo horario: {assignment.cost.total.toFixed(2)}. Se consideran congestión DEMO y espera.</p></>}
    {route && <><h3>Ruta · Dijkstra</h3><p>{route.status === 'found' ? 'Dijkstra seleccionó estos tramos porque su costo acumulado es el menor entre las alternativas disponibles.' : 'No existe un recorrido disponible con las condiciones actuales.'}</p><p>La franja {formatTime(route.slot)} utiliza un incremento de tráfico DEMO de {route.conditions.trafficIncrease}%; este supuesto determina el nivel de congestión y el costo de cada tramo.</p>{demo.updated?.appliedEdges.length > 0 && <p>Además, la vía bloqueada fue excluida de las alternativas durante el recálculo.</p>}{demo.updated?.simulatedCondition.type === 'congestion' && <p>La congestión simulada modifica el factor de la vía afectada. El costo de cada tramo es distancia × factor de congestión; la vía permanece disponible.</p>}</>}
  </details>;
}
