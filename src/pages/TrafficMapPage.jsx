import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockScenario, mockTimeSlots } from '../data/mock/scenario';
import { useRouting } from '../app/routingState';
import { formatRouteNumber } from '../optimization/graph/explainRoute';
import { mockVehicles } from '../data/mock/vehicles';
import SitracMap from '../components/map/SitracMap';
import TrafficLegend from '../components/map/TrafficLegend';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import TechnicalDetails from '../components/ui/TechnicalDetails';
import Notice from '../components/ui/Notice';
import { formatTimeRange } from '../utils/formatTime';

const layerOptions = [
  ['traffic', 'Tráfico DEMO'], ['freight', 'Vehículos de carga'], ['current', 'Ruta actual'], ['proposed', 'Ruta propuesta SITRAC'],
];
export default function TrafficMapPage() {
  const { roads, mapProps, result } = useRouting();
  const [selected, setSelected] = useState(roads[0].id);
  const [time, setTime] = useState(mockScenario.period);
  const [layers, setLayers] = useState({ traffic: true, freight: true, current: true, proposed: true });
  const [notice, setNotice] = useState('');
  const [search] = useSearchParams();
  const vehicle = mockVehicles.find(item => item.id === search.get('vehiculo'));
  const road = roads.find(item => item.id === selected) ?? roads[0];
  return <div className="traffic-page">
    <h1 className="sr-only">Mapa de tráfico</h1>
    <div className="map-toolbar simple-map-toolbar">
      <div className="map-toolbar-heading"><strong>Mapa de Cajamarca</strong><label>Horario analizado<select aria-label="Horario analizado" value={time} onChange={event => setTime(event.target.value)}><option value={mockScenario.period}>{formatTimeRange(mockScenario.period)}</option>{mockTimeSlots.map(slot => <option key={slot} value={slot}>{formatTimeRange(slot)}</option>)}</select></label></div>
      <div className="map-layer-controls">{layerOptions.map(([key, label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={event => setLayers({ ...layers, [key]: event.target.checked })} />{label}</label>)}</div>
      <TrafficLegend />
      {notice && <Notice>{notice}<button className="text-button" onClick={() => setNotice('')}>Cerrar aviso</button></Notice>}
    </div>
    <div className="traffic-workspace">
      <SitracMap variant="traffic" {...mapProps} selected={selected} onSelect={setSelected} layers={layers} vehicle={vehicle?.id} />
      <aside className="road-inspector simple-road-inspector" aria-label="Información de la vía seleccionada">
        <div className="inspector-heading"><span className="eyebrow muted">Vía seleccionada · DEMO</span><h2>{road.name}</h2><StatusBadge tone={road.tone} dot>{road.state}</StatusBadge></div>
        <div className="inspector-body">
          <label className="field-label">Seleccionar vía<select value={selected} onChange={event => setSelected(event.target.value)}>{roads.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <dl className="simple-road-facts"><div><dt>Horario analizado</dt><dd>{formatTimeRange(time)}</dd></div><div><dt>Vehículos de carga</dt><dd>—</dd></div><div><dt>Tiempo estimado</dt><dd>—</dd></div></dl>
          <p className="small muted">Datos de demostración académica. {result?.status === 'found' ? 'Propuesta calculada por Dijkstra.' : result ? 'No existe ruta disponible.' : 'Calcula la propuesta en Simulaciones.'}</p>
          <div className="inspector-actions"><Button icon="manage_search" variant="primary" onClick={() => setNotice(`El análisis de ${road.name} se incorporará cuando existan datos y un modelo. El estado mostrado es DEMO.`)}>Analizar esta zona</Button>
          <Button to="/simulaciones" icon="fork_right">Probar alternativa</Button></div>
          <TechnicalDetails title="Ver detalles técnicos"><dl className="technical-list"><div><dt>Fuente operativa</dt><dd>DEMO ACADÉMICO</dd></div><div><dt>Distancia de la geometría OSM</dt><dd>{formatRouteNumber(road.distance)} m</dd></div><div><dt>Factor de congestión</dt><dd>{road.factor}</dd></div><div><dt>Costo del tramo</dt><dd>{road.cost == null ? 'No disponible' : `${formatRouteNumber(road.cost)} m ponderados`}</dd></div><div><dt>Volumen vehicular</dt><dd>—</dd></div><div><dt>Capacidad</dt><dd>Sin datos</dd></div><div><dt>Relación volumen/capacidad</dt><dd>—</dd></div><div><dt>Demora</dt><dd>—</dd></div><div><dt>Modelo ejecutado</dt><dd>{result ? 'Dijkstra' : 'Sin ejecutar'}</dd></div></dl><p>OpenStreetMap proporciona el mapa base. Las geometrías locales provienen de OpenStreetMap; las condiciones operativas son DEMO sin validación para circulación de carga.</p></TechnicalDetails>
        </div>
      </aside>
    </div>
  </div>;
}
