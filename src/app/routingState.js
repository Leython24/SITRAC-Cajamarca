import { createContext, useContext } from 'react';
import { demoRouteEndpoints } from '../data/mock/roadNetwork';

// Separate from the React component so Fast Refresh retains the context identity.
export const RoutingContext = createContext(null);
export const copyScenario = config => ({
  ...config, incidents: [...config.incidents],
  incidentEdgeId: config.incidentEdgeId ?? demoRouteEndpoints.incidentEdgeId,
  blockedEdgeIds: [...(config.blockedEdgeIds ?? [])],
  congestionOverrides: { ...(config.congestionOverrides ?? {}) },
});
export function useRouting() {
  const value = useContext(RoutingContext);
  if (!value) throw new Error('El módulo de rutas requiere RoutingProvider.');
  return value;
}
