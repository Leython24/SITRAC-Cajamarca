import localData from '../references/cajamarca-network.geojson?raw';
import { geometryDistance } from '../../optimization/graph/buildGraph';

const geojson = JSON.parse(localData);
export const localRoadNetwork = {
  source: geojson.source,
  nodes: geojson.nodes,
  edges: geojson.features.map(feature => {
    const geometry = feature.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]);
    const data = feature.properties;
    return { ...data, geometry, distance: geometryDistance(geometry), name: data.streetName, displayName: data.streetName,
      congestion: 'low', status: 'open', directed: data.direction === 'forward', source: 'Geometría OSM · condiciones DEMO' };
  }),
};
