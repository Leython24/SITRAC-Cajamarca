import { describe, it, expect } from 'vitest';
import { demoRoadNetwork } from '../data/mock/roadNetwork';
import { buildGraph, geometryDistance } from '../optimization/graph/buildGraph';
import { dijkstra } from '../optimization/graph/dijkstra';
import { findNearestRoadSegment, splitRoadAtPoint, conditionsForNetwork } from '../optimization/graph/roadSelection';
import { presentRoute, groupRouteStreets } from '../optimization/graph/routePresentation';
import { routeConditionsForSlot } from '../optimization/scheduling/routeConditions';

const a = [-7.16, -78.51], b = [-7.16, -78.50];
const fixture = {
  nodes: [{ id: 'start', latitude: a[0], longitude: a[1] }, { id: 'end', latitude: b[0], longitude: b[1] }],
  edges: [{ id: 'road', from: 'start', to: 'end', streetName: 'Calle de prueba', geometry: [a, b], distance: geometryDistance([a, b]), congestion: 'moderate', response: 'primary', status: 'open', directed: true }],
};

describe('Destino sobre la vía y geometrías reales', () => {
  it('proyecta sobre el interior de un segmento en lugar de escoger un extremo', () => {
    const snap = findNearestRoadSegment([-7.1599, -78.506], fixture.edges);
    expect(snap.projected[0]).toBeCloseTo(a[0], 10);
    expect(snap.projected[1]).toBeCloseTo(-78.506, 10);
    expect(snap.distance).toBeGreaterThan(10);
    expect(snap.distance).toBeLessThan(12);
    expect(findNearestRoadSegment([-7.15, -78.506], fixture.edges)).toBeNull();
  });

  it('divide la geometría sin mutar la base y conserva distancia, sentido y atributos', () => {
    const snapshot = structuredClone(fixture);
    const snap = findNearestRoadSegment([-7.1599, -78.506], fixture.edges);
    const { network, destinationId } = splitRoadAtPoint(fixture, snap);
    const node = network.nodes.find(item => item.id === destinationId);
    expect(node.temporary).toBe(true);
    expect([node.latitude, node.longitude]).toEqual(snap.projected);
    expect(network.edges[0].geometry.at(-1)).toEqual(snap.projected);
    expect(network.edges[1].geometry[0]).toEqual(snap.projected);
    expect(network.edges.reduce((sum, edge) => sum + edge.distance, 0)).toBeCloseTo(fixture.edges[0].distance, 8);
    for (const edge of network.edges) {
      expect(edge.directed).toBe(true);
      expect(edge.congestion).toBe('moderate');
      expect(edge.streetName).toBe('Calle de prueba');
    }
    expect(fixture).toEqual(snapshot);
  });

  it('Dijkstra termina exactamente en el nuevo punto y respeta el sentido único', () => {
    const snap = findNearestRoadSegment([-7.1599, -78.506], fixture.edges);
    const { network, destinationId } = splitRoadAtPoint(fixture, snap);
    const route = presentRoute(dijkstra(network, 'start', destinationId));
    expect(route.status).toBe('found');
    expect(route.nodeIds.at(-1)).toBe(destinationId);
    expect(route.coordinates.at(-1)).toEqual(snap.projected);
    expect(route.distanceTotal).toBeCloseTo(geometryDistance([a, snap.projected]), 4);
    expect(dijkstra(network, 'end', destinationId).status).toBe('unreachable');
  });

  it('un bloqueo o congestión del tramo original se hereda en las dos partes', () => {
    const { network, destinationId } = splitRoadAtPoint(fixture, findNearestRoadSegment(a.map((value, index) => (value + b[index]) / 2), fixture.edges));
    const conditions = conditionsForNetwork(network, { blockedEdgeIds: ['road'], congestionOverrides: { road: 'high' } });
    expect(conditions.blockedEdgeIds).toHaveLength(2);
    expect(Object.values(conditions.congestionOverrides)).toEqual(['high', 'high']);
    expect(dijkstra(network, 'start', destinationId, conditions).status).toBe('unreachable');
  });

  it('todas las geometrías OSM empiezan y terminan en sus nodos exactos', () => {
    const graph = buildGraph(demoRoadNetwork);
    for (const edge of graph.edges) {
      const start = graph.nodeById.get(edge.from), end = graph.nodeById.get(edge.to);
      expect(edge.osmWayId).toBeDefined();
      expect(edge.geometry[0]).toEqual([start.latitude, start.longitude]);
      expect(edge.geometry.at(-1)).toEqual([end.latitude, end.longitude]);
      expect(edge.distance).toBeCloseTo(geometryDistance(edge.geometry), 8);
    }
  });

  it.each(['A', 'H', 'N'])('conecta el ingreso %s con los destinos de la demostración', origin => {
    for (const destination of ['G', 'K']) expect(dijkstra(demoRoadNetwork, origin, destination).status).toBe('found');
  });

  it('los puntos del recorrido son exclusivamente geometrías orientadas de los edges elegidos', () => {
    const route = presentRoute(dijkstra(demoRoadNetwork, 'A', 'G'));
    expect(route.coordinates).toEqual(route.segments.flatMap((edge, index) => index ? edge.geometry.slice(1) : edge.geometry));
    const nodes = new Map(demoRoadNetwork.nodes.map(node => [node.id, node]));
    for (const [index, segment] of route.segments.entries()) {
      expect(segment.edgeId).toBe(route.edgeIds[index]);
      expect(segment.order).toBe(index + 1);
      const start = nodes.get(segment.from), end = nodes.get(segment.to);
      expect(segment.geometry[0]).toEqual([start.latitude, start.longitude]);
      expect(segment.geometry.at(-1)).toEqual([end.latitude, end.longitude]);
    }
  });

  it('la agrupación conserva el orden, cada edge y toda la distancia', () => {
    const route = presentRoute(dijkstra(demoRoadNetwork, 'A', 'G'));
    const groups = groupRouteStreets(route.segments);
    expect(groups.flatMap(group => group.edgeIds)).toEqual(route.edgeIds);
    expect(groups.flatMap(group => group.segments)).toEqual(route.segments);
    expect(groups.reduce((sum, group) => sum + group.distance, 0)).toBeCloseTo(route.distanceTotal, 8);
    expect(groups.every((group, index) => index === 0 || group.streetName !== groups[index - 1].streetName)).toBe(true);
  });

  it('el horario cambia los costos reales evaluados por Dijkstra', () => {
    const peak = buildGraph(demoRoadNetwork, routeConditionsForSlot('07:30'));
    const normal = buildGraph(demoRoadNetwork, routeConditionsForSlot('08:30'));
    const index = normal.edges.findIndex(edge => edge.response === 'primary');
    expect(peak.edges[index].cost).toBeGreaterThan(normal.edges[index].cost);
    expect(peak.edges[index].factor).toBe(1.5);
    expect(normal.edges[index].factor).toBe(1);
    expect(dijkstra(demoRoadNetwork, 'A', 'G', routeConditionsForSlot('07:30')).costTotal)
      .toBeGreaterThan(dijkstra(demoRoadNetwork, 'A', 'G', routeConditionsForSlot('08:30')).costTotal);
  });
});
