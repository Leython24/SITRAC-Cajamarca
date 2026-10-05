import { describe, it, expect } from 'vitest';
import { act, renderHook, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RoutingProvider } from '../app/RoutingContext';
import { useRouting } from '../app/routingState';
import AppRoutes from '../app/router';
import { demoRoadNetwork } from '../data/mock/roadNetwork';
import { dijkstra } from '../optimization/graph/dijkstra';
import { buildGraph } from '../optimization/graph/buildGraph';
import { getOvalAccesses } from '../optimization/graph/ovalAccesses';
import ConditionComparison from '../components/simulations/ConditionComparison';
import osmReference from './fixtures/ovalOsmWays.json';

function plan() {
  const hook = renderHook(() => useRouting(), { wrapper: RoutingProvider });
  act(() => hook.result.current.optimizeSchedule('C001'));
  act(() => hook.result.current.calculateScheduledRoute());
  return hook;
}

describe('Restricción parcial real del Óvalo Musical', () => {
  it('el acceso sur permite un desvío conectado de mayor distancia y costo, sin reutilizar sus edges', () => {
    const { result } = plan();
    const initial = result.current.schedule.route;
    const access = result.current.ovalAccesses.find(group => group.label.includes('Vía de Evitamiento Sur'));
    expect(access.edgeIds).toHaveLength(2);
    expect(access.segments.every(edge => edge.distance < 250)).toBe(true);
    act(() => result.current.setDemoProblem({ closed: true, closureMode: 'access', accessId: access.id, streetName: access.name, edgeIds: access.edgeIds }));
    const blocked = result.current.demoMapProps().roads.filter(road => road.status === 'blocked');
    expect(blocked.map(road => road.id).sort()).toEqual(access.edgeIds.slice().sort());
    const graph = buildGraph(result.current.network, { blockedEdgeIds: access.edgeIds });
    const available = new Set([...graph.adjacency.values()].flat().map(connection => connection.edge.id));
    expect(access.edgeIds.every(id => !available.has(id))).toBe(true);
    expect(result.current.ovalAccesses.filter(group => group.id !== access.id).flatMap(group => group.edgeIds).every(id => available.has(id))).toBe(true);
    act(() => result.current.recalculateDemo());
    const updated = result.current.schedule.route;
    expect(updated.status).toBe('found');
    expect(updated.edgeIds.some(id => access.edgeIds.includes(id))).toBe(false);
    expect(updated.distanceTotal).toBeGreaterThan(initial.distanceTotal);
    expect(updated.costTotal).toBeGreaterThan(initial.costTotal);
    expect(updated.segments.map(segment => segment.streetName)).toContain('Pasaje Santa Clara');
    expect(updated.segments.map(segment => segment.streetName)).toContain('Cardosanto');
    // The other Atahualpa access, and the oval itself, remain usable.
    expect(updated.segments.map(segment => segment.streetName)).toContain('Óvalo Musical');
    for (let index = 1; index < updated.segments.length; index++) {
      expect(updated.segments[index - 1].to).toBe(updated.segments[index].from);
      expect(updated.segments[index - 1].geometry.at(-1)).toEqual(updated.segments[index].geometry[0]);
    }
  });

  it.each(getOvalAccesses(demoRoadNetwork).map(group => [group.name, group.edgeIds]))('cada restricción parcial conserva los demás accesos: %s', (_, blockedEdgeIds) => {
    const route = dijkstra(demoRoadNetwork, 'A', 'G', { blockedEdgeIds });
    expect(route.status).toBe('found');
    expect(route.edgeIds.some(id => blockedEdgeIds.includes(id))).toBe(false);
  });

  it('solo añade los dos enlaces OSM necesarios, conservando geometría y sentidos de su fuente', () => {
    const added = demoRoadNetwork.edges.filter(edge => edge.extension);
    expect([...new Set(added.map(edge => edge.osmWayId))].sort()).toEqual(['564326189', '891954488']);
    for (const edge of added) {
      const way = osmReference.ways.find(way => way.id === edge.osmWayId);
      const points = edge.geometry.map(([lat, lon]) => [lon, lat]);
      const start = way.coordinates.findIndex(point => point[0] === points[0][0] && point[1] === points[0][1]);
      expect(start).toBeGreaterThanOrEqual(0);
      expect(points).toEqual(way.coordinates.slice(start, start + points.length));
      expect(edge.streetName).toBe(way.name);
      expect(edge.directed).toBe(way.direction === 'forward');
    }
    const junction = demoRoadNetwork.nodes.find(node => node.osmNodeId === '5437436527');
    expect(demoRoadNetwork.edges.filter(edge => edge.from === junction.id || edge.to === junction.id).map(edge => edge.streetName).sort())
      .toEqual(['Avenida Vía de Evitamiento Sur', 'Avenida Vía de Evitamiento Sur', 'Pasaje Santa Clara']);
    const baseline = dijkstra(demoRoadNetwork, 'A', 'G');
    expect(baseline.distanceTotal).toBeCloseTo(4628.411387912561);
    expect(baseline.segments.some(edge => edge.extension)).toBe(false);
  });

  it('si no queda un camino conectado informa unreachable, sin dibujar una ruta artificial', () => {
    const { result } = plan();
    const ids = result.current.network.edges.filter(edge => edge.from === 'A' || edge.to === 'A').map(edge => edge.id);
    act(() => result.current.setDemoProblem({ closed: true, closureMode: 'access', accessId: 'test-isolated', streetName: 'Ingreso aislado · prueba', edgeIds: ids }));
    act(() => result.current.recalculateDemo());
    expect(result.current.schedule.route.status).toBe('unreachable');
    expect(result.current.demoMapProps().proposedRoute).toBeNull();
    render(<ConditionComparison result={result.current.demo.updated} />);
    expect(screen.getByText('No existe una ruta conectada en la red modelada evitando esta restricción.')).toBeVisible();
  });

  it('la UI ofrece accesos parciales, pinta rojo y explica el nuevo recorrido azul', async () => {
    render(<MemoryRouter initialEntries={['/planificar-viaje']}><AppRoutes /></MemoryRouter>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' }));
    await user.click(screen.getByRole('button', { name: 'CALCULAR RUTA' }));
    await user.click(screen.getByRole('button', { name: 'Restricción en Óvalo Musical' }));
    expect(screen.getByText('SIMULAR RESTRICCIÓN EN ÓVALO MUSICAL')).toBeVisible();
    expect(screen.queryByRole('radio', { name: /Cierre total|Cerrar todo/ })).not.toBeInTheDocument();
    await user.click(screen.getByText('Otras vías de la ruta'));
    expect(screen.queryByRole('radio', { name: 'Óvalo Musical' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Restringir conexión con Avenida Vía de Evitamiento Sur/ }));
    expect(document.querySelectorAll('.leaflet-sitrac-blocked-pane path[stroke="#dc2626"]')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'RECALCULAR RUTA' }));
    expect(screen.getByText('Dijkstra encontró una ruta alternativa evitando el acceso restringido.')).toBeVisible();
    expect(screen.getByRole('button', { name: /Tramo \d+: Pasaje Santa Clara/ })).toHaveAttribute('stroke', '#2563eb');
    expect(screen.getByRole('button', { name: /Tramo \d+: Cardosanto$/ })).toHaveAttribute('stroke', '#2563eb');
    await user.click(screen.getByRole('button', { name: 'RESTABLECER CONDICIÓN' }));
    expect(document.querySelector('.leaflet-sitrac-blocked-pane path')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tramo \d+: Pasaje Santa Clara/ })).not.toBeInTheDocument();
  });
});
