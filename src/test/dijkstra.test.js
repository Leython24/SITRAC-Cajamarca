import { describe, it, expect } from 'vitest';
import { dijkstra } from '../optimization/graph/dijkstra';
import { buildGraph } from '../optimization/graph/buildGraph';
import { evaluateEdge } from '../optimization/graph/costFunctions';
import { demoRoadNetwork } from './fixtures/academicNetwork';

const nodes = ['a', 'b', 'c', 'd'].map((id, index) => ({ id, name: id, latitude: -7.16, longitude: -78.5 + index * .001 }));
const edge = (id, from, to, distance, congestion = 'low') => ({ id, name: id, from, to, distance, congestion, status: 'open', directed: false });
const network = { nodes, edges: [edge('ab', 'a', 'b', 3), edge('bd', 'b', 'd', 3), edge('ac', 'a', 'c', 2, 'congested'), edge('cd', 'c', 'd', 2, 'congested'), edge('ad', 'a', 'd', 10)] };

describe('Dijkstra · cálculo independiente de React', () => {
  it('reconstruye nodos, tramos, distancia, costo y coordenadas', () => {
    const result = dijkstra(buildGraph(network), 'a', 'd');
    expect(result).toMatchObject({ status: 'found', nodeIds: ['a', 'b', 'd'], edgeIds: ['ab', 'bd'], distanceTotal: 6, costTotal: 6 });
    expect(result.coordinates).toEqual([nodes[0], nodes[1], nodes[3]].map(node => [node.latitude, node.longitude]));
    expect(result.segments.reduce((sum, tramo) => sum + tramo.cost, 0)).toBe(result.costTotal);
  });
  it('minimiza costo ponderado, aunque otro recorrido sea más corto en distancia', () => {
    const result = dijkstra(network, 'a', 'd');
    expect(result.edgeIds).toEqual(['ab', 'bd']);
    expect(result.distanceTotal).toBeGreaterThan(4);
    expect(result.costTotal).toBeLessThan(8);
  });
  it('excluye vías bloqueadas de la adyacencia y elige una alternativa', () => {
    const conditions = { blockedEdgeIds: ['ab'] };
    expect(buildGraph(network, conditions).adjacency.get('a').map(item => item.edge.id)).not.toContain('ab');
    expect(dijkstra(network, 'a', 'd', conditions)).toMatchObject({ edgeIds: ['ac', 'cd'], costTotal: 8 });
  });
  it('cambia de ruta cuando aumenta suficientemente la congestión de un tramo', () => {
    expect(dijkstra(network, 'a', 'd', { congestionOverrides: { ab: 'congested' } })).toMatchObject({ edgeIds: ['ac', 'cd'], costTotal: 8 });
  });
  it('informa que no hay ruta sin conservar una secuencia ni totales anteriores', () => {
    expect(dijkstra(network, 'a', 'd', { blockedEdgeIds: ['ab', 'ac', 'ad'] })).toEqual({ status: 'unreachable', nodeIds: [], edgeIds: [], segments: [], distanceTotal: null, costTotal: null, coordinates: [] });
  });
  it('es determinista para el mismo grafo y las mismas condiciones, también en empates', () => {
    const tied = { nodes, edges: [edge('ab', 'a', 'b', 1), edge('bd', 'b', 'd', 1), edge('ac', 'a', 'c', 1), edge('cd', 'c', 'd', 1)] };
    const first = dijkstra(tied, 'a', 'd', { trafficIncrease: 10 });
    expect(first.nodeIds).toEqual(['a', 'b', 'd']);
    expect(dijkstra(tied, 'a', 'd', { trafficIncrease: 10 })).toEqual(first);
  });
  it('resuelve origen igual a destino con costo cero y respeta conexiones dirigidas', () => {
    expect(dijkstra(network, 'a', 'a')).toMatchObject({ nodeIds: ['a'], edgeIds: [], distanceTotal: 0, costTotal: 0, coordinates: [[nodes[0].latitude, nodes[0].longitude]] });
    const directed = { nodes, edges: network.edges.map(tramo => ({ ...tramo, directed: true })) };
    expect(dijkstra(directed, 'd', 'a').status).toBe('unreachable');
  });
  it('rechaza pesos negativos o no finitos y extremos desconocidos', () => {
    expect(() => dijkstra({ nodes, edges: [edge('bad', 'a', 'd', -1)] }, 'a', 'd')).toThrow(RangeError);
    expect(() => evaluateEdge(edge('bad', 'a', 'd', NaN))).toThrow(RangeError);
    expect(() => dijkstra(network, 'desconocido', 'd')).toThrow(RangeError);
  });
  it('demuestra cambios por bloqueo, congestión puntual y tráfico en la red de Cajamarca', () => {
    const base = dijkstra(demoRoadNetwork, 'A', 'G');
    expect(base).toMatchObject({ edgeIds: ['atahualpa-sur', 'atahualpa', 'atahualpa-norte', 'comercio', 'chanchamayo', 'dos-mayo'], distanceTotal: 2310, costTotal: 2310 });
    const blocked = dijkstra(demoRoadNetwork, 'A', 'G', { incidents: ['closure'], incidentEdgeId: 'comercio' });
    expect(blocked.edgeIds).not.toContain('comercio');
    expect(blocked.edgeIds).toContain('desvio-oeste-entrada');
    expect(blocked.costTotal).toBe(2540);
    expect(dijkstra(demoRoadNetwork, 'A', 'G', { congestionOverrides: { comercio: 'congested' } }).edgeIds).toEqual(blocked.edgeIds);
    const traffic = dijkstra(demoRoadNetwork, 'A', 'G', { trafficIncrease: 30 });
    expect(traffic).toMatchObject({ edgeIds: ['evitamiento-sur', 'evitamiento', 'corredor-este', 'acceso-este', 'conexion-centro'], distanceTotal: 3100, costTotal: 3720 });
  });
});
