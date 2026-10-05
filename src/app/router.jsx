import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import HomePage from '../pages/HomePage';
import TrafficMapPage from '../pages/TrafficMapPage';
import FreightPage from '../pages/FreightPage';
import SimulationsPage from '../pages/SimulationsPage';
import OptimizationPage from '../pages/OptimizationPage';
import ResultsPage from '../pages/ResultsPage';
import Button from '../components/ui/Button';
import { RoutingProvider } from './RoutingContext';

export default function AppRoutes() {
  return <RoutingProvider><Routes><Route element={<AppLayout />}>
    <Route index element={<Navigate to="/planificar-viaje" replace />} />
    <Route path="inicio" element={<HomePage />} />
    <Route path="planificar-viaje" element={<SimulationsPage />} />
    <Route path="mapa" element={<TrafficMapPage />} />
    <Route path="transporte-carga" element={<FreightPage />} />
    <Route path="simulaciones" element={<SimulationsPage legacy />} />
    <Route path="buscar-solucion" element={<OptimizationPage />} />
    <Route path="resultados" element={<ResultsPage />} />
    <Route path="*" element={<div className="page"><h1>Página no encontrada</h1><p>La dirección no corresponde a una pantalla de SITRAC.</p><Button to="/inicio">Volver al inicio</Button></div>} />
  </Route></Routes></RoutingProvider>;
}
