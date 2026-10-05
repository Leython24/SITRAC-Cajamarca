export const DEMO_MODEL_PARAMETERS = {
  slotMinutes: 30,
  startHour: 6,
  endHour: 22,
  defaultCapacity: 2,
  congestionFactors: { normal: 1, high: 2 },
  waitingCostPerHour: 0.15,
};

export const timeToMinutes = value => {
  const [hours, minutes] = String(value).split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) throw new RangeError(`Hora inválida: ${value}`);
  return hours * 60 + minutes;
};

export const minutesToTime = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export const generateTimeSlots = (parameters = DEMO_MODEL_PARAMETERS) => {
  const slots = [];
  for (let minutes = parameters.startHour * 60; minutes <= parameters.endHour * 60; minutes += parameters.slotMinutes) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
};
