import { cajamarcaContext } from '../../data/references/cajamarcaContext';
import { DEMO_MODEL_PARAMETERS, timeToMinutes } from './scheduleConfig';

const overlaps = (slot, period) => {
  const start = timeToMinutes(slot);
  return start >= timeToMinutes(period.start) && start < timeToMinutes(period.end);
};

export const isPeakSlot = slot => cajamarcaContext.peakPeriods.some(period => overlaps(slot, period));

export const getScheduleCost = (vehicle, slot, parameters = DEMO_MODEL_PARAMETERS) => {
  const arrival = timeToMinutes(vehicle.arrival);
  const start = timeToMinutes(slot);
  const waitingHours = Math.max(0, start - arrival) / 60;
  const congestionCost = isPeakSlot(slot) ? parameters.congestionFactors.high : parameters.congestionFactors.normal;
  return { congestionCost, waitingCost: waitingHours * parameters.waitingCostPerHour, total: congestionCost + waitingHours * parameters.waitingCostPerHour };
};
