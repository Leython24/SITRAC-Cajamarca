import { useRouting } from '../../app/routingState';
import { formatRouteNumber } from '../../optimization/graph/explainRoute';

export default function RouteSummary() {
  const { result, explanation, currentRoute, origin, destination, nodes } = useRouting();
  const found = result?.status === 'found';
  const originName = nodes.find(node => node.id === origin)?.displayName ?? origin;
  const destinationName = nodes.find(node => node.id === destination)?.displayName ?? destination;
  const streets = found ? result.segments.reduce((names, segment) => {
    const name = segment.streetName ?? segment.name;
    if (names[names.length - 1] !== name) names.push(name);
    return names;
  }, []) : [];
  return <section className="route-summary" aria-label="Resultado de Dijkstra">
    <div className="route-comparison">
      <div><h3>Ruta actual</h3><span className="small muted">Original DEMO · {currentRoute ? 'Referencia visual' : 'Sin referencia para estos puntos'}</span><dl><div><dt>Distancia</dt><dd>—</dd></div><div><dt>Costo</dt><dd>—</dd></div></dl></div>
      <div><h3>Ruta recomendada</h3><span className="small muted">{found ? 'Calculada por SITRAC' : result ? 'No existe ruta disponible' : 'Pendiente de calcular'}</span><dl><div><dt>Distancia</dt><dd>{found ? `${(result.distanceTotal / 1000).toFixed(2)} km` : '—'}</dd></div><div><dt>Costo <span title="Es un valor utilizado por Dijkstra para comparar alternativas. Combina distancia y nivel de congestión. Un costo menor representa una alternativa más conveniente dentro del modelo." aria-label="Ayuda sobre costo">ⓘ</span></dt><dd>{found ? formatRouteNumber(result.costTotal) : '—'}</dd></div><div><dt>Calles utilizadas</dt><dd>{found ? streets.length : '—'}</dd></div></dl></div>
    </div>
    <p className="route-explanation" role="status">{explanation}</p>
    {found && <div className="route-readable"><h3>Ruta recomendada</h3><p><strong>Inicio:</strong> {originName}</p>{streets.length ? <ol className="route-segments">{streets.map(street => <li key={street}>{street}</li>)}</ol> : <p className="small">Ninguno: el origen coincide con el destino.</p>}<p><strong>Destino:</strong> {destinationName}</p></div>}
    <p className="small muted">Datos de demostración académica. El costo pondera la distancia; no representa minutos ni dinero.</p>
  </section>;
}
