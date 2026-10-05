import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';

export default function HowSitracWorks() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) ref.current.showModal(); }, [open]);
  return <><Button onClick={() => setOpen(true)}>¿Cómo funciona SITRAC?</Button>
    {open && <dialog ref={ref} className="sitrac-how-dialog" aria-labelledby="sitrac-how-title" onClose={() => setOpen(false)} onClick={event => { if (event.target === ref.current) ref.current.close(); }}>
      <div className="section-header"><h2 id="sitrac-how-title">Cómo construimos SITRAC</h2><button aria-label="Cerrar explicación de SITRAC" onClick={() => ref.current.close()}>✕</button></div>
      <h3>1. Datos</h3><p>Vehículos, horarios, congestión y restricciones académicas. OpenStreetMap aporta geometrías y algunos lugares reales; todos los valores operativos siguen siendo DEMO.</p>
      <h3>2. Horarios · ¿Cuándo?</h3><p>Programación Entera asigna una franja factible de menor costo al vehículo. Conceptualmente, x(i,h) = 1 significa que el vehículo i circula en la franja h. Para este caso pequeño se evalúan las asignaciones factibles.</p>
      <h3>3. Red vial</h3><p>Los puntos e intersecciones son nodos; las conexiones entre ellos son tramos de calles. Una vía cerrada deja de estar disponible.</p>
      <h3>4. Ruta · ¿Por dónde?</h3><p>El horario seleccionado determina las condiciones DEMO de congestión. Dijkstra busca la secuencia de calles de menor costo, desde el ingreso urbano hasta el destino. No calcula el viaje desde Lima.</p>
      <h3>5. Visualización · ¿Dónde se muestra?</h3><p>React y Leaflet dibujan las geometrías de los tramos seleccionados sobre OpenStreetMap. Nuestro Dijkstra decide la ruta; el mapa la muestra.</p>
      <div className="io-flow">Vehículo → Llegada + ventana → Programación Entera → Horario recomendado → Condiciones de esa franja → Dijkstra → Ruta recomendada → Leaflet + OpenStreetMap</div>
      <Button onClick={() => ref.current.close()}>Entendido</Button>
    </dialog>}
  </>;
}
