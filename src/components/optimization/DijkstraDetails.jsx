import { useRouting } from '../../app/routingState';
import { congestionConfig } from '../../optimization/graph/costConfig';
import { formatRouteNumber } from '../../optimization/graph/explainRoute';
import TechnicalDetails from '../ui/TechnicalDetails';

export default function DijkstraDetails() {
  const { result } = useRouting();
  return <>
    <section className="io-technique"><h3>Técnica de Investigación de Operaciones</h3><p><strong>Modelo de redes — Problema de ruta más corta</strong></p><p>Algoritmo: <strong>Dijkstra</strong></p><p><strong>Decisión:</strong> seleccionar por qué vías circular. <strong>Objetivo:</strong> minimizar el costo total del recorrido.</p><p className="io-flow">Origen → Red vial → Costos de tramos → Dijkstra → Ruta de menor costo → Destino</p></section>
    <TechnicalDetails title="Ver cómo funciona Dijkstra">
      <ol><li>La ciudad se representa como una red.</li><li>Las intersecciones son nodos.</li><li>Las calles son conexiones.</li><li>Cada conexión tiene un costo.</li><li>Dijkstra evalúa los costos acumulados y fija el punto pendiente de menor costo.</li><li>Selecciona la ruta de menor costo hasta el destino.</li></ol>
      <p><strong>Costo del tramo = distancia × factor de congestión</strong></p>
      <p>{congestionConfig.levels.map(level => `${congestionConfig.labels[level]}: ${congestionConfig.factors[level].toFixed(1)}`).join(' · ')}. Bloqueado: excluido del cálculo.</p>
      <p>Supuesto académico del escenario: cada +10% de tráfico eleva un nivel la congestión del corredor principal. Los desvíos suben un nivel al llegar a +30%. El máximo es congestión. Un accidente lleva el tramo seleccionado a congestión; una reducción de carril, al menos a tráfico alto. Un ajuste manual sustituye el nivel del escenario, antes de aplicar incidentes.</p>
      <p>La red tiene 12 nodos y 13 conexiones, consideradas bidireccionales solo para esta demostración. No valida sentidos reales ni permisos de circulación.</p>
      {result?.status === 'found' && <><p>Secuencia calculada de nodos: <code>{result.nodeIds.join(' → ')}</code></p><div className="route-technical-table"><table><thead><tr><th>Tramo</th><th>Distancia (m)</th><th>Factor</th><th>Costo</th></tr></thead><tbody>{result.segments.map(edge => <tr key={edge.id}><td>{edge.name}</td><td>{formatRouteNumber(edge.distance)}</td><td>{edge.factor}</td><td>{formatRouteNumber(edge.cost)}</td></tr>)}</tbody></table></div></>}
    </TechnicalDetails>
  </>;
}
