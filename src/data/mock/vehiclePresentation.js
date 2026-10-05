// Configuraciones extraídas únicamente de los registros DEMO existentes.
export const vehicleDescriptions = {
  C001: { type: 'Camión rígido de carga', configuration: 'C2', axles: 2, selectorLabel: 'Camión rígido C2 · 2 ejes' },
  C002: { type: 'Camión rígido pesado', configuration: 'C3', axles: 3, selectorLabel: 'Camión rígido C3 · 3 ejes' },
  C003: { type: 'Furgón de distribución', configuration: null, axles: null, selectorLabel: 'Furgón de distribución' },
  C004: { type: 'Tractocamión + semirremolque', configuration: 'T3S2', axles: 5, selectorLabel: 'Tractocamión T3S2 · 5 ejes' },
  C005: { type: 'Camión rígido de carga', configuration: 'C2', axles: 2, selectorLabel: 'Camión rígido C2 · 2 ejes' },
};
export const configurationLabel = vehicle => vehicle.configuration
  ? `${vehicle.configuration} · ${vehicle.axles} ejes`
  : 'Sin datos de configuración · DEMO';
