import { useNavigate } from 'react-router-dom';
import { useRouting } from '../../app/routingState';
import Button from '../ui/Button';

export default function DemoActions() {
  const { resetDemo, setExposure, exposure } = useRouting();
  const navigate = useNavigate();
  return <div className="demo-actions">
    <Button icon="restart_alt" onClick={() => { resetDemo(); navigate('/planificar-viaje'); }}>CARGAR EJEMPLO</Button>
    {!exposure.enabled && <Button icon="slideshow" onClick={() => { resetDemo(); setExposure({ enabled: true, step: 1 }); navigate('/planificar-viaje'); }}>MODO EXPOSICIÓN</Button>}
  </div>;
}
