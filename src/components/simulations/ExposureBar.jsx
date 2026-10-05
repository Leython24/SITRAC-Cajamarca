import { useNavigate } from 'react-router-dom';
import { useRouting } from '../../app/routingState';
import Button from '../ui/Button';

const explanations = [
  'Selecciona el vehículo de carga que vamos a planificar.',
  'La procedencia identifica de dónde viene; el viaje interurbano no lo calcula Dijkstra.',
  'El marcador verde señala dónde comienza el recorrido urbano.',
  'Programación Entera elige una franja factible de menor costo. Pulsa RECOMENDAR HORARIO.',
  'Selecciona un destino o elígelo sobre una vía del mapa.',
  'Dijkstra utiliza las condiciones de esa franja. Pulsa CALCULAR RUTA.',
  'Explora la línea azul y el recorrido: cada tramo identifica una calle seleccionada.',
  'Abre Cierre en Óvalo Musical y selecciona un acceso real de la red.',
  'La calle seleccionada ya aparece roja: el cierre está listo para aplicarse.',
  'Pulsa RECALCULAR RUTA. Dijkstra excluirá las conexiones cerradas.',
  'Gris: ruta anterior. Rojo: cierre. Azul: nueva ruta, si queda una alternativa disponible.',
  'Compara el horario y el recorrido. Explica qué decidió cada técnica y qué cambió.',
];
export default function ExposureBar() {
  const { exposure, setExposure, demo, schedule, resetDemo } = useRouting();
  const navigate = useNavigate();
  if (!exposure.enabled) return null;
  const { step } = exposure;
  const nextDisabled = step === 12 || step === 4 && schedule.result?.status !== 'optimal' || step === 6 && !demo.initial || [8, 9].includes(step) && !demo.condition || [10, 11].includes(step) && !demo.updated;
  const explanation = demo.condition?.type === 'congestion' && [9, 10, 11].includes(step)
    ? { 9: 'La calle aparece naranja: sigue disponible, con un mayor costo DEMO.', 10: 'Pulsa RECALCULAR RUTA. Dijkstra comparará distancia × factor de congestión.', 11: 'Gris: ruta anterior. Naranja: vía congestionada. Azul: ruta de menor costo disponible.' }[step]
    : explanations[step - 1];
  const move = value => { setExposure({ enabled: true, step: value }); navigate(value === 12 ? '/resultados' : '/planificar-viaje'); };
  return <section className="exposure-bar" aria-label="Guía del modo exposición"><div aria-live="polite"><strong>Paso {step} de 12</strong><p>{explanation}</p></div><div className="exposure-buttons">
    <Button disabled={step === 1} onClick={() => move(step - 1)}>Anterior</Button><Button variant="primary" disabled={nextDisabled} onClick={() => move(step + 1)}>SIGUIENTE</Button>
    <Button onClick={() => { resetDemo(); navigate('/planificar-viaje'); }}>Reiniciar demostración</Button><button className="text-button" onClick={() => setExposure({ enabled: false, step })}>Salir del modo exposición</button>
  </div></section>;
}
