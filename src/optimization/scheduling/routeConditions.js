import { isPeakSlot } from './scheduleCosts';

// Preserve the existing schedule-to-route assumption for the same DEMO periods.
export const routeConditionsForSlot = slot => ({ trafficIncrease: isPeakSlot(slot) ? 20 : 0 });
