// Indicadores de tráfico intencionalmente nulos: Dijkstra calcula costo y
// distancia de una ruta, no simulación de tráfico ni asignación de horarios.
export const mockResults = {
  source: 'DEMO', status: 'pending',
  metrics: [
    { id: 'travel', label: 'Tiempo promedio de viaje', unit: 'min', before: null, after: null, change: null },
    { id: 'delay', label: 'Demora por congestión', unit: 'min', before: null, after: null, change: null },
    { id: 'freight', label: 'Pesados en hora crítica', unit: 'veh', before: null, after: null, change: null },
    { id: 'saturation', label: 'Saturación vías céntricas', unit: 'V/C', before: null, after: null, change: null },
  ],
  changes: [
    { icon: 'calendar_clock', title: 'Vehículos reprogramados', text: 'Aquí se mostrarán los vehículos con cambios de horario cuando exista una solución calculada.', footer: 'Horario propuesto: —' },
    { icon: 'fork_right', title: 'Asignación individual de rutas', text: 'El recorrido de Dijkstra aparece arriba. Su asignación individual a vehículos y horarios todavía no está implementada.', footer: 'Ruta por vehículo: —' },
    { icon: 'traffic', title: 'Vías menos utilizadas', text: 'La comparación de utilización se completará con resultados verificables del modelo.', footer: 'Variación de uso: —' },
    { icon: 'inventory_2', title: 'Abastecimiento protegido', text: 'El cumplimiento de las ventanas de entrega se verificará con los datos del modelo.', footer: 'Cumplimiento: —' },
  ],
};
