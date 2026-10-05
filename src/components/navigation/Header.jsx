import Icon from '../ui/Icon';
import { NavLink } from 'react-router-dom';

export default function Header({ onMenu }) {
  return <header className="app-header">
    <button className="icon-button menu-toggle" onClick={onMenu} aria-label="Abrir menú"><Icon name="menu" /></button>
    <div className="header-context"><strong>SITRAC Cajamarca</strong></div>
    <nav className="header-nav" aria-label="Navegación principal"><NavLink to="/planificar-viaje">Planificar</NavLink><NavLink to="/transporte-carga">Vehículos</NavLink><NavLink to="/resultados">Resultados</NavLink></nav>
    <span className="academic-badge" title="Los vehículos, niveles de tráfico y escenarios son datos de demostración.">Prototipo académico</span>
  </header>;
}
