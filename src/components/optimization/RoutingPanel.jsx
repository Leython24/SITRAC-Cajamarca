import { useRouting } from '../../app/routingState';
import { congestionConfig } from '../../optimization/graph/costConfig';
import Button from '../ui/Button';
import SitracMap from '../map/SitracMap';
import RouteSummary from './RouteSummary';
import DijkstraDetails from './DijkstraDetails';

export default function RoutingPanel({ variant = 'optimization' }) {
  const { config, setConfig, nodes, edges, origin, setOrigin, destination, setDestination,
    result, calculate, normalConditions, setCongestion, setBlocked, mapProps } = useRouting();
  const selectedEdge = edges.find(edge => edge.id === config.incidentEdgeId);
  return <div className="routing-content">
    <div className="section-header"><h2>Ruta más conveniente</h2><span className="subtle-label">{result ? 'Dijkstra ejecutado' : 'Dijkstra'}</span></div>
    <p className="small"><strong>Técnica utilizada:</strong> Algoritmo de Dijkstra. Busca la ruta de menor costo entre el origen y el destino. Tiene en cuenta distancia, congestión y vías bloqueadas.</p>
    <div className="route-endpoint-controls">
      <label className="field-label">Origen<select aria-label="Origen de la ruta" value={origin} onChange={event => setOrigin(event.target.value)}>{nodes.map(node => <option key={node.id} value={node.id}>{node.displayName}</option>)}</select></label>
      <label className="field-label">Destino<select aria-label="Destino de la ruta" value={destination} onChange={event => setDestination(event.target.value)}>{nodes.map(node => <option key={node.id} value={node.id}>{node.displayName}</option>)}</select></label>
    </div>
    <div className="route-condition-controls">
      <label className="field-label">Tramo para incidente o ajuste<select aria-label="Tramo para incidente o ajuste" value={config.incidentEdgeId} onChange={event => setConfig(current => ({ ...current, incidentEdgeId: event.target.value }))}>{edges.map(edge => <option key={edge.id} value={edge.id}>{edge.name}</option>)}</select></label>
      <label className="field-label">Congestión del tramo<select aria-label="Congestión del tramo" value={config.congestionOverrides[selectedEdge.id] ?? ''} onChange={event => setCongestion(selectedEdge.id, event.target.value)}><option value="">Según escenario</option>{congestionConfig.levels.map(level => <option key={level} value={level}>{congestionConfig.labels[level]}</option>)}</select></label>
      <label className="route-block-toggle"><input type="checkbox" checked={selectedEdge.status === 'blocked'} onChange={event => setBlocked(selectedEdge.id, event.target.checked)} />Bloquear este tramo</label>
    </div>
    <div className="route-actions"><Button variant="primary" icon="alt_route" onClick={calculate}>CALCULAR RUTA</Button><Button onClick={normalConditions}>Condiciones normales</Button></div>
    <p className="small muted">Tráfico general: +{config.traffic}%. Después del primer cálculo, los cambios de origen, destino o condiciones recalculan la ruta automáticamente. Cantidad de camiones y horarios se conservan como configuración; no intervienen en este cálculo.</p>
    <SitracMap variant={variant} {...mapProps} layers={{ traffic: true, freight: true, current: true, proposed: true }} />
    <RouteSummary />
    <DijkstraDetails />
    <Button to="/resultados" endIcon="arrow_forward">Ver Antes / Después en Resultados</Button>
  </div>;
}
