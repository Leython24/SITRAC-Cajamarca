import { describe, it, expect } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../app/router';
import { RoutingProvider } from '../app/RoutingContext';
import { useRouting } from '../app/routingState';
import { mockVehicles } from '../data/mock/vehicles';
import { demoRoadNetwork } from '../data/mock/roadNetwork';
import { buildPlanningSchedule, rankFeasibleScheduleOptions } from '../optimization/scheduling/planningOptions';
import { getOvalAccesses } from '../optimization/graph/ovalAccesses';
import { buildGraph } from '../optimization/graph/buildGraph';
import { formatTime } from '../utils/formatTime';

function plan() {
  const hook = renderHook(() => useRouting(), { wrapper: RoutingProvider });
  act(() => hook.result.current.optimizeSchedule('C001'));
  act(() => hook.result.current.calculateScheduledRoute());
  return hook;
}

describe('Vehículos, opciones factibles y accesos reales del Óvalo Musical', () => {
  it('separa tipo de configuración sin inventar carrocerías ni ejes desconocidos', () => {
    expect(mockVehicles.map(vehicle => [vehicle.configuration, vehicle.axles])).toEqual([['C2', 2], ['C3', 3], [null, null], ['T3S2', 5], ['C2', 2]]);
    expect(mockVehicles[4].type).toBe('Camión rígido de carga');
    expect(mockVehicles[2].type).toBe('Furgón de distribución');
  });

  it('ordena costos calculados y descarta llegada, ventana y restricciones incompatibles', () => {
    const vehicle = { ...mockVehicles[0], arrival: '06:00', window: '07:00 – 09:00' };
    const model = buildPlanningSchedule([vehicle], { slots: ['06:30', '07:00', '08:00', '08:30', '09:00', '09:30'], restrictedSlots: ['08:30'] });
    const choices = rankFeasibleScheduleOptions(model, vehicle.id);
    expect(choices.map(option => option.slot)).toEqual(['08:00', '09:00']);
    expect(choices.map(option => option.cost.total)).toEqual([1.3, 1.45]);
    expect(model.candidates.get(vehicle.id).map(option => option.slot)).toEqual(['07:00', '08:00', '09:00']);
  });

  it('valida capacidad y los demás vehículos usando el solver existente', () => {
    const first = { ...mockVehicles[0], arrival: '08:00', window: '08:00 – 09:00' };
    const second = { ...first, id: 'CAPACITY', window: '08:00 – 08:00' };
    const model = buildPlanningSchedule([first, second], { capacity: 1 });
    expect(rankFeasibleScheduleOptions(model, first.id).map(option => option.slot)).toEqual(['08:30', '09:00']);
    expect(rankFeasibleScheduleOptions(buildPlanningSchedule([first], { slots: [], capacity: 1 }), first.id)).toEqual([]);
  });

  it('solo añade madrugada a ventanas compatibles y mantiene la cronología y las restricciones', () => {
    for (const vehicle of mockVehicles) {
      expect(buildPlanningSchedule([vehicle]).candidates.get(vehicle.id).every(option => Number(option.slot.split(':')[0]) < 22)).toBe(true);
    }
    const night = { ...mockVehicles[0], arrival: '21:45', window: '22:00 – 05:00' };
    const model = buildPlanningSchedule([night], { slots: ['21:30', '22:30', '28:00', '29:30'] });
    const choices = rankFeasibleScheduleOptions(model, night.id);
    expect(choices.map(option => option.slot)).toEqual(['22:30', '28:00']);
    expect(choices.map(option => formatTime(option.slot))).toEqual(['10:30 p. m.', '4:00 a. m.']);
    expect(choices[1].cost.waitingCost).toBeCloseTo(6.25 * .15);
    expect(buildPlanningSchedule([night], { slots: ['22:30', '28:00'], restrictedSlots: ['04:00'] }).candidates.get(night.id).map(option => option.slot)).toEqual(['22:30']);
    expect(rankFeasibleScheduleOptions(buildPlanningSchedule([{ ...night, arrival: '03:40' }]), night.id).map(option => option.slot)).toEqual(['28:00', '28:30']);
  });

  it('elegir cualquiera de las dos opciones alimenta realmente el costo horario de Dijkstra', () => {
    const { result } = plan();
    const choices = result.current.schedule.alternatives;
    expect(choices.map(option => option.slot)).toEqual(['08:00', '07:30']);
    const morning = result.current.schedule.route;
    act(() => result.current.selectScheduleOption(choices[1].slot));
    expect(result.current.schedule.route).toBeNull();
    act(() => result.current.calculateScheduledRoute());
    expect(result.current.schedule.route.slot).toBe('07:30');
    expect(result.current.schedule.route.conditions.trafficIncrease).toBe(20);
    expect(result.current.schedule.route.costTotal).toBeGreaterThan(morning.costTotal);
    expect(result.current.demoMapProps().proposedRoute.positions).toBe(result.current.schedule.route.coordinates);
    act(() => result.current.selectScheduleOption(choices[0].slot));
    act(() => result.current.calculateScheduledRoute());
    expect(result.current.schedule.route.slot).toBe('08:00');
    expect(result.current.schedule.route.conditions.trafficIncrease).toBe(0);
    expect(result.current.schedule.route.costTotal).toBe(morning.costTotal);
  });

  it('deriva cinco grupos reales de acceso sin ofrecer un cierre total ni inventar intersecciones', () => {
    const groups = getOvalAccesses(demoRoadNetwork);
    const ring = demoRoadNetwork.edges.filter(edge => edge.streetName === 'Óvalo Musical');
    const ringNodes = new Set(ring.flatMap(edge => [edge.from, edge.to]));
    expect(groups).toHaveLength(5);
    expect(groups.some(group => group.total)).toBe(false);
    const boundaries = demoRoadNetwork.edges.filter(edge => ringNodes.has(edge.from) !== ringNodes.has(edge.to));
    expect(groups.filter(group => !group.total).flatMap(group => group.edgeIds).sort()).toEqual(boundaries.map(edge => edge.id).sort());
    for (const group of groups.filter(group => !group.total)) {
      expect(group.segments.every(edge => group.label.includes(edge.streetName))).toBe(true);
      expect(group.label).not.toMatch(/osm-|\d+ m/);
    }
  });

  it('un cierre parcial mantiene otros accesos y encuentra el desvío real; el cierre total puede aislar', () => {
    const { result } = plan();
    const initial = result.current.schedule.route;
    const west = result.current.ovalAccesses.find(group => group.label.includes('Atahualpa') && group.label.endsWith('oeste'));
    expect(west).toBeDefined();
    act(() => result.current.setDemoProblem({ closed: true, closureMode: 'access', accessId: west.id, streetName: west.label, edgeIds: west.edgeIds }));
    const graph = buildGraph(result.current.network, { blockedEdgeIds: result.current.demo.edgeIds });
    const available = [...graph.adjacency.values()].flat().map(connection => connection.edge.id);
    expect(west.edgeIds.every(id => !available.includes(id))).toBe(true);
    expect(result.current.ovalAccesses.filter(group => !group.total && group.id !== west.id).flatMap(group => group.edgeIds).every(id => available.includes(id))).toBe(true);
    act(() => result.current.recalculateDemo());
    expect(result.current.schedule.route.status).toBe('found');
    expect(result.current.schedule.route.edgeIds.some(id => west.edgeIds.includes(id))).toBe(false);
    expect(result.current.schedule.route.distanceTotal).toBeGreaterThan(initial.distanceTotal);
    act(() => result.current.resetCondition());
    // Engine regression only: a total closure is no longer offered in the UI.
    const total = { id: 'test-total', label: 'Cierre total', edgeIds: result.current.network.edges.filter(edge => edge.streetName === 'Óvalo Musical').map(edge => edge.id) };
    act(() => result.current.setDemoProblem({ closed: true, closureMode: 'total', accessId: total.id, streetName: total.label, edgeIds: total.edgeIds }));
    act(() => result.current.recalculateDemo());
    expect(result.current.schedule.route.status).toBe('unreachable');
    expect(result.current.schedule.route.coordinates).toEqual([]);
    expect(result.current.demoMapProps().proposedRoute).toBeNull();
  });

  it('la UI permite elegir la segunda opción y resaltar un acceso sin listas de edges', async () => {
    render(<MemoryRouter initialEntries={['/planificar-viaje']}><AppRoutes /></MemoryRouter>);
    const user = userEvent.setup();
    expect(screen.getByRole('option', { name: 'C001 · Camión rígido C2 · 2 ejes' })).toBeInTheDocument();
    expect(screen.getByText('Configuración: C2 · 2 ejes')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' }));
    await user.click(screen.getByRole('radio', { name: 'Segunda alternativa factible: 7:30 a. m.' }));
    await user.click(screen.getByRole('button', { name: 'CALCULAR RUTA' }));
    expect(screen.getByText('7:30 a. m.', { selector: '.schedule-result b' })).toBeVisible();
    expect(screen.getAllByRole('button', { name: /Tramo \d+: Óvalo Musical/ })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Restricción en Óvalo Musical' }));
    expect(document.querySelector('.road-segment-options')).not.toBeInTheDocument();
    const radio = screen.getByRole('radio', { name: 'Restringir conexión con Avenida Atahualpa · oeste' });
    fireEvent.mouseEnter(radio.parentElement);
    expect(document.querySelector('.leaflet-sitrac-access-highlight-pane path')).toBeInTheDocument();
    fireEvent.mouseLeave(radio.parentElement);
    await user.click(radio);
    expect(document.querySelectorAll('.leaflet-sitrac-blocked-pane path')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'RECALCULAR RUTA' }));
    expect(screen.getByText(/Se bloquearon solo sus conexiones/)).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Comparar plan' }));
    expect(document.querySelector('.result-after')).toHaveTextContent('7:30 a. m.');
  });
});
