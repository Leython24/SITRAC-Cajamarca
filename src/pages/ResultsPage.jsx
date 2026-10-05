import { useState } from 'react';
import { useRouting } from '../app/routingState';
import { formatTime } from '../utils/formatTime';
import { routeAppearance } from '../data/mapConfig';
import { groupRouteStreets } from '../optimization/graph/routePresentation';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import TechnicalDetails from '../components/ui/TechnicalDetails';
import SitracMap from '../components/map/SitracMap';
import RouteItinerary from '../components/map/RouteItinerary';
import PlanExplanation from '../components/simulations/PlanExplanation';
import PlanTechnicalDetails from '../components/simulations/PlanTechnicalDetails';
import HowSitracWorks from '../components/simulations/HowSitracWorks';
import CostHelp from '../components/ui/CostHelp';
import ConditionComparison from '../components/simulations/ConditionComparison';

const streetNames = route => groupRouteStreets(route?.segments).map(group => group.streetName).join(' → ') || 'Sin recorrido';
const distance = route => route?.status === 'found' ? `${(route.distanceTotal / 1000).toFixed(2)} km` : 'Sin ruta disponible';
export default function ResultsPage() {
  const { schedule, demo, demoMapProps, nodes, origin, destinationInfo, vehicle, network } = useRouting();
  const [view, setView] = useState('after');
  const [active, setActive] = useState([]);
  const [focus, setFocus] = useState({ segments: [], tick: 0 });
  const route = schedule.route;
  const original = schedule.originalRoute;
  const selected = schedule.assignment ?? schedule.result?.assignments?.[0];
  const blockedNames = [...new Set(network.edges.filter(edge => demo.updated?.appliedEdges.includes(edge.id)).map(edge => edge.streetName))];
  const currentView = view === 'before' ? original : route;
  const groups = groupRouteStreets(currentView?.segments);
  const mapProps = { ...demoMapProps(), roads: view === 'before' ? demoMapProps().roads.filter(road => road.status !== 'blocked' && !road.simulatedCongestion) : demoMapProps().roads, proposedRoute: currentView?.status === 'found' ? { ...(view === 'before' ? routeAppearance.current : routeAppearance.proposed), name: view === 'before' ? 'Ruta anterior' : 'Ruta SITRAC', positions: currentView.coordinates, segments: currentView.segments, calculated: true } : null,
    currentRoute: view === 'before' ? null : demoMapProps().currentRoute, routingState: currentView?.status ?? 'pending' };
  return <div className="page results-page plan-results-page"><div className="section-header"><div><span className="eyebrow">RESULTADO DEL PLAN · DEMO ACADÉMICO</span><h1>Resultado del viaje</h1></div><Button to="/planificar-viaje">Volver a planificar</Button></div>
    {!route || !selected ? <Panel><h2>Prepara el plan</h2><p>Selecciona un vehículo, recomienda un horario y calcula su ruta para comparar las decisiones.</p><Button to="/planificar-viaje" variant="primary">Planificar viaje</Button></Panel> : <div className="results-workspace"><div className="results-map"><div className="segmented-control result-toggle"><button aria-pressed={view === 'before'} onClick={() => { setView('before'); setActive([]); }}>Antes</button><button aria-pressed={view === 'after'} onClick={() => { setView('after'); setActive([]); }}>Propuesta SITRAC</button></div><SitracMap variant="results" view={view} {...mapProps} activeEdgeIds={active} onSegmentHover={id => setActive(id ? groups.find(group => group.edgeIds.includes(id))?.edgeIds ?? [id] : [])} focusSegments={focus.segments} focusTick={focus.tick} /></div>
      <aside className="results-plan"><h2>{vehicle.id} · Plan de viaje</h2><div className="result-before"><h3>ANTES</h3><p>Horario original: <strong>{formatTime(schedule.originalSlot)}</strong></p><p>Ruta original: {streetNames(original)}</p><p>Distancia: <strong>{distance(original)}</strong></p></div><div className="result-after"><h3>PROPUESTA SITRAC</h3><p>{selected.slot === schedule.alternatives[0]?.slot ? 'Horario recomendado' : 'Horario elegido'}: <strong>{formatTime(selected.slot)}</strong></p><p>Ruta recomendada: {streetNames(route)}</p><p>Distancia: <strong>{distance(route)}</strong></p><p>Costo del modelo: {route.costTotal?.toFixed(1) ?? '—'} <CostHelp /></p></div>
        <div className="planner-change"><h3>¿Qué cambió?</h3><p>Horario: {formatTime(schedule.originalSlot)} → {formatTime(selected.slot)}</p>{demo.updated?.simulatedCondition.type !== 'congestion' && <p>Vía evitada: {blockedNames.join(', ') || 'Ninguna'}</p>}</div>
        <ConditionComparison result={demo.updated} />
        <PlanExplanation /><RouteItinerary title={view === 'before' ? 'RUTA ORIGINAL' : 'RUTA RECOMENDADA'} route={currentView} originName={nodes.find(point => point.id === origin).displayName} destinationName={destinationInfo.name} activeEdgeIds={active} onHover={setActive} onFocusRoute={segments => setFocus(current => ({ segments, tick: current.tick + 1 }))} />
      </aside></div>}
    <HowSitracWorks /><TechnicalDetails title="Ver detalles técnicos"><PlanTechnicalDetails /></TechnicalDetails>
  </div>;
}
