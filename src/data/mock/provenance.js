export const provenanceOptions = [
  { id: 'costa', label: 'Lima / Costa', corridor: 'Costa → Pacasmayo / Ciudad de Dios → Cajamarca', entryPointId: 'A' },
  { id: 'norte', label: 'Chota / Bambamarca', corridor: 'PE-3N norte → Cajamarca', entryPointId: 'N' },
  { id: 'sur', label: 'San Marcos / Cajabamba', corridor: 'PE-3N sur → Cajamarca', entryPointId: 'A' },
  { id: 'celendin', label: 'Celendín', corridor: 'PE-08B → Cajamarca', entryPointId: 'H' },
];

export const provenanceById = Object.fromEntries(provenanceOptions.map(item => [item.id, item]));
