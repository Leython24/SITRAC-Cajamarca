import { useState } from 'react';
import { mockObjectives, mockConstraints } from '../data/mock/optimization';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import TechnicalDetails from '../components/ui/TechnicalDetails';
import Notice from '../components/ui/Notice';
import OptionChecklist from '../components/optimization/OptionChecklist';
import RoutingPanel from '../components/optimization/RoutingPanel';

export default function OptimizationPage() {
  const [objectives, setObjectives] = useState(mockObjectives.map(item => item.id));
  const [constraints, setConstraints] = useState(mockConstraints.map(item => item.id));
  const [notice, setNotice] = useState('');
  return <div className="page optimization-page">
    <Panel><PageHeader title="Buscar una mejor solución" description="Calcula una ruta de menor costo con Dijkstra. La asignación de horarios sigue pendiente." /></Panel>
    <Button to="/simulaciones" variant="primary">Abrir demostración guiada</Button>
    <TechnicalDetails title="Ver detalles técnicos" subtitle="Controles avanzados y campos preparados para otra fase">
    <Panel><RoutingPanel /></Panel>
    <div className="optimization-options"><Panel><div className="section-header"><h2><Icon name="checklist" />¿Qué queremos mejorar?</h2><span className="subtle-label">Selección múltiple</span></div><p className="section-description">Metas de la futura asignación conjunta de rutas y horarios. Estas opciones no modifican el costo de Dijkstra.</p><OptionChecklist label="Objetivos de la solución" options={mockObjectives} selected={objectives} onChange={setObjectives} /></Panel><Panel><h2><Icon name="verified_user" />Restricciones a considerar</h2><p className="section-description">Opciones de demostración. Los parámetros y las normas aplicables aún deben definirse y validarse.</p><OptionChecklist label="Restricciones de la solución" options={mockConstraints} selected={constraints} onChange={setConstraints} /></Panel></div>
    <Panel className="solver-panel"><span className="eyebrow"><Icon name="bolt" />Asignación de horarios · Próxima fase</span><h2>Reprogramación de horarios</h2><p>Modelo de asignación horaria pendiente de implementación</p><Button variant="primary" icon="model_training" onClick={() => setNotice(objectives.length === 0 ? 'Selecciona al menos un objetivo para preparar la configuración.' : 'La configuración está preparada. El optimizador de horarios no está implementado: no se ha ejecutado ningún algoritmo de asignación horaria. Dijkstra se ejecuta en la sección Ruta más conveniente.')}>BUSCAR MEJOR SOLUCIÓN</Button>{notice && <Notice>{notice}</Notice>}</Panel>
    <TechnicalDetails title="Ver modelo matemático (Investigación de Operaciones II)" subtitle="Formulación de asignación horaria pendiente; Dijkstra se explica arriba"><div className="technical-placeholder-grid">{['Función objetivo y pesos', 'Variables de decisión', 'Parámetros y restricciones', 'Algoritmo y solver'].map(title => <div key={title}><h3>{title}</h3><p>Pendiente de definición en una fase posterior.</p></div>)}</div><p>No se han adoptado los pesos, la topología ni las afirmaciones de optimalidad del HTML de demostración.</p></TechnicalDetails>
    <Panel className="solution-pending"><div className="section-header"><div><h2><Icon name="pending" />Solución Pendiente de Cálculo</h2><p>Campos del futuro modelo conjunto de rutas y horarios; no son el resultado de Dijkstra.</p></div><StatusBadge>DATO POR CARGAR</StatusBadge></div><div className="solution-metrics"><MetricCard label="Vehículos analizados" icon="local_shipping" note="Flota de carga en circuito" /><MetricCard label="Nuevo horario rec." icon="schedule" note="Horario recomendado" /><MetricCard label="Ruta alterna sugerida" icon="alt_route" note="Ruta asignada" /><MetricCard label="Tiempo viaje est." icon="timer" note="Variación estimada" /><MetricCard label="Vías críticas aliv." icon="check_circle" note="Intersecciones aliviadas" /></div><div className="pending-summary"><h4>Asignación horaria pendiente:</h4><p>Sin horarios calculados. La ruta de menor costo se calcula por separado mediante Dijkstra.</p></div><div className="section-header solution-footer"><span className="small muted"><Icon name="info" />SITRAC Cajamarca · Prototipo de interfaz</span><Button to="/resultados" endIcon="arrow_forward">Ver Comparación Detallada en Resultados</Button></div></Panel>
    </TechnicalDetails>
  </div>;
}
