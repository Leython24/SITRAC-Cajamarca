import { Link } from 'react-router-dom';
import { formatTime } from '../../utils/formatTime';
import { demoRoadNetwork } from '../../data/mock/roadNetwork';
import { configurationLabel } from '../../data/mock/vehiclePresentation';
export default function VehiclePopup({ vehicle }) {
  return <div className="map-popup-content">
    <strong>Vehículo {vehicle.id}</strong><span className="popup-demo">DEMO · Ubicación ficticia</span>
    <p>Tipo / uso: {vehicle.type}<br />Configuración: {configurationLabel(vehicle)}</p>
    <dl><dt>Origen</dt><dd>{demoRoadNetwork.nodes.find(node => node.id === vehicle.entryPointId)?.displayName}</dd><dt>Destino</dt><dd>{vehicle.destination}</dd><dt>Hora de llegada</dt><dd>{formatTime(vehicle.arrival)}</dd><dt>Estado</dt><dd>{vehicle.status}</dd></dl>
    <Link to="/transporte-carga">Ver transporte de carga</Link>
  </div>;
}
