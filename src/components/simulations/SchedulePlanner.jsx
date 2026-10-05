import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRouting } from '../../app/routingState';
import Button from '../ui/Button';
import TechnicalDetails from '../ui/TechnicalDetails';
import CostHelp from '../ui/CostHelp';
import SitracMap from '../map/SitracMap';
import RouteItinerary from '../map/RouteItinerary';
import { groupRouteStreets } from '../../optimization/graph/routePresentation';
import { formatTime, formatTimeRange } from '../../utils/formatTime';
import { provenanceOptions } from '../../data/mock/provenance';
import { mockDestinations } from '../../data/mock/destinations';
import PlanExplanation from './PlanExplanation';
import PlanTechnicalDetails from './PlanTechnicalDetails';
import HowSitracWorks from './HowSitracWorks';
import DemoActions from './DemoActions';
import RoadConditionControl from './RoadConditionControl';
import ConditionComparison from './ConditionComparison';
import ScheduleAlternatives from './ScheduleAlternatives';
import { configurationLabel } from '../../data/mock/vehiclePresentation';

const tourNames = ['vehicle', 'provenance', 'entry', 'schedule', 'destination', 'calculate', 'itinerary', 'closure', 'closure', 'recalculate', 'itinerary'];
export default function SchedulePlanner() {
  const { vehicles, vehicle, selectedVehicleId, selectVehicle, provenance, provenanceId, selectProvenance,
    schedule, optimizeSchedule, calculateScheduledRoute, origin, setOrigin, destination, setDestination, destinationInfo, destinationSelection, selectMapDestination,
    nodes, selectionRoads, demo, demoMapProps, exposure } = useRouting();
  const [searchParams] = useSearchParams();
  const requestedVehicle = searchParams.get('vehiculo');
  const [notice, setNotice] = useState('');
  const [mapMode, setMapMode] = useState(false);
  const [layers, setLayers] = useState({ traffic: false, network: false, freight: false, current: true, proposed: true });
  const [showLayers, setShowLayers] = useState(false);
  const [showClosure, setShowClosure] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [activeEdgeIds, setActiveEdgeIds] = useState([]);
  const [focus, setFocus] = useState({ segments: [], tick: 0 });
  const tourRefs = useRef({});
  useEffect(() => { if (requestedVehicle && requestedVehicle !== selectedVehicleId) selectVehicle(requestedVehicle); }, [requestedVehicle]);
  useEffect(() => {
    if (!exposure.enabled) return;
    if (exposure.step >= 7) setShowRoute(true);
    if (exposure.step >= 8 && exposure.step <= 10) setShowClosure(true);
    tourRefs.current[tourNames[exposure.step - 1]]?.scrollIntoView({ block: 'nearest' });
  }, [exposure.enabled, exposure.step]);
  const attachTour = name => ({ ref: element => { tourRefs.current[name] = element; }, className: exposure.enabled && tourNames[exposure.step - 1] === name ? 'exposure-highlight' : '' });
  const assignment = schedule.assignment ?? schedule.result?.assignments?.[0];
  const initialSlot = schedule.model?.candidates.get(selectedVehicleId)?.[0]?.slot;
  const route = schedule.route;
  const routeGroups = groupRouteStreets(route?.segments);

  const entry = nodes.find(node => node.id === origin);

  const selectDestinationOnMap = selection => { selectMapDestination(selection); setMapMode(false); setNotice(''); setActiveEdgeIds([]); };
  const hoverSegment = edgeId => setActiveEdgeIds(edgeId ? routeGroups.find(group => group.edgeIds.includes(edgeId))?.edgeIds ?? [edgeId] : []);
  const optimize = () => { const result = optimizeSchedule(selectedVehicleId); setNotice(result.status === 'optimal' ? '' : result.message); };
  return <section className="schedule-planner" aria-label="Planificar viaje">
    <div className="planner-map"><SitracMap variant="simulation" {...demoMapProps()} layers={layers} selectableRoads={selectionRoads}
      onRoadSelect={mapMode ? selectDestinationOnMap : undefined} onNodeReject={() => setNotice('Este punto se encuentra fuera de la red disponible para la demostración. Selecciona una vía incluida en el modelo.')}
      activeEdgeIds={activeEdgeIds} onSegmentHover={hoverSegment} focusSegments={focus.segments} focusTick={focus.tick} />
      <div className="map-selection-bar">{mapMode ? <><strong>🎯 Selecciona el destino sobre una vía</strong><button onClick={() => { setMapMode(false); setNotice(''); }}>Cancelar</button></> : <button onClick={() => setShowLayers(value => !value)}>Capas ▾</button>}
        {showLayers && !mapMode && <div className="map-layers">{[['freight', 'Vehículos de carga'], ['traffic', 'Tráfico DEMO'], ['network', 'Red académica']].map(([key, label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={event => setLayers(current => ({ ...current, [key]: event.target.checked }))} />{label}</label>)}</div>}
      </div>
      {demo.condition && <div className={`map-closure-banner ${demo.condition.type === 'congestion' ? 'congestion-condition' : ''}`} role="status">⚠ Simulación activa · {demo.condition.type === 'congestion' ? 'Congestión' : 'Vía cerrada'}: {demo.condition.streetName}</div>}
      {route && <div className="route-floating-card"><strong>{route.status === 'found' ? 'Ruta recomendada' : 'Sin ruta disponible'}</strong><b>{route.status === 'found' ? `${(route.distanceTotal / 1000).toFixed(2)} km · ${formatTime(route.slot)}` : 'Libera la vía para recuperar el recorrido'}</b><span>{routeGroups.map(group => group.streetName).join(' → ')}</span><button onClick={() => setShowRoute(value => !value)}>Ver recorrido</button></div>}
    </div>
    <aside className="planner-panel"><div className="planner-title"><h1>Planificar viaje</h1><p>Cuándo circular y por qué calles ir.</p><DemoActions /></div>
      <div {...attachTour('vehicle')}><div className="planner-field"><label htmlFor="vehicle-plan">Vehículo</label><select id="vehicle-plan" aria-label="Vehículo para planificar" value={selectedVehicleId} onChange={event => { selectVehicle(event.target.value); setNotice(''); setMapMode(false); setActiveEdgeIds([]); }}>{vehicles.map(item => <option key={item.id} value={item.id}>{item.id} · {item.selectorLabel}</option>)}</select><div className="vehicle-summary"><span>{vehicle.type}</span><span>Configuración: {configurationLabel(vehicle)}</span><span>Llega {formatTime(vehicle.arrival)}</span><span>Carga {vehicle.priority?.toLowerCase()}</span><span>Ventana {formatTimeRange(vehicle.window)}</span></div></div></div>
      <div {...attachTour('provenance')}><div className="planner-field"><label htmlFor="provenance-plan">Procedencia interurbana</label><select id="provenance-plan" aria-label="Procedencia" value={provenanceId} onChange={event => { selectProvenance(event.target.value); setNotice(''); }}>{provenanceOptions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><div className="provenance-note"><span>Corredor de llegada: {provenance.corridor}</span><small title="SITRAC utiliza la procedencia únicamente para identificar cómo llega el vehículo a Cajamarca. La optimización de ruta comienza en el punto de ingreso urbano.">ⓘ El viaje interprovincial no es calculado por Dijkstra.</small></div></div></div>
      <div {...attachTour('entry')}><p className="entry-summary"><strong>Punto de ingreso urbano</strong><span className="origin">● {entry.displayName}</span></p><details className="entry-change"><summary>CAMBIAR PUNTO DE INGRESO</summary><select aria-label="Punto de ingreso urbano" value={origin} onChange={event => setOrigin(event.target.value)}>{nodes.filter(node => ['A', 'H', 'N'].includes(node.id)).map(node => <option key={node.id} value={node.id}>{node.displayName}</option>)}</select></details></div>
      <div {...attachTour('schedule')}><div className="planner-field"><Button variant="primary" onClick={optimize}>RECOMENDAR HORARIO</Button>
        {assignment && <div className="schedule-result compact" role="status"><small>Horario inicialmente considerado: {formatTime(initialSlot)}</small><strong>{assignment.slot === schedule.alternatives[0]?.slot ? 'Horario recomendado' : 'Horario seleccionado'}</strong><b>{formatTime(assignment.slot)}</b><span>{assignment.slot === initialSlot ? 'SIN CAMBIOS' : 'REPROGRAMADO'}</span><p>{assignment.slot === initialSlot ? 'El horario inicial ya es factible y conveniente.' : 'Una franja factible dentro de la ventana disponible; consulta su posición y costo entre las opciones.'}</p></div>}
        <ScheduleAlternatives />
      </div></div>
      {notice && <p className="schedule-error" role="alert">{notice}</p>}
      {assignment && <><div {...attachTour('destination')}><div className="planner-field location-fields"><label htmlFor="destination-plan">DESTINO</label><select id="destination-plan" aria-label="Destino del viaje" value={destination} onChange={event => { setDestination(event.target.value); setMapMode(false); setActiveEdgeIds([]); }}>{mockDestinations.map(item => <option key={item.id} value={item.nodeId}>{item.name}</option>)}{!mockDestinations.some(item => item.nodeId === destination) && <option value={destination}>{destinationInfo.name}</option>}</select><button className="text-button" onClick={() => { setMapMode(true); setShowLayers(false); setNotice(''); }}>🎯 Elegir destino en mapa</button><small className="destination-note">{destinationSelection ? 'Punto seleccionado sobre una vía · operación DEMO' : destinationInfo.geographicReal ? 'Lugar real · operación logística DEMO' : 'Punto de entrega DEMO'}</small></div></div>
        <div {...attachTour('calculate')}><Button variant="primary" onClick={() => { const result = calculateScheduledRoute(); setNotice(result?.status === 'unreachable' ? 'No existe ruta disponible hasta este destino dentro de la red local.' : ''); setShowRoute(true); setActiveEdgeIds([]); }}>CALCULAR RUTA</Button></div>
      </>}
      {route && <><p className="route-cost">Costo del modelo: {route.costTotal?.toFixed(1) ?? '—'} <CostHelp /></p><PlanExplanation />
        <div {...attachTour('itinerary')}>{showRoute && <RouteItinerary route={route} originName={entry.displayName} destinationName={destinationInfo.name} activeEdgeIds={activeEdgeIds} onHover={setActiveEdgeIds} onFocusRoute={segments => setFocus(current => ({ segments, tick: current.tick + 1 }))} />}</div>
        <div {...attachTour('closure')}><RoadConditionControl open={showClosure} setOpen={setShowClosure}
          onFocus={segments => setFocus(current => ({ segments, tick: current.tick + 1 }))} onHighlight={setActiveEdgeIds}
          onChange={() => { setActiveEdgeIds([]); setNotice(''); }} recalculateProps={attachTour('recalculate')} /></div>
        <ConditionComparison result={demo.updated}><Button to="/resultados">Comparar plan</Button></ConditionComparison>
      </>}
      <HowSitracWorks />
      <TechnicalDetails title="Ver detalles técnicos"><PlanTechnicalDetails /></TechnicalDetails>
    </aside>
  </section>;
}
