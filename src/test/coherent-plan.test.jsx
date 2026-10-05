import { describe, it, expect } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../app/router';
import { RoutingProvider } from '../app/RoutingContext';
import { useRouting } from '../app/routingState';
import { dijkstra } from '../optimization/graph/dijkstra';
import { findNearestRoadSegment } from '../optimization/graph/roadSelection';
import { groupRouteStreets } from '../optimization/graph/routePresentation';
import { formatTime, formatTimeRange } from '../utils/formatTime';

function plan() {
  const hook = renderHook(() => useRouting(), { wrapper: RoutingProvider });
  act(() => { hook.result.current.optimizeSchedule('C001'); });
  act(() => { hook.result.current.calculateScheduledRoute(); });
  return hook;
}
async function openPlan() {
  render(<MemoryRouter initialEntries={['/planificar-viaje']}><AppRoutes /></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' }));
  await user.click(screen.getByRole('button', { name: 'CALCULAR RUTA' }));
  return user;
}

describe('Un único plan de horario y ruta', () => {
  it('el mapa, la lista, los resultados y el recálculo utilizan el mismo resultado', () => {
    const { result } = plan();
    expect(result.current.schedule.route).toBe(result.current.demo.initial);
    expect(result.current.demoMapProps().proposedRoute.positions).toBe(result.current.schedule.route.coordinates);
    expect(result.current.schedule.route.slot).toBe(result.current.schedule.result.assignments[0].slot);
    expect(result.current.schedule.originalRoute.slot).toBe(result.current.schedule.originalSlot);
  });

  it('el marcador de destino coincide con el nodo temporal usado por Dijkstra', () => {
    const { result } = plan();
    const edge = result.current.schedule.route.segments[3];
    const point = edge.geometry[0].map((value, index) => (value + edge.geometry[1][index]) / 2);
    const snap = findNearestRoadSegment(point, result.current.selectionRoads);
    act(() => { result.current.selectMapDestination(snap); });
    expect(result.current.destinationInfo.name).toContain(snap.road.streetName);
    act(() => { result.current.calculateScheduledRoute(); });
    const route = result.current.schedule.route;
    expect(route.status).toBe('found');
    expect(route.nodeIds.at(-1)).toBe(result.current.destination);
    expect(result.current.demoMapProps().endpoints[1].position).toEqual(snap.projected);
    expect(route.coordinates.at(-1)).toEqual(result.current.demoMapProps().endpoints[1].position);
  });

  it('seleccionar un cierre pinta los edges inmediatamente y el recálculo los excluye', () => {
    const { result } = plan();
    const original = result.current.schedule.route;
    const street = groupRouteStreets(original.segments).find(group => {
      const ids = result.current.network.edges.filter(edge => edge.streetName === group.streetName).map(edge => edge.id);
      return dijkstra(result.current.network, result.current.origin, result.current.destination, { ...original.conditions, blockedEdgeIds: ids }).status === 'found';
    });
    expect(street).toBeDefined();
    const edgeIds = result.current.network.edges.filter(edge => edge.streetName === street.streetName).map(edge => edge.id);
    act(() => { result.current.setDemoProblem({ closed: true, edgeId: edgeIds[0], edgeIds }); });
    expect(result.current.demo.updated).toBeNull();
    expect(result.current.schedule.route).toBe(original);
    const roads = result.current.demoMapProps().roads.filter(edge => edgeIds.includes(edge.id));
    expect(roads.every(edge => edge.status === 'blocked' && edge.color === '#dc2626')).toBe(true);
    act(() => { result.current.recalculateDemo(); });
    expect(result.current.schedule.route.status).toBe('found');
    expect(result.current.schedule.route.edgeIds.some(id => edgeIds.includes(id))).toBe(false);
    expect(result.current.schedule.route).toBe(result.current.demo.updated);
    expect(result.current.demoMapProps().currentRoute.positions).toBe(original.coordinates);
  });

  it('un cierre que aísla el ingreso produce ausencia de ruta sin inventar conexiones', () => {
    const { result } = plan();
    const edgeIds = result.current.network.edges.filter(edge => edge.from === result.current.origin || edge.to === result.current.origin).map(edge => edge.id);
    act(() => { result.current.setDemoProblem({ closed: true, edgeId: edgeIds[0], edgeIds }); });
    act(() => { result.current.recalculateDemo(); });
    expect(result.current.schedule.route.status).toBe('unreachable');
    expect(result.current.schedule.route.coordinates).toEqual([]);
    expect(result.current.demoMapProps().proposedRoute).toBeNull();
  });

  it('separa procedencia de ingreso y deriva el punto al cambiar de corredor', () => {
    const { result } = plan();
    act(() => { result.current.selectProvenance('norte'); });
    expect(result.current.provenance.label).toBe('Chota / Bambamarca');
    expect(result.current.origin).toBe('N');
    expect(result.current.demoMapProps().endpoints[0].name).not.toBe(result.current.provenance.label);
    expect(result.current.schedule.route).toBeNull();
    expect(result.current.schedule.result.status).toBe('optimal');
  });

  it('muestra el streetName del tramo real y sincroniza mapa con lista', async () => {
    await openPlan();
    const segment = screen.getByRole('button', { name: /^Tramo 1:/ });
    const street = segment.getAttribute('aria-label').replace('Tramo 1: ', '');
    fireEvent.mouseOver(segment);
    expect(document.querySelector('.route-tooltip strong')).toHaveTextContent(street);
    expect(screen.getByRole('button', { name: `Centrar calle 1: ${street}` })).toHaveClass('active');
    fireEvent.mouseOut(segment);
    expect(screen.getByRole('button', { name: `Centrar calle 1: ${street}` })).not.toHaveClass('active');
    fireEvent.mouseEnter(screen.getByRole('button', { name: `Centrar calle 1: ${street}` }));
    expect(segment).toHaveAttribute('stroke-width', '9');
  });

  it('el cierre es rojo en el DOM antes de recalcular y la explicación usa el horario calculado', async () => {
    const user = await openPlan();
    await user.click(screen.getByText('VER POR QUÉ'));
    expect(screen.getByText(/La franja 8:00 a. m. utiliza un incremento de tráfico DEMO de 0%/)).toBeVisible();
    expect(screen.queryByText(/Además, la vía bloqueada fue excluida/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cierre en Óvalo Musical' }));
    await user.click(screen.getByRole('radio', { name: /Conexión con Avenida Vía de Evitamiento Sur/ }));
    expect(document.querySelector('.leaflet-sitrac-blocked-pane path[stroke="#dc2626"]')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '¿QUÉ CAMBIÓ?' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RECALCULAR RUTA' })).toBeEnabled();
  });

  it('formatea madrugada, mediodía, tarde, noche y rangos con AM/PM', () => {
    expect(formatTime('00:00')).toBe('12:00 a. m.');
    expect(formatTime('07:00')).toBe('7:00 a. m.');
    expect(formatTime('12:30')).toBe('12:30 p. m.');
    expect(formatTime('18:00')).toBe('6:00 p. m.');
    expect(formatTime('22:00')).toBe('10:00 p. m.');
    expect(formatTimeRange('07:00 – 09:00 hrs')).toBe('7:00 a. m. – 9:00 a. m.');
  });

  it('Resultados alterna la situación original y la propuesta del mismo plan', async () => {
    const user = await openPlan();
    await user.click(screen.getByRole('button', { name: 'Cierre en Óvalo Musical' }));
    await user.click(screen.getByText('Otras vías de la ruta'));
    await user.click(screen.getByRole('radio', { name: 'Jirón Amalia Puga' }));
    await user.click(screen.getByRole('button', { name: 'RECALCULAR RUTA' }));
    await user.click(screen.getByRole('link', { name: 'Comparar plan' }));
    expect(screen.getByRole('heading', { name: 'Resultado del viaje' })).toBeVisible();
    expect(document.querySelector('.result-before')).toHaveTextContent('7:30 a. m.');
    expect(document.querySelector('.result-after')).toHaveTextContent('8:00 a. m.');
    expect(document.querySelector('.leaflet-sitrac-route-pane')).not.toHaveTextContent('Jirón Amalia Puga');
    await user.click(screen.getByRole('button', { name: 'Antes' }));
    expect(document.querySelector('.geo-results')).toHaveAttribute('data-view', 'before');
    expect(screen.getByText('RUTA ORIGINAL', { exact: true })).toBeVisible();
    expect(document.querySelector('.leaflet-sitrac-blocked-pane path')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tramo 17: Jirón Amalia Puga' })).toHaveAttribute('stroke', '#334155');
    await user.click(screen.getByRole('button', { name: 'Propuesta SITRAC', exact: true }));
    expect(document.querySelector('.geo-results')).toHaveAttribute('data-view', 'after');
    expect(document.querySelector('.leaflet-sitrac-blocked-pane path[stroke="#dc2626"]')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tramo 17: Jirón Amalia Puga' })).not.toBeInTheDocument();
  });

  it('la exposición permite detenerse en doce pasos y exige calcular antes de avanzar', async () => {
    render(<MemoryRouter initialEntries={['/planificar-viaje']}><AppRoutes /></MemoryRouter>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'MODO EXPOSICIÓN' }));
    expect(screen.getByText('Paso 1 de 12')).toBeVisible();
    for (let step = 2; step <= 4; step++) await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    expect(screen.getByRole('button', { name: 'SIGUIENTE' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' }));
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    expect(screen.getByText('Paso 6 de 12')).toBeVisible();
    expect(screen.getByRole('button', { name: 'SIGUIENTE' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'CALCULAR RUTA' }));
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    expect(screen.getByText('Paso 8 de 12')).toBeVisible();
    await user.click(screen.getByText('Otras vías de la ruta'));
    await user.click(screen.getByRole('radio', { name: 'Jirón Amalia Puga' }));
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    expect(screen.getByText('Paso 9 de 12')).toBeVisible();
    expect(document.querySelector('.leaflet-sitrac-blocked-pane path[stroke="#dc2626"]')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    expect(screen.getByRole('button', { name: 'SIGUIENTE' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'RECALCULAR RUTA' }));
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    await user.click(screen.getByRole('button', { name: 'SIGUIENTE' }));
    expect(screen.getByText('Paso 12 de 12')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Resultado del viaje' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Salir del modo exposición' }));
    expect(screen.queryByText('Paso 12 de 12')).not.toBeInTheDocument();
  });
});
