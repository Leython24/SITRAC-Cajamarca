import { routeAppearance } from '../../data/mapConfig';
export default function RouteLegend({ current = true, proposed = true }) {
  return <div className="route-legend" aria-label="Leyenda de rutas DEMO">
    {current && <span><i style={{ borderColor: routeAppearance.current.color }} />Ruta actual DEMO</span>}
    {proposed && <span><i className="route-dashed" style={{ borderColor: routeAppearance.proposed.color }} />Ruta propuesta SITRAC · Dijkstra</span>}
  </div>;
}
