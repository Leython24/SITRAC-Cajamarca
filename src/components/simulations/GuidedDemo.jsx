import { useEffect, useRef } from 'react';
import { useRouting } from '../../app/routingState';
import { formatRouteNumber } from '../../optimization/graph/explainRoute';
import { formatKilometers } from '../results/DemoComparison';
import DemoComparison from '../results/DemoComparison';
import SitracMap from '../map/SitracMap';
import Panel from '../ui/Panel';
import Button from '../ui/Button';

export default function GuidedDemo({ simplified = false }) {
  const { nodes, edges, origin, destination, setDemoEndpoint, demo, setDemoProblem, calculateDemo, recalculateDemo, demoMapProps, exposure } = useRouting();
  const endpointRef = useRef(null), calculateRef = useRef(null), problemRef = useRef(null);
  useEffect(() => {
    if (!exposure.enabled) return;
    [endpointRef, calculateRef, problemRef][exposure.step - 1]?.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [exposure.enabled, exposure.step]);
  const highlight = step => exposure.enabled && exposure.step === step ? 'exposure-highlight' : '';
  const canBlock = Boolean(demo.initial?.edgeIds.length);
  const problemRoads = edges.filter(edge => demo.initial?.edgeIds.includes(edge.id));
  return <section className="guided-demo" aria-label="Demostración guiada">
    <ol className="demo-stages"><li className="active"><b>1</b>Situación actual</li><li className={demo.initial ? 'active' : ''}><b>2</b>Probar un problema</li><li className={demo.updated ? 'active' : ''}><b>3</b>Comparar</li></ol>
    <Panel className="demo-workspace"><div className="demo-map-area"><div className="section-header"><div><h2>Situación actual</h2><p>SITRAC analiza las vías disponibles entre un origen y un destino.</p></div><span className="demo-tag">DEMO ACADÉMICO</span></div>
      <SitracMap variant="guided" {...demoMapProps()} />
      <p className="small muted">Cajamarca, Perú · Mueve el mapa o utiliza + y −. Trazados y distancias de ejemplo.</p>
    </div><div className="demo-controls">
      {!simplified && <div ref={endpointRef} className={`demo-endpoints ${highlight(1)}`}><h3>1 · Elige el recorrido</h3>
        <label>Origen<select aria-label="Origen de la demostración" value={origin} onChange={event => setDemoEndpoint('origin', event.target.value)}>{nodes.map(point => <option key={point.id} value={point.id}>{point.displayName}</option>)}</select></label>
        <label>Destino<select aria-label="Destino de la demostración" value={destination} onChange={event => setDemoEndpoint('destination', event.target.value)}>{nodes.map(point => <option key={point.id} value={point.id}>{point.displayName}</option>)}</select></label>
        <p><strong>Estado de las vías:</strong> {demo.closed ? 'Una vía cerrada para la prueba' : 'Condición normal'}</p>
      </div>}
      {!simplified && <div ref={calculateRef} className={`demo-calculate ${highlight(2)}`}><Button variant="primary" icon="alt_route" className="full-width" onClick={calculateDemo}>CALCULAR MEJOR RUTA</Button></div>}
      {demo.initial && <div className="demo-initial-result" role="status">{demo.initial.status === 'found' ? <><strong>Ruta calculada</strong><p>{formatKilometers(demo.initial.distanceTotal)} km · Costo {formatRouteNumber(demo.initial.costTotal)}</p>{!canBlock && <p>Ya estás en el destino. Elige puntos distintos para probar un cierre.</p>}</> : <p>No hay ruta disponible. Elige otros puntos.</p>}</div>}
      {canBlock && <div ref={problemRef} className={`demo-problem ${highlight(3)}`}><h3>{simplified ? '5 · ¿Qué pasa si una vía se cierra?' : '2 · Probar un problema'}</h3><p>Prueba qué ocurre si una vía deja de estar disponible.</p>
        <label className="demo-closure"><input type="checkbox" checked={demo.closed} onChange={event => setDemoProblem({ closed: event.target.checked })} />Cerrar una vía</label>
        {demo.closed && <label>Vía a cerrar<select aria-label="Vía a cerrar" value={demo.edgeId} onChange={event => setDemoProblem({ edgeId: event.target.value })}>{problemRoads.map(road => <option key={road.id} value={road.id}>{road.name}</option>)}</select></label>}
        <Button variant="primary" icon="refresh" className="full-width" onClick={recalculateDemo}>RECALCULAR RUTA</Button>
        {!demo.updated && <small>El nuevo recorrido se calcula al pulsar el botón.</small>}
        {demo.updated && <Button to="/resultados" className="full-width">Ver comparación</Button>}
      </div>}
    </div></Panel><DemoComparison />
  </section>;
}
