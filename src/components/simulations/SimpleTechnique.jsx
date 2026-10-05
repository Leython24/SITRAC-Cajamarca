import Panel from '../ui/Panel';

export default function SimpleTechnique() {
  return <Panel className="simple-technique">
    <h2>¿Qué técnica utiliza SITRAC?</h2><h3>Ruta más corta — Algoritmo de Dijkstra</h3>
    <p>Dijkstra compara las diferentes rutas disponibles y selecciona la que tiene menor costo para llegar al destino.</p>
    <p><strong>SITRAC considera:</strong> <span>✓ distancia</span> <span>✓ nivel de congestión</span> <span>✓ vías bloqueadas</span></p>
    <details><summary>¿Quieres saber cómo funciona?</summary><ol>
      <li>Cada intersección es un punto.</li><li>Las calles conectan esos puntos.</li><li>Cada calle tiene un costo.</li><li>Dijkstra compara los costos.</li><li>Selecciona el recorrido de menor costo.</li>
    </ol><p className="small muted">Costo = distancia × factor de congestión</p></details>
  </Panel>;
}
