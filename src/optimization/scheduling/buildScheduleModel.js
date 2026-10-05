import { DEMO_MODEL_PARAMETERS, generateTimeSlots, timeToMinutes } from './scheduleConfig';
import { getScheduleCost } from './scheduleCosts';

const getWindowEnd = vehicle => vehicle.windowEnd ?? String(vehicle.window).match(/\d{2}:\d{2}\s*$/)?.[0]?.trim();

export function buildScheduleModel(vehicles, options = {}) {
  const parameters = { ...DEMO_MODEL_PARAMETERS, ...options.parameters };
  const slots = options.slots ?? generateTimeSlots(parameters);
  const restrictedSlots = new Set(options.restrictedSlots ?? []);
  const candidates = new Map();
  for (const vehicle of vehicles) {
    const arrival = timeToMinutes(vehicle.arrival);
    const windowEnd = timeToMinutes(getWindowEnd(vehicle));
    candidates.set(vehicle.id, slots.filter(slot => {
      const start = timeToMinutes(slot);
      return start >= arrival && start <= windowEnd && !restrictedSlots.has(slot);
    }).map(slot => ({ vehicleId: vehicle.id, slot, cost: getScheduleCost(vehicle, slot, parameters) })));
  }
  return { type: 'binary-schedule', vehicles, slots, candidates, capacity: options.capacity ?? parameters.defaultCapacity, parameters };
}
