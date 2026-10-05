import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockVehicles } from '../data/mock/vehicles';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Notice from '../components/ui/Notice';
import VehicleTable from '../components/vehicles/VehicleTable';
import VehicleDetails from '../components/vehicles/VehicleDetails';

export default function FreightPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [selected, setSelected] = useState(searchParams.get('vehiculo') ?? 'C002');
  const [notice, setNotice] = useState('');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const vehicles = mockVehicles.filter(vehicle => (!type || vehicle.type === type) && (!priority || vehicle.priority === priority) && normalize([vehicle.id, vehicle.type, vehicle.operator, vehicle.origin, vehicle.destination].join(' ')).includes(normalize(query)));
  const selectedVehicle = vehicles.find(vehicle => vehicle.id === selected);
  const reset = () => { setQuery(''); setType(''); setPriority(''); };
  const pending = action => setNotice(`${action} estará disponible en una fase posterior. Esta entrega permite consultar y seleccionar registros de demostración.`);
  return <div className="page freight-page">
    <PageHeader eyebrow="Vehículos de carga" icon="inventory_2" title="Vehículos de carga" description="Selecciona un vehículo para planificar su viaje. Datos del prototipo académico.">
    </PageHeader>
    {notice && <Notice>{notice}<button className="text-button" onClick={() => setNotice('')}>Cerrar aviso</button></Notice>}
    <div className="vehicle-filters"><label className="search-field"><Icon name="search" /><input aria-label="Buscar vehículos" placeholder="Buscar por código, operador o destino…" value={query} onChange={event => setQuery(event.target.value)} /></label><label>Tipo:<select aria-label="Tipo de vehículo" value={type} onChange={event => setType(event.target.value)}><option value="">Todos los tipos</option>{[...new Set(mockVehicles.map(v => v.type))].map(item => <option key={item}>{item}</option>)}</select></label><label>Prioridad:<select aria-label="Prioridad" value={priority} onChange={event => setPriority(event.target.value)}><option value="">Todas las prioridades</option>{['Normal', 'Perecible', 'Crítica'].map(item => <option key={item}>{item}</option>)}</select></label><span className="filter-count" role="status">Mostrando {vehicles.length} de {mockVehicles.length} registros</span><button className="text-button" onClick={reset}>Restablecer filtros</button></div>
    <VehicleTable vehicles={vehicles} selected={selected} onSelect={setSelected} onEdit={id => pending(`La edición de ${id}`)} />
    {selectedVehicle ? <details><summary>Ver detalle del vehículo seleccionado</summary><VehicleDetails vehicle={selectedVehicle} /></details> : vehicles.length > 0 && <Notice>Selecciona un vehículo de la tabla para consultar su detalle.</Notice>}
  </div>;
}
