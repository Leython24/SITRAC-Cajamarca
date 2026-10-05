import { NavLink } from 'react-router-dom';
import { navigation } from '../../app/navigation';
import Icon from '../ui/Icon';
import { useRouting } from '../../app/routingState';

export default function Sidebar({ open, onClose }) {
  const { exposure } = useRouting();
  const items = exposure.enabled ? navigation.filter(item => ['/inicio', '/planificar-viaje', '/resultados'].includes(item.to)) : navigation;
  return <>
    {open && <button className="nav-scrim" aria-label="Cerrar menú" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <NavLink to="/planificar-viaje" className="brand" onClick={onClose}>
        <img src="/logo.png" alt="" width="34" height="34" />
        <span><strong>SITRAC Cajamarca</strong><small>Movilidad y Carga Urbana</small></span>
      </NavLink>
      <nav aria-label="Navegación principal">
        {items.map(item => <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Icon name={item.icon} /><span>{item.label}</span>
        </NavLink>)}
      </nav>
      <div className="scenario-status"><span title="Los vehículos, tráfico y escenarios son datos de demostración.">Prototipo académico</span></div>
    </aside>
  </>;
}
