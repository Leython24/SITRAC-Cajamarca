import { buildGraph } from './buildGraph';
import { dijkstra } from './dijkstra';

export const formatRouteNumber = value => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 }).format(value);
export function explainRoute(graph, origin, destination, conditions, result) {
  if (!result) return 'Selecciona un origen y un destino y pulsa CALCULAR RUTA.';
  if (result.status === 'unreachable') return 'No existe ruta disponible entre estos puntos con los bloqueos actuales. No se muestra una propuesta anterior.';
  if (origin === destination) return 'El origen y el destino coinciden: no es necesario recorrer ningún tramo. Distancia y costo: 0.';
  const normal = dijkstra(graph, origin, destination);
  const effective = buildGraph(graph, conditions);
  const byId = new Map(effective.edges.map(edge => [edge.id, edge]));
  const normalSegments = normal.edgeIds.map(id => byId.get(id));
  const blocked = normalSegments.filter(edge => edge.status === 'blocked');
  const selectedCost = formatRouteNumber(result.costTotal);
  if (blocked.length) return `SITRAC excluyó ${blocked.map(edge => edge.name).join(', ')} por bloqueo y encontró una alternativa disponible de costo total ${selectedCost}.`;
  const normalCost = normalSegments.reduce((sum, edge) => sum + edge.cost, 0);
  if (result.edgeIds.join('|') !== normal.edgeIds.join('|') && normalCost > result.costTotal) {
    return `Con la congestión actual, el recorrido de condiciones normales costaría ${formatRouteNumber(normalCost)}. Dijkstra seleccionó una alternativa de menor costo: ${selectedCost}.`;
  }
  const unchanged = result.edgeIds.join('|') === normal.edgeIds.join('|');
  return `Dijkstra encontró una ruta de costo mínimo ${selectedCost} entre los puntos seleccionados. ${unchanged ? 'La secuencia de tramos coincide con la de condiciones normales.' : 'Existen alternativas de igual costo; se selecciona una de forma determinista.'}`;
}
