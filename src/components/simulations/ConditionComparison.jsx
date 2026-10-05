import { groupRouteStreets } from '../../optimization/graph/routePresentation';

const streets = route => groupRouteStreets(route?.segments).map(group => group.streetName).join(' → ') || 'Sin recorrido disponible';
const cost = route => route?.costTotal?.toFixed(1) ?? '— Sin ruta disponible';
const distance = route => route?.status === 'found' ? `${(route.distanceTotal / 1000).toFixed(2)} km` : 'Sin ruta disponible';

export default function ConditionComparison({ result, children }) {
  if (!result?.simulatedCondition) return null;
  const congestion = result.simulatedCondition.type === 'congestion';
  const partialClosure = result.simulatedCondition.type === 'closure' && result.simulatedCondition.closureMode === 'partial';
  const accessClosure = result.simulatedCondition.closureMode === 'access';
  const previous = result.previousRoute;
  return <div className="planner-change"><h3>¿QUÉ CAMBIÓ?</h3>
    <p>Condición simulada: {congestion ? 'Congestión' : 'Cierre'}</p>
    <p>Vía afectada: {result.simulatedCondition.streetName}</p>
    <p>Ruta anterior: {streets(previous)}</p><p>Nueva ruta: {streets(result)}</p>
    <p>Costo anterior: {cost(previous)}</p><p>Costo nuevo: {cost(result)}</p>
    <small>El costo del modelo no representa dinero.</small>
    <p>Distancia anterior: {distance(previous)}</p><p>Nueva distancia: {distance(result)}</p>
    {partialClosure && <><p>Solo este segmento fue retirado de la red. Los demás tramos de la misma vía continúan disponibles.</p><p>Tramo afectado: {result.simulatedCondition.streetName}</p><p>Distancia del tramo: {Math.round(result.simulatedCondition.distance)} m</p></>}
    {accessClosure && <p>Este acceso/intersección del Óvalo Musical no puede utilizarse. Se bloquearon solo sus conexiones; los demás accesos continúan disponibles.</p>}
    <p>{congestion ? 'La vía siguió disponible, pero aumentó su costo y Dijkstra volvió a comparar las alternativas.' : accessClosure ? result.status === 'found' ? 'Dijkstra encontró una ruta alternativa evitando el acceso restringido.' : 'No existe una ruta conectada en la red modelada evitando esta restricción.' : partialClosure ? 'Dijkstra evitó el tramo cerrado y buscó otra alternativa disponible.' : 'La vía dejó de estar disponible y Dijkstra buscó otra alternativa.'}</p>
    {congestion && result.sameRoute && <p>La ruta se mantiene porque continúa siendo la alternativa disponible de menor costo.</p>}
    {accessClosure && result.sameRoute && <p>La ruta se mantiene porque no utiliza el acceso restringido.</p>}
    {result.status === 'unreachable' && !accessClosure && <p>{partialClosure ? 'No existe una ruta disponible evitando el tramo cerrado.' : 'No existe una ruta disponible evitando la vía cerrada.'}</p>}
    {children}
  </div>;
}
