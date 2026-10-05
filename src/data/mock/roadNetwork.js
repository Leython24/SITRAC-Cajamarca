import { localRoadNetwork } from './localRoadNetwork';
export const demoRoadNetwork = localRoadNetwork;
export const demoRouteEndpoints = { origin: 'A', destination: 'G', incidentEdgeId: localRoadNetwork.edges.find(edge => edge.streetName.includes('Comercio'))?.id ?? localRoadNetwork.edges[0].id };
