import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import { navigation } from '../app/navigation';
import ExposureBar from '../components/simulations/ExposureBar';
import { useRouting } from '../app/routingState';

export default function AppLayout() {
  const { exposure } = useRouting();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${navigation.find(item => item.to === pathname)?.label ?? 'Inicio'} | SITRAC Cajamarca`;
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return <>
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <div className="app-shell">
      <Header onMenu={() => setMenuOpen(true)} />
      <ExposureBar />
      <main id="main-content" tabIndex={-1}><Outlet /></main>
    </div>
  </>;
}
