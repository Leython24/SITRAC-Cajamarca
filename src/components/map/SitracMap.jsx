import { useEffect, useMemo, useRef, useState } from 'react';
import { divIcon } from 'leaflet';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Popup, Tooltip, Pane, useMap, useMapEvents } from 'react-leaflet';
import { mapConfig } from '../../data/mapConfig';
import { mockTraffic } from '../../data/mock/traffic';
import { mockVehicles } from '../../data/mock/vehicles';
import { mockVehiclePositions } from '../../data/mock/geography';
import { congestionConfig } from '../../optimization/graph/costConfig';
import { findNearestRoadSegment } from '../../optimization/graph/roadSelection';
import { formatRouteNumber } from '../../optimization/graph/explainRoute';
import { groupRouteStreets } from '../../optimization/graph/routePresentation';
import Icon from '../ui/Icon';
import VehiclePopup from './VehiclePopup';

const defaultLayers = { traffic: false, network: false, freight: false, current: false, proposed: true };
const truckIcon = divIcon({ className: 'freight-marker', html: '<span class="icon" aria-hidden="true">local_shipping</span>', iconSize: [32, 32], iconAnchor: [16, 16] });
function MapControls({ routeCoordinates, endpointCoordinates, focusSegments, focusTick, selectedVehicle }) {
  const map = useMap();
  const endpointKey = endpointCoordinates.map(point => point.join(',')).join(';');
  useEffect(() => { map.attributionControl.setPosition('bottomleft'); const observer = new ResizeObserver(() => map.invalidateSize({ pan: false })); observer.observe(map.getContainer()); return () => observer.disconnect(); }, [map]);
  useEffect(() => {
    const points = routeCoordinates?.length ? routeCoordinates : endpointCoordinates;
    if (!points?.length) return;
    if (points.length === 1) map.setView(points[0], 16);
    else map.fitBounds(points, { paddingTopLeft: [55, 45], paddingBottomRight: [165, 175], maxZoom: 16 });
  }, [map, routeCoordinates, endpointKey]);
  useEffect(() => { if (focusSegments?.length) map.fitBounds(focusSegments.flatMap(segment => segment.geometry), { padding: [60, 60], maxZoom: 18 }); }, [map, focusTick]);
  useEffect(() => { if (selectedVehicle && mockVehiclePositions[selectedVehicle]) map.setView(mockVehiclePositions[selectedVehicle], 16); }, [map, selectedVehicle]);
  return <div className="geo-map-controls"><button aria-label="Acercar mapa" onClick={() => map.zoomIn()}><Icon name="add" /></button><button aria-label="Alejar mapa" onClick={() => map.zoomOut()}><Icon name="remove" /></button><button aria-label="Centrar en Cajamarca" onClick={() => map.setView(mapConfig.center, mapConfig.zoom)}><Icon name="my_location" /></button></div>;
}
function MapDestinationSelector({ roads, onSelect, onReject }) {
  const map = useMapEvents({ click: event => {
    const selection = findNearestRoadSegment([event.latlng.lat, event.latlng.lng], roads);
    if (selection) onSelect(selection); else onReject?.();
  } });
  useEffect(() => { map.closePopup(); }, [map]);
  return null;
}
function RoadLayer({ road, selected, onSelect, onHover, routeMember = false, academic = false }) {
  const blocked = road.status === 'blocked';
  const ref = useRef(null);
  useEffect(() => {
    const path = ref.current?.getElement(); if (!path) return;
    path.setAttribute('role', 'button'); path.setAttribute('tabindex', '0'); path.setAttribute('aria-label', `Seleccionar ${road.streetName ?? road.name}`);
    path.setAttribute('data-edge-id', road.id);
    const activate = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.(road.id); ref.current.openPopup(); } };
    path.addEventListener('keydown', activate); return () => path.removeEventListener('keydown', activate);
  }, [road, onSelect]);
  return <Polyline ref={ref} positions={road.geometry ?? road.positions} pathOptions={{ color: blocked ? '#dc2626' : academic ? '#94a3b8' : road.color, weight: blocked ? 9 : selected ? 9 : road.simulatedCongestion ? 7 : academic ? 3 : 5, opacity: blocked || road.simulatedCongestion ? 1 : .7 }} eventHandlers={{ click: () => onSelect?.(road.id), mouseover: () => onHover?.(road.id), mouseout: () => onHover?.(null) }}>
    <Tooltip sticky><div className={road.simulatedCongestion ? 'route-tooltip' : undefined}><strong>{blocked ? 'VÍA CERRADA EN LA SIMULACIÓN' : road.streetName ?? road.name}</strong><br />{blocked && <>{road.streetName ?? road.name}<br />Estado: No disponible<br />Dijkstra no podrá utilizar esta conexión durante el recálculo.</>}{!blocked && `${road.state} · DEMO`}{road.simulatedCongestion && <><p>Distancia: {Math.round(road.distance)} m</p><p>Factor: {road.factor}</p><p>Costo del tramo: {formatRouteNumber(road.cost)}</p><small>{routeMember && <>Este tramo forma parte de la ruta calculada por Dijkstra.<br /></>}La vía continúa disponible para Dijkstra. El costo no representa dinero.</small></>}</div></Tooltip>
    <Popup>{road.streetName ?? road.name}<br />{blocked ? 'No disponible durante el recálculo · DEMO' : road.state}</Popup>
  </Polyline>;
}
function RouteSegment({ segment, total, active, onHover, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const path = ref.current?.getElement(); if (!path) return;
    path.setAttribute('role', 'button'); path.setAttribute('tabindex', '0'); path.setAttribute('aria-label', `Tramo ${segment.order}: ${segment.streetName}`);
    path.setAttribute('data-edge-id', segment.edgeId);
    const focus = () => { onHover?.(segment.edgeId); ref.current.openTooltip(); }, blur = () => { onHover?.(null); ref.current.closeTooltip(); };
    const key = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ref.current.openPopup(); } };
    path.addEventListener('focus', focus); path.addEventListener('blur', blur); path.addEventListener('keydown', key);
    return () => { path.removeEventListener('focus', focus); path.removeEventListener('blur', blur); path.removeEventListener('keydown', key); };
  }, [segment, onHover]);
  const information = <div className="route-tooltip"><strong>{segment.streetName}</strong><p>{segment.edgeIds ? 'Recorrido agrupado por el Óvalo Musical' : `Tramo ${segment.order} de ${total}`}</p><p>Distancia: {Math.round(segment.distance)} m</p><p>Tráfico: {congestionConfig.labels[segment.congestionLevel]}</p><p>Factor: {segment.congestionFactor}</p><p>Costo del tramo: {formatRouteNumber(segment.cost)}</p><small>Este tramo forma parte de la ruta calculada por Dijkstra.<br />El costo no representa dinero.</small></div>;
  return <Polyline ref={ref} positions={segment.geometry} pathOptions={{ color, weight: active ? 9 : 5, opacity: 1 }} eventHandlers={{ mouseover: () => onHover?.(segment.edgeId), mouseout: () => onHover?.(null) }}><Tooltip sticky>{information}</Tooltip><Popup minWidth={240} maxWidth={280}>{information}</Popup></Polyline>;
}
function EndpointMarker({ point }) {
  const ref = useRef(null);
  useEffect(() => { const path = ref.current?.getElement(); if (!path) return; path.setAttribute('role', 'button'); path.setAttribute('tabindex', '0'); path.setAttribute('aria-label', `Ver ${point.label.toLowerCase()}: ${point.name}`); const key = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ref.current.openPopup(); } }; path.addEventListener('keydown', key); return () => path.removeEventListener('keydown', key); }, [point]);
  const origin = point.label === 'Origen';
  return <CircleMarker ref={ref} pane="markerPane" center={point.position} radius={9} pathOptions={{ color: origin ? '#15803d' : '#7c3aed', fillColor: 'white', fillOpacity: 1, weight: 3 }}>
    <Tooltip permanent direction="top">{origin ? 'Ingreso' : 'Destino'}</Tooltip>
    <Popup><div className="map-popup-content"><strong>{origin ? 'ORIGEN URBANO' : 'DESTINO'}</strong>{origin ? <><p>Procedencia: {point.provenance?.label ?? 'DEMO'}</p><p>Corredor: {point.provenance?.corridor ?? 'Ingreso al área modelada'}</p><p>Ingreso al modelo: {point.name}</p><small>SITRAC comienza aquí la optimización urbana. El trayecto interprovincial no es calculado por Dijkstra.</small></> : <><p>Nombre: {point.name}</p><p>Categoría: {point.category ?? 'Punto de entrega'}</p><small>{point.geographicReal ? 'Ubicación geográfica real · operación logística DEMO' : 'Punto sobre la red disponible · operación logística DEMO'}</small></>}</div></Popup>
  </CircleMarker>;
}
export default function SitracMap({ variant = 'home', selected, onSelect, layers = defaultLayers, view = 'after', vehicle,
  roads = mockTraffic, currentRoute = null, proposedRoute = null, routingState = 'pending', presentation = false, endpoints = [],
  selectableRoads = [], onRoadSelect, onNodeReject, activeEdgeIds = [], onSegmentHover, focusSegments = [], focusTick = 0 }) {
  const [tileFailed, setTileFailed] = useState(false);
  const blocked = roads.filter(road => road.status === 'blocked');
  const congested = roads.filter(road => road.simulatedCongestion);
  const base = roads.filter(road => road.status !== 'blocked' && !road.simulatedCongestion);
  const showCurrent = currentRoute && (presentation || variant !== 'results' ? layers.current : view === 'before');
  const showProposed = proposedRoute && (presentation || variant !== 'results' ? layers.proposed : view === 'after');
  const activeRoute = showProposed ? proposedRoute : showCurrent ? currentRoute : null;
  const routeSegments = groupRouteStreets(proposedRoute?.segments).flatMap(group => group.streetName === 'Óvalo Musical'
    ? [{ ...group.segments[0], edgeIds: group.edgeIds, distance: group.distance, cost: group.segments.reduce((sum, segment) => sum + segment.cost, 0), geometry: group.segments.flatMap((segment, index) => index ? segment.geometry.slice(1) : segment.geometry) }]
    : group.segments);
  const endpointCoordinates = useMemo(() => endpoints.map(point => point.position), [endpoints]);
  return <div className={`geographic-map geo-${variant} ${onRoadSelect ? 'selecting-destination' : ''}`} data-view={view}>
    <MapContainer center={mapConfig.center} zoom={mapConfig.zoom} minZoom={mapConfig.minZoom} maxZoom={mapConfig.maxZoom} zoomControl={false} scrollWheelZoom className="sitrac-leaflet-map" aria-label="Mapa de Cajamarca">
      <TileLayer url={mapConfig.tileUrl} attribution={mapConfig.attribution} maxZoom={mapConfig.maxZoom} eventHandlers={{ tileerror: () => setTileFailed(true), loading: () => setTileFailed(false) }} />
      {onRoadSelect && <MapDestinationSelector roads={selectableRoads} onSelect={onRoadSelect} onReject={onNodeReject} />}
      {(layers.traffic || layers.network) && base.map(road => <RoadLayer key={road.id} road={road} selected={selected === road.id} onSelect={onSelect} academic={!layers.traffic} />)}
      {showCurrent && currentRoute.positions.length > 1 && <Polyline positions={currentRoute.positions} interactive={false} pathOptions={{ color: '#475569', weight: 6, opacity: .7 }} />}
      <Pane name="sitrac-route" style={{ zIndex: 425 }}>
        {showProposed && (routeSegments.length ? routeSegments.map(segment => <RouteSegment key={segment.edgeId} segment={segment} total={proposedRoute.segments.length} color={proposedRoute.color} active={(segment.edgeIds ?? [segment.edgeId]).some(id => activeEdgeIds.includes(id))} onHover={onSegmentHover} />) : proposedRoute.positions.length > 1 && <Polyline positions={proposedRoute.positions} pathOptions={{ color: proposedRoute.color, weight: 5 }} />)}
      </Pane>
      <Pane name="sitrac-access-highlight" style={{ zIndex: 435 }}>{roads.filter(road => road.status !== 'blocked' && activeEdgeIds.includes(road.id) && !proposedRoute?.segments?.some(segment => segment.edgeId === road.id)).map(road => <Polyline key={road.id} positions={road.geometry} interactive={false} pathOptions={{ color: '#2563eb', weight: 10, opacity: .4 }} />)}</Pane>
      <Pane name="sitrac-congested" style={{ zIndex: 460 }}>{congested.map(road => <RoadLayer key={road.id} road={road} selected={activeEdgeIds.includes(road.id)} onHover={onSegmentHover} routeMember={showProposed && proposedRoute.segments?.some(segment => segment.edgeId === road.id)} />)}</Pane>
      <Pane name="sitrac-blocked" style={{ zIndex: 470 }}>{blocked.map(road => <RoadLayer key={road.id} road={road} onSelect={onSelect} />)}</Pane>
      {endpoints.map(point => <EndpointMarker key={point.label} point={point} />)}
      {layers.freight && mockVehicles.map(item => <Marker key={item.id} position={mockVehiclePositions[item.id]} icon={truckIcon} title={`Vehículo ${item.id} · DEMO`}><Popup><VehiclePopup vehicle={item} /></Popup></Marker>)}
      <MapControls routeCoordinates={activeRoute?.positions} endpointCoordinates={endpointCoordinates} focusSegments={focusSegments} focusTick={focusTick} selectedVehicle={vehicle} />
    </MapContainer>
    <div className="map-legend" aria-label="Leyenda del mapa"><span className="origin">● Ingreso</span><span className="destination">● Destino</span><span className="original"><i />Ruta anterior</span><span className="recommended"><i />Ruta SITRAC</span>{congested.length > 0 && <span className="congested"><i />Vía congestionada</span>}<span className="blocked"><i />Vía bloqueada</span></div>
    <div className="geo-demo-label">DEMO ACADÉMICO · Geometría OpenStreetMap · Operación de ejemplo</div>
    {variant === 'results' && <div className="geo-view-label">{view === 'before' ? 'Antes · Ruta anterior' : routingState === 'unreachable' ? 'Después · Sin ruta disponible' : 'Después · Ruta SITRAC'}</div>}
    {tileFailed && <div className="geo-tile-notice" role="status">No se pudo cargar parte del mapa. Comprueba la conexión a Internet.</div>}
  </div>;
}
