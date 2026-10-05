import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import TechnicalDetails from '../components/ui/TechnicalDetails';

export default function HomePage() {
  return <div className="page home-page simple-home">
    <Panel className="hero">
      <span className="eyebrow">SITRAC · DEMO ACADÉMICO</span>
      <h1>¿Qué hace SITRAC?</h1>
      <p className="hero-description">SITRAC ayuda a evaluar cuándo y por dónde podría circular un vehículo de carga para reducir su participación en períodos de alta congestión sin impedir el abastecimiento de Cajamarca.</p>
      <Button to="/planificar-viaje" variant="primary" endIcon="arrow_forward">PLANIFICAR UN VIAJE</Button>
    </Panel>
    <div className="technique-cards">
      <Panel><span className="module-icon">1</span><h2>¿Cuándo debe circular?</h2><strong>Programación Entera</strong><p>Selecciona un horario factible con menor costo de congestión.</p></Panel>
      <Panel><span className="module-icon">2</span><h2>¿Por dónde debe ir?</h2><strong>Dijkstra</strong><p>Calcula la ruta disponible de menor costo entre el inicio y el destino.</p></Panel>
    </div>
    <TechnicalDetails title="Ver detalles técnicos" subtitle="Métodos utilizados en la demostración">
      <p>Horario + Ruta = Plan recomendado. El detalle matemático se mantiene disponible para la exposición, sin interrumpir el uso normal.</p>
    </TechnicalDetails>
  </div>;
}
