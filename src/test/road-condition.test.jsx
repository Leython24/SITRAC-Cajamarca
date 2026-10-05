import { describe, it, expect } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../app/router';
import { RoutingProvider } from '../app/RoutingContext';
import { useRouting } from '../app/routingState';
import { buildGraph } from '../optimization/graph/buildGraph';
import { dijkstra } from '../optimization/graph/dijkstra';

const entryStreet = 'Avenida Vía de Evitamiento Sur';
const alternativeStreet = 'Jirón Amalia Puga';
function plan() {
  const hook = renderHook(() => useRouting(), { wrapper: RoutingProvider });
  act(() => hook.result.current.optimizeSchedule('C001'));
  act(() => hook.result.current.calculateScheduledRoute());
  return hook;
}

describe('Una condición vial DEMO con los costos existentes', () => {
  it.each([['moderate', 1.2], ['high', 1.5], ['congested', 2]])('aumenta factor y costo a %s sin retirar conexiones', (level, factor) => {
    const { result } = plan();
    const initial = result.current.schedule.route;
    act(() => result.current.simulateCongestion(entryStreet, level));
    const affected = result.current.demoMapProps().roads.filter(road => road.simulatedCongestion);
    expect(affected.length).toBeGreaterThan(0);
    for (const road of affected) {
      expect(road.status).toBe('open');
      expect(road.factor).toBe(factor);
      expect(road.cost).toBeCloseTo(road.distance * factor);
      expect(road.color).toBe('#ea580c');
    }
    expect(result.current.demo.updated).toBeNull();
    expect(result.current.schedule.route).toBe(initial);
    const graph = buildGraph(result.current.network, { ...initial.conditions, congestionOverrides: Object.fromEntries(affected.map(road => [road.id, level])) });
    const available = [...graph.adjacency.values()].flat();
    expect(affected.every(road => available.some(connection => connection.edge.id === road.id))).toBe(true);
    act(() => result.current.recalculateDemo());
    const updated = result.current.schedule.route;
    expect(updated.segments.filter(segment => segment.streetName === entryStreet).every(segment => segment.congestionFactor === factor && segment.cost === segment.distance * factor)).toBe(true);
    expect(updated.costTotal).toBeGreaterThan(initial.costTotal);
    expect(updated.costTotal).toBeCloseTo(updated.segments.reduce((sum, segment) => sum + segment.cost, 0));
  });

  it('mantiene la ruta cuando sigue siendo mejor y cambia cuando otra cuesta menos', () => {
    const { result } = plan();
    const initial = result.current.schedule.route;
    act(() => result.current.simulateCongestion(entryStreet, 'moderate'));
    act(() => result.current.recalculateDemo());
    expect(result.current.schedule.route.edgeIds).toEqual(initial.edgeIds);
    expect(result.current.demo.updated.sameRoute).toBe(true);
    act(() => result.current.resetCondition());
    act(() => result.current.simulateCongestion(alternativeStreet, 'congested'));
    act(() => result.current.recalculateDemo());
    const updated = result.current.schedule.route;
    const oldRouteWithNewCosts = initial.segments.reduce((sum, segment) => sum + segment.distance * (segment.streetName === alternativeStreet ? 2 : segment.congestionFactor), 0);
    expect(updated.edgeIds).not.toEqual(initial.edgeIds);
    expect(updated.costTotal).toBeLessThan(oldRouteWithNewCosts);
    expect(updated.sameRoute).toBe(false);
    expect(result.current.demoMapProps().roads.filter(road => road.simulatedCongestion).every(road => road.status === 'open')).toBe(true);
  });

  it('permite una sola condición y restablece factores preservando el viaje', () => {
    const { result } = plan();
    const original = result.current.schedule.route;
    const schedule = result.current.schedule.result;
    const destination = result.current.destination;
    const vehicle = result.current.selectedVehicleId;
    const baseRoads = result.current.demoMapProps().roads;
    act(() => result.current.simulateCongestion(alternativeStreet, 'high'));
    const ids = result.current.demo.condition.edgeIds;
    act(() => result.current.setDemoProblem({ closed: true, edgeIds: ids }));
    expect(result.current.demoMapProps().roads.some(road => road.simulatedCongestion)).toBe(false);
    act(() => result.current.recalculateDemo());
    expect(result.current.schedule.route.edgeIds.some(id => ids.includes(id))).toBe(false);
    act(() => result.current.resetCondition());
    expect(result.current.demo.condition).toBeNull();
    expect(result.current.demo.updated).toBeNull();
    expect(result.current.schedule.route).toBe(original);
    expect(result.current.schedule.result).toBe(schedule);
    expect(result.current.destination).toBe(destination);
    expect(result.current.selectedVehicleId).toBe(vehicle);
    expect(result.current.demoMapProps().roads).toEqual(baseRoads);
    act(() => result.current.simulateCongestion(entryStreet, 'high'));
    act(() => result.current.recalculateDemo());
    act(() => result.current.resetCondition());
    expect(result.current.demoMapProps().roads).toEqual(baseRoads);
    expect(result.current.schedule.route).toBe(original);
  });

  it('cierra todos los edges de Óvalo Musical y Dijkstra elige una alternativa disponible', () => {
    const { result } = plan();
    const initial = result.current.schedule.route;
    expect(initial.segments.some(segment => segment.streetName === 'Óvalo Musical')).toBe(true);
    const blockedEdgeIds = result.current.network.edges
      .filter(edge => edge.streetName === 'Óvalo Musical')
      .map(edge => edge.id);
    expect(blockedEdgeIds.length).toBeGreaterThan(0);

    act(() => result.current.setDemoProblem({ closed: true, edgeIds: blockedEdgeIds }));

    expect(result.current.demo.condition.edgeIds).toEqual(blockedEdgeIds);
    expect(result.current.demoMapProps().roads
      .filter(road => blockedEdgeIds.includes(road.id))
      .every(road => road.status === 'blocked' && road.color === '#dc2626')).toBe(true);

    act(() => result.current.recalculateDemo());

    const updated = result.current.schedule.route;
    const available = [...buildGraph(result.current.network, updated.conditions).adjacency.values()].flat();
    expect(blockedEdgeIds.every(edgeId => !available.some(connection => connection.edge.id === edgeId))).toBe(true);
    expect(['found', 'unreachable']).toContain(updated.status);
    expect(updated.edgeIds.some(edgeId => blockedEdgeIds.includes(edgeId))).toBe(false);
    if (updated.status === 'found') {
      expect(updated.segments.some(segment => segment.streetName === 'Óvalo Musical')).toBe(false);
      expect(updated.edgeIds).not.toEqual(initial.edgeIds);
    } else {
      expect(updated.edgeIds).toEqual([]);
      expect(updated.coordinates).toEqual([]);
      expect(result.current.demoMapProps().proposedRoute).toBeNull();
    }
  });

  it('devuelve unreachable cuando el cierre elimina todas las conexiones del origen', () => {
    const { result } = plan();
    const blockedEdgeIds = result.current.network.edges
      .filter(edge => edge.from === result.current.origin || edge.to === result.current.origin)
      .map(edge => edge.id);

    act(() => result.current.setDemoProblem({ closed: true, edgeIds: blockedEdgeIds }));
    act(() => result.current.recalculateDemo());

    expect(result.current.schedule.route.status).toBe('unreachable');
    expect(result.current.schedule.route.edgeIds).toEqual([]);
    expect(result.current.schedule.route.coordinates).toEqual([]);
    expect(result.current.demo.updated.appliedEdges).toEqual(blockedEdgeIds);
    expect(result.current.demoMapProps().proposedRoute).toBeNull();
  });

  it('el cierre parcial bloquea solo el edge seleccionado y conserva los demás de la misma vía', () => {
    const { result } = plan();
    const candidates = result.current.schedule.route.segments
      .filter(segment => segment.streetName === 'Óvalo Musical');
    expect(candidates.length).toBeGreaterThan(1);
    const selected = candidates.find(segment => dijkstra(result.current.network, result.current.origin, result.current.destination, {
      ...result.current.schedule.route.conditions,
      blockedEdgeIds: [segment.edgeId],
    }).status === 'found');
    expect(selected).toBeDefined();
    const sameStreetIds = result.current.network.edges
      .filter(edge => edge.streetName === selected.streetName)
      .map(edge => edge.id);

    act(() => result.current.setDemoProblem({
      closed: true,
      closureMode: 'partial',
      edgeId: selected.edgeId,
      edgeIds: [selected.edgeId],
      distance: selected.distance,
    }));

    expect(result.current.demo.condition.closureMode).toBe('partial');
    expect(result.current.demo.condition.edgeIds).toEqual([selected.edgeId]);
    const graph = buildGraph(result.current.network, {
      blockedEdgeIds: result.current.demo.condition.edgeIds,
    });
    const available = [...graph.adjacency.values()].flat().map(connection => connection.edge.id);
    expect(available).not.toContain(selected.edgeId);
    expect(sameStreetIds.filter(edgeId => edgeId !== selected.edgeId)
      .every(edgeId => available.includes(edgeId))).toBe(true);

    act(() => result.current.recalculateDemo());

    const updated = result.current.schedule.route;
    expect(updated.edgeIds).not.toContain(selected.edgeId);
    expect(updated.status).toBe('found');
    expect(updated.conditions.blockedEdgeIds).toContain(selected.edgeId);
  });

  it('el cierre parcial conserva el estado unreachable si retira el único acceso', () => {
    const { result } = plan();
    const originEdges = result.current.network.edges
      .filter(edge => edge.from === result.current.origin || edge.to === result.current.origin);
    const selected = originEdges[0];

    act(() => result.current.setDemoProblem({
      closed: true,
      closureMode: 'partial',
      edgeId: selected.id,
      edgeIds: [selected.id],
      distance: selected.distance,
    }));
    act(() => result.current.recalculateDemo());

    expect(result.current.schedule.route.edgeIds).not.toContain(selected.id);
    if (result.current.schedule.route.status === 'unreachable') {
      expect(result.current.demo.updated.coordinates).toEqual([]);
    }
  });

  it('solo ofrece calles actuales, pinta naranja y sincroniza hover, costo y restablecimiento', async () => {
    render(<MemoryRouter initialEntries={['/planificar-viaje']}><AppRoutes /></MemoryRouter>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' }));
    await user.click(screen.getByRole('button', { name: 'CALCULAR RUTA' }));
    const displayedStreets = screen.getAllByRole('button', { name: /^Centrar calle/ }).map(button => button.getAttribute('aria-label').replace(/^Centrar calle \d+: /, ''));
    await user.click(screen.getByRole('button', { name: 'Aumentar congestión' }));
    expect(screen.getAllByRole('radio').filter(radio => radio.name === 'road-condition').every(radio => displayedStreets.includes(radio.parentElement.textContent.trim()))).toBe(true);
    await user.click(screen.getByRole('radio', { name: entryStreet }));
    expect(screen.getByText('Nuevo factor: 1.2')).toBeVisible();
    expect(document.querySelector('.leaflet-sitrac-congested-pane path[stroke="#ea580c"]')).toBeInTheDocument();
    expect(document.querySelector('.leaflet-sitrac-blocked-pane path')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'RECALCULAR RUTA' }));
    expect(screen.getByText('La ruta se mantiene porque continúa siendo la alternativa disponible de menor costo.')).toBeVisible();
    const segment = screen.getByRole('button', { name: /^Tramo 2:/ });
    const street = segment.getAttribute('aria-label').replace('Tramo 2: ', '');
    fireEvent.mouseOver(segment);
    const tooltip = document.querySelector('.route-tooltip');
    expect(tooltip).toHaveTextContent(street);
    expect(tooltip).toHaveTextContent('Costo del tramo:');
    expect(tooltip).toHaveTextContent('Este tramo forma parte de la ruta calculada por Dijkstra.');
    expect(tooltip).toHaveTextContent('El costo no representa dinero.');
    expect(screen.getByRole('button', { name: new RegExp(`Centrar calle \\d+: ${street}`) })).toHaveClass('active');
    fireEvent.mouseOut(segment);
    const routeEntry = screen.getByRole('button', { name: /^Tramo 1:/ });
    const orange = document.querySelector(`.leaflet-sitrac-congested-pane path[data-edge-id="${routeEntry.getAttribute('data-edge-id')}"]`);
    fireEvent.mouseOver(orange);
    expect(screen.getByRole('button', { name: `Centrar calle 1: ${entryStreet}` })).toHaveClass('active');
    fireEvent.mouseOut(orange);
    fireEvent.mouseEnter(screen.getByRole('button', { name: `Centrar calle 1: ${entryStreet}` }));
    expect(orange).toHaveAttribute('stroke-width', '9');
    await user.click(screen.getByRole('button', { name: 'RESTABLECER CONDICIÓN' }));
    expect(document.querySelector('.leaflet-sitrac-congested-pane path')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Vehículo para planificar')).toHaveValue('C001');
    expect(screen.getByLabelText('Destino del viaje')).toHaveValue('G');
    expect(screen.getByText('8:00 a. m.', { selector: '.schedule-result b' })).toBeVisible();
  });
});
