export function solveSchedule(model) {
  const { vehicles, candidates, capacity } = model;
  if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('La capacidad por franja debe ser un entero positivo.');
  let best = null;
  const used = new Map();
  const assignments = [];
  const visit = index => {
    if (index === vehicles.length) {
      const objective = assignments.reduce((sum, item) => sum + item.cost.total, 0);
      if (!best || objective < best.objective) best = { objective, assignments: assignments.map(item => ({ ...item })) };
      return;
    }
    const vehicle = vehicles[index];
    for (const option of candidates.get(vehicle.id) ?? []) {
      const count = used.get(option.slot) ?? 0;
      if (count >= capacity) continue;
      used.set(option.slot, count + 1);
      assignments.push(option);
      visit(index + 1);
      assignments.pop();
      if (count) used.set(option.slot, count); else used.delete(option.slot);
    }
  };
  visit(0);
  if (!best) return { status: 'infeasible', assignments: [], objective: null, message: 'No existe un horario factible con las restricciones seleccionadas.' };
  return { status: 'optimal', ...best, assignments: best.assignments.sort((a, b) => a.vehicleId.localeCompare(b.vehicleId)) };
}
