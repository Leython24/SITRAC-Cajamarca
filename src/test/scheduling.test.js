import { describe, expect, it } from 'vitest';
import { mockVehicles } from '../data/mock/vehicles';
import { buildScheduleModel } from '../optimization/scheduling/buildScheduleModel';
import { solveSchedule } from '../optimization/scheduling/solveSchedule';
import { isPeakSlot } from '../optimization/scheduling/scheduleCosts';
import { dijkstra } from '../optimization/graph/dijkstra';
import { buildGraph } from '../optimization/graph/buildGraph';
import { demoRoadNetwork } from '../data/mock/roadNetwork';

describe('Programación entera binaria DEMO', () => {
  it('asigna exactamente una franja por vehículo', () => {
    const result = solveSchedule(buildScheduleModel(mockVehicles));
    expect(result.status).toBe('optimal');
    expect(result.assignments).toHaveLength(mockVehicles.length);
    expect(new Set(result.assignments.map(item => item.vehicleId)).size).toBe(mockVehicles.length);
  });
  it('nunca asigna antes de la llegada y respeta el fin de ventana', () => {
    const result = solveSchedule(buildScheduleModel(mockVehicles));
    for (const assignment of result.assignments) {
      const vehicle = mockVehicles.find(item => item.id === assignment.vehicleId);
      expect(assignment.slot >= vehicle.arrival).toBe(true);
      expect(assignment.slot <= vehicle.window.match(/\d{2}:\d{2}\s*$/)[0].trim()).toBe(true);
    }
  });
  it('respeta una restricción horaria activa', () => {
    const result = solveSchedule(buildScheduleModel([mockVehicles[0]], { restrictedSlots: ['08:00'] }));
    expect(result.assignments[0].slot).not.toBe('08:00');
  });
  it('respeta la capacidad por franja', () => {
    const result = solveSchedule(buildScheduleModel(mockVehicles, { capacity: 1 }));
    const counts = result.assignments.reduce((map, item) => map.set(item.slot, (map.get(item.slot) ?? 0) + 1), new Map());
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(1);
  });
  it('evita una hora de alto costo cuando existe una alternativa razonable', () => {
    const result = solveSchedule(buildScheduleModel([{ ...mockVehicles[0], arrival: '06:00', window: '06:00 – 09:00' }], { slots: ['07:00', '08:00', '09:00'] }));
    expect(result.assignments[0].slot).toBe('08:00');
    expect(isPeakSlot('07:00')).toBe(true);
  });
  it('devuelve sin solución factible cuando corresponde', () => {
    const result = solveSchedule(buildScheduleModel(mockVehicles.slice(0, 2), { slots: ['07:00'], capacity: 1 }));
    expect(result.status).toBe('infeasible');
  });
  it('es determinista para las mismas entradas', () => {
    expect(solveSchedule(buildScheduleModel(mockVehicles))).toEqual(solveSchedule(buildScheduleModel(mockVehicles)));
  });
  it('conecta horario optimizado, costo horario y Dijkstra', () => {
    const schedule = solveSchedule(buildScheduleModel([mockVehicles[0]]));
    const route = dijkstra(buildGraph(demoRoadNetwork), 'A', 'G', { trafficIncrease: isPeakSlot(schedule.assignments[0].slot) ? 20 : 0 });
    expect(route.status).toBe('found');
    expect(route.costTotal).toBeGreaterThan(0);
  });
});
