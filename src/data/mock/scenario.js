// Fixtures de la maqueta de Stitch. NO son mediciones ni restricciones reales.
export const mockScenario = {
  source: 'DEMO', name: 'Horas Punta Cajamarca',
  zone: 'Centro Histórico y Vías de Acceso',
  area: 'Cuadrante Histórico y Vías Conectoras', period: '07:00 – 09:00 hrs',
};
export const mockTimeSlots = ['07:00 – 07:30', '07:30 – 08:00', '08:00 – 08:30', '08:30 – 09:00'];
export const mockInitialSimulation = { traffic: 20, freight: 10, incidents: ['closure'], restricted: true, from: '07:00', to: '09:00' };
export const mockSimulationOptions = {
  traffic: [0, 10, 20, 30], freight: [0, 5, 10, 20],
  incidents: [
    { id: 'closure', label: 'Cerrar una vía', detail: 'Jr. Comercio' },
    { id: 'accident', label: 'Accidente vial', detail: 'Intersección principal' },
    { id: 'lane', label: 'Reducción de carril', detail: 'Av. Atahualpa por obras' },
  ],
};
export const mockPresets = [
  { id: 'base', name: 'Línea Base Regular', detail: 'Configuración de ejemplo sin incidentes ni restricciones.', config: { traffic: 0, freight: 0, incidents: [], restricted: false, from: '07:00', to: '09:00' } },
  { id: 'market', name: 'Día de Feria / Mercado', detail: 'Ejemplo de mayor demanda y reducción de un carril.', config: { traffic: 30, freight: 20, incidents: ['lane'], restricted: true, from: '07:00', to: '09:00' } },
  { id: 'night', name: 'Ventana Nocturna', detail: 'Ejemplo de configuración horaria que cruza medianoche.', config: { traffic: 0, freight: 5, incidents: [], restricted: true, from: '21:00', to: '05:00' } },
];
