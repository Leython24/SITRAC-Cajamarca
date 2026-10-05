import { demoRoadNetwork } from './roadNetwork';
import { mockVehicles } from './vehicles';
// Operational marker positions are DEMO. Keep them on the selected OSM entry roads.
export const mockRoadGeometry = Object.fromEntries(demoRoadNetwork.edges.map(edge => [edge.id, edge.geometry]));
export const mockRoutes = { current: null };
export const mockVehiclePositions = Object.fromEntries(mockVehicles.map(vehicle => {
  const point = demoRoadNetwork.nodes.find(node => node.id === vehicle.entryPointId);
  return [vehicle.id, [point.latitude, point.longitude]];
}));
export const mockMapPoints = [];
