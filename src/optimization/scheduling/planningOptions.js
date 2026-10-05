import { buildScheduleModel } from './buildScheduleModel';
import { solveSchedule } from './solveSchedule';
import { DEMO_MODEL_PARAMETERS, generateTimeSlots, timeToMinutes, minutesToTime } from './scheduleConfig';

// Connection layer: the existing binary model and solver remain unchanged.
// Only windows explicitly crossing midnight receive next-day slots (24:00+).
export function buildPlanningSchedule(vehicles, options = {}) {
  const normalized = vehicles.map(vehicle => {
    const window = String(vehicle.window).match(/(\d{2}:\d{2})\s*–\s*(\d{2}:\d{2})/);
    if (!window || timeToMinutes(window[2]) >= timeToMinutes(window[1])) return vehicle;
    const arrival = timeToMinutes(vehicle.arrival);
    return { ...vehicle, arrival: minutesToTime(arrival <= timeToMinutes(window[2]) ? arrival + 1440 : arrival),
      windowStart: window[1], windowEnd: minutesToTime(timeToMinutes(window[2]) + 1440), crossesMidnight: true };
  });
  const overnight = normalized.filter(vehicle => vehicle.crossesMidnight);
  const parameters = { ...DEMO_MODEL_PARAMETERS, ...options.parameters };
  const slots = options.slots ?? (overnight.length ? [...new Set([...generateTimeSlots(parameters),
    ...overnight.flatMap(vehicle => generateTimeSlots({ ...parameters, startHour: timeToMinutes(vehicle.windowStart) / 60, endHour: timeToMinutes(vehicle.windowEnd) / 60 }))])].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)) : undefined);
  const restrictedSlots = slots?.filter(slot => (options.restrictedSlots ?? []).some(restricted => timeToMinutes(restricted) % 1440 === timeToMinutes(slot) % 1440)) ?? options.restrictedSlots;
  const model = buildScheduleModel(normalized, { ...options, slots, restrictedSlots });
  // Respect the start as well as the end of each supplied attention window.
  for (const vehicle of normalized) {
    const start = vehicle.windowStart ?? String(vehicle.window).match(/^\d{2}:\d{2}/)?.[0];
    if (start) model.candidates.set(vehicle.id, model.candidates.get(vehicle.id).filter(option => timeToMinutes(option.slot) >= timeToMinutes(start)));
  }
  return model;
}

export function rankFeasibleScheduleOptions(model, vehicleId, limit = 2) {
  // Fix one candidate at a time and let the original solver verify all current
  // constraints, including capacity and other vehicles. No fabricated times.
  const feasible = (model.candidates.get(vehicleId) ?? []).flatMap(candidate => {
    const candidates = new Map(model.candidates);
    candidates.set(vehicleId, [candidate]);
    const solution = solveSchedule({ ...model, candidates });
    return solution.status === 'optimal' ? [{ ...candidate, objective: solution.objective }] : [];
  });
  return feasible.sort((a, b) => a.objective - b.objective || timeToMinutes(a.slot) - timeToMinutes(b.slot)).slice(0, limit);
}
