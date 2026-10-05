import { groupRouteStreets } from '../../optimization/graph/routePresentation';
export default function RouteItinerary({ route, originName, destinationName, activeEdgeIds = [], onHover, onFocusRoute, title = 'RUTA RECOMENDADA' }) {
  if (!route) return null;
  if (route.status !== 'found') return <p role="status">No hay ruta disponible. Libera la vía o selecciona otro destino.</p>;
  const groups = groupRouteStreets(route.segments);
  return <div className="route-readable" aria-label={title === 'RUTA ORIGINAL' ? 'Recorrido original' : 'Recorrido recomendado'}><strong>{title}</strong><p className="itinerary-endpoint origin">● Inicio · {originName}</p>
    {groups.map((group, index) => <button type="button" key={group.id} className={`route-segment-link ${group.edgeIds.some(id => activeEdgeIds.includes(id)) ? 'active' : ''}`} onMouseEnter={() => onHover(group.edgeIds)} onMouseLeave={() => onHover([])} onFocus={() => onHover(group.edgeIds)} onBlur={() => onHover([])} onClick={() => onFocusRoute(group.segments)} aria-label={`Centrar calle ${index + 1}: ${group.streetName}`}>
      <span>{index + 1}. {group.streetName}</span><small>{Math.round(group.distance)} m</small>
    </button>)}<p className="itinerary-endpoint destination">● Destino · {destinationName}</p>
    <details><summary>¿CÓMO FUNCIONA ESTA RUTA?</summary><ol><li>SITRAC recibe origen y destino.</li><li>Las calles disponibles se representan como una red.</li><li>Cada tramo tiene un costo.</li><li>El costo considera distancia y congestión.</li><li>Dijkstra compara costos acumulados.</li><li>Selecciona la secuencia de calles de menor costo disponible.</li><li>Leaflet dibuja la geometría sobre OpenStreetMap.</li></ol></details>
  </div>;
}
