import { useEffect, useRef } from 'react';
import { useRouting } from '../../app/routingState';
import { demoRoadNetwork } from '../../data/mock/roadNetwork';
import { formatRouteNumber } from '../../optimization/graph/explainRoute';
import SitracMap from '../map/SitracMap';
import Panel from '../ui/Panel';

export const formatKilometers = meters => new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(meters / 1000);

function RouteCard({ title, result, selected }) {
  return <article className={`demo-route-card ${selected ? 'selected' : ''}`} aria-label={title}><h3>{title}</h3>
    {result.status === 'found' ? <><dl><div><dt>Distancia</dt><dd>{formatKilometers(result.distanceTotal)} km</dd></div><div><dt>Costo</dt><dd>{formatRouteNumber(result.costTotal)}</dd></div></dl>
      <p><strong>Vías utilizadas:</strong> {result.segments.length ? result.segments.map(segment => segment.name).join(' → ') : 'El origen coincide con el destino; no es necesario recorrer vías.'}</p></> : <p>No hay un recorrido disponible entre estos puntos.</p>}
  </article>;
}

// Explain the stored calculations without a generated-text service.
function changeExplanation(initial, updated) {
  const blocked = demoRoadNetwork.edges.find(edge => edge.id === updated.appliedEdge);
  if (updated.status === 'unreachable') return 'La vía cerrada deja estos puntos sin una conexión disponible. SITRAC no dibuja una ruta que no puede recorrerse.';
  if (!blocked) return 'No se cerró ninguna vía. Las condiciones se mantienen y Dijkstra conserva el recorrido de menor costo.';
  if (initial.edgeIds.join('|') === updated.edgeIds.join('|')) return 'La vía cerrada no cambia el recorrido de menor costo entre estos puntos.';
  return `La ruta cambió porque ${blocked.name}, utilizada inicialmente, fue bloqueada. Dijkstra volvió a evaluar las alternativas y encontró el recorrido de menor costo entre las vías que siguen disponibles.`;
}

export default function DemoComparison() {
  const { demo, demoMapProps, comparisonView, setComparisonView, exposure } = useRouting();
  const ref = useRef(null);
  useEffect(() => { if (exposure.enabled && exposure.step === 4) ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, [exposure.enabled, exposure.step]);
  if (!demo.initial || !demo.updated) return null;
  const blocked = demoRoadNetwork.edges.find(edge => edge.id === demo.updated.appliedEdge);
  return <Panel ref={ref} className={`demo-comparison ${exposure.enabled && exposure.step === 4 ? 'exposure-highlight' : ''}`} aria-label="Comparación de la demostración">
    <div className="section-header"><div><span className="eyebrow">3 · Comparar</span><h2>¿Qué cambió?</h2><p>Compara la ruta inicial con el nuevo cálculo · DEMO ACADÉMICO</p></div>
      <div className="segmented-control" aria-label="Antes y después"><button aria-pressed={comparisonView === 'before'} onClick={() => setComparisonView('before')}>Antes</button><button aria-pressed={comparisonView === 'after'} onClick={() => setComparisonView('after')}>Después</button></div>
    </div>
    <SitracMap variant="results" view={comparisonView} {...demoMapProps(comparisonView, true)} />
    <div className="demo-route-cards"><RouteCard title="Ruta inicial" result={demo.initial} selected={comparisonView === 'before'} /><RouteCard title="Nueva ruta" result={demo.updated} selected={comparisonView === 'after'} /></div>
    <div className="demo-reason"><h3>¿Por qué cambió?</h3><p><strong>Vía evitada:</strong> {blocked?.name ?? 'Ninguna'}</p><p>{changeExplanation(demo.initial, demo.updated)}</p><small>El costo compara distancia y congestión; no representa dinero ni tiempo de viaje.</small></div>
  </Panel>;
}
