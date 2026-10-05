# SITRAC Cajamarca

Prototipo React de apoyo a decisiones sobre movilidad y transporte de carga.
Esta entrega implementa la interfaz, un mapa OpenStreetMap con Leaflet y Dijkstra
para calcular rutas sobre una red de demostración académica.

## Ejecutar

Requiere Node.js compatible con Vite (desarrollo verificado con Node 24).

```sh
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://127.0.0.1:5173`.

```sh
npm run build
npm test
```

Las seis rutas son `/inicio`, `/mapa`, `/transporte-carga`, `/simulaciones`,
`/buscar-solucion` y `/resultados`; `/` redirige a Inicio.

## Mapa y datos

- `src/components/map/SitracMap.jsx`: mapa común, zoom, desplazamiento,
  selección de tramos, puntos, marcadores y ventanas de información.
- `src/data/mapConfig.js`: centro en Cajamarca, zoom y proveedor de mapa base.
- `src/data/mock/geography.js`: ruta original **DEMO**, posiciones ficticias de
  vehículos y punto de entrega. Ya no contiene una propuesta fija.
- `src/data/mock/roadNetwork.js`: 12 nodos y 13 conexiones **DEMO ACADÉMICO**.
- `src/data/mock/traffic.js` y `vehicles.js`: leyenda y registros ficticios.
- `src/data/mock/results.js`: indicadores pendientes, sin valores calculados.
- `src/styles/tokens.css` y `map.css`: identidad visual y estilos del mapa.

En Mapa se pueden activar las capas de tráfico, vehículos, ruta actual y ruta
propuesta. Selecciona un tramo coloreado para ver el panel de vía. Selecciona
un camión para consultar identificador, origen, destino, llegada y estado.
Los controles +, − y centrar permiten explorar la ciudad. También admite
arrastre, teclado, doble clic y zoom con rueda en el mapa principal.

La experiencia principal está en **Simulaciones**: **CARGAR EJEMPLO**, **CALCULAR
MEJOR RUTA**, **Cerrar una vía** y **RECALCULAR RUTA**. La comparación conserva
la ejecución inicial y la nueva ejecución; **Antes / Después** muestra esas dos
rutas calculadas, con distancia en km, costo y explicación del cambio. Cambiar
origen o destino invalida la comparación. Los cierres no recalculan hasta pulsar
el botón. El mapa de la demostración muestra origen, destino, ruta y cierre.

**MODO EXPOSICIÓN** carga el ejemplo y ofrece cuatro pasos con elementos
resaltados, Anterior/Siguiente, salida y reinicio. Su menú contiene solamente
Inicio, Simulación y Resultados. La [guía de exposición](GUIA_EXPOSICION.md)
incluye un guion de 2 minutos, preguntas del profesor y un guion de video de
80 segundos. Los controles anteriores siguen dentro de **Ver detalles técnicos**.
Su comparación avanzada conserva la referencia manual DEMO para los puntos
predeterminados, separada de la comparación guiada.

El mapa geográfico base es OpenStreetMap. Los trazados operativos son aproximados:
no se ajustan automáticamente a las calles, no validan sentidos de circulación,
no representan ubicaciones GPS ni son instrucciones de navegación. Los nombres
de las vías son etiquetas de ejemplo; su geometría definitiva requiere validación.

Las imágenes del mapa requieren Internet. Se conserva la atribución visible,
se utiliza la caché normal del navegador y se solicitan únicamente las teselas
del área visible. No hay descarga offline ni precarga masiva. Consultar la
[política de teselas de OSM](https://operations.osmfoundation.org/policies/tiles/).
La integración sigue la [documentación de React Leaflet](https://react-leaflet.js.org/docs/api-map/).

## Técnica INVOPE implementada

**Modelo de redes — Ruta más corta mediante Dijkstra**

Encuentra el recorrido de menor costo dentro de la red académica. El algoritmo
es una función independiente de React en `src/optimization/graph/dijkstra.js`.
Recibe grafo, nodo origen, nodo destino y condiciones; entrega secuencia de
nodos y tramos, distancia total, costo total y coordenadas. Si no hay conexión,
devuelve `unreachable` con listas vacías y totales nulos, retirando la propuesta.
Origen igual a destino devuelve una ruta sin tramos y costo cero.

`buildGraph.js` valida la red y excluye conexiones bloqueadas de la adyacencia.
`costFunctions.js` resuelve los costos; `costConfig.js` centraliza los supuestos:

```text
Costo del tramo = distancia en metros × factor de congestión
Tráfico bajo: 1.0 | Moderado: 1.2 | Alto: 1.5 | Congestión: 2.0
Bloqueado: no disponible (no participa en la búsqueda).
```

El costo se expresa en **metros ponderados**, no en minutos ni dinero. Las
distancias son entradas asumidas, no mediciones ni distancias obtenidas de OSM.
Cada +10% de tráfico sube un nivel las vías del corredor principal, hasta
congestión; las alternativas suben un nivel a +30%. Los umbrales también están
en la configuración. El ajuste manual sustituye el nivel del escenario; luego
el accidente impone congestión y la reducción de carril al menos tráfico alto
sobre el tramo seleccionado. El cierre excluye ese tramo.

Todas las conexiones de esta red se suponen bidireccionales. No se importó una
red real de OSM. No hay ajuste a calles, permisos de carga ni cálculo de tiempos.
El algoritmo usa costos no negativos, una selección determinista ante empates
y complejidad O(V² + E), suficiente para esta red pequeña. No requiere solver
ni nuevas librerías de optimización.

La configuración y el resultado se comparten en memoria mediante
`src/app/RoutingContext.jsx`. En los controles avanzados, después del primer cálculo, los cambios de origen,
destino, tráfico o bloqueos recalculan automáticamente. En la demostración guiada,
los dos cálculos se guardan al pulsar sus respectivos botones. Las ventanas horarias y
la cantidad adicional de vehículos no afectan Dijkstra ni generan horarios.

### Prueba avanzada reproducible

Abre **Ver detalles técnicos** en Simulaciones para acceder a estos controles.
Para exponer, utiliza el flujo guiado descrito arriba y en GUIA_EXPOSICION.md.

1. En Simulaciones, pulsa **Condiciones normales** y **CALCULAR RUTA**.
   Con los puntos predeterminados: 2,310 m de distancia y 2,310 de costo.
2. Activa **Cerrar una vía** sobre Jr. Comercio: el cálculo usa la alternativa
   occidental, con 2,540 m y costo 2,540. El tramo bloqueado queda fuera.
3. Vuelve a **Condiciones normales** y cambia **Congestión del tramo** a
   **Congestión** sobre Jr. Comercio: también elige la alternativa occidental.
4. Restablece condiciones normales y selecciona **+30%** de tráfico: usa el
   corredor oriental, con 3,100 m de distancia y 3,720 de costo ponderado.
5. Consulta **Resultados → Antes / Después** y **Ver cómo funciona Dijkstra**.
6. Para demostrar ausencia de ruta, bloquea Av. Atahualpa sur y Vía de
   Evitamiento Sur desde el selector de tramos: ambas salidas del origen quedan
   cerradas y la propuesta desaparece. El botón Condiciones normales las libera.

Las explicaciones se generan comparando el cálculo actual con el recorrido de
condiciones normales del mismo grafo, sin respuestas aleatorias. Las pruebas
verifican mínimo costo, bloqueos, congestión, ausencia de ruta, determinismo,
casos límite y la integración con escenarios, navegación y Antes/Después.

## Arquitectura y límites

`src/app/` contiene rutas; `src/layouts/` el marco común;
`src/pages/` las seis pantallas; `src/components/` los elementos reutilizables;
`src/data/mock/` los ejemplos. El ZIP original permanece en `design-reference/`
como referencia. Los SVG de Stitch ya no se utilizan en la aplicación.

Los filtros y comparaciones usan estado local. El escenario activo y su ruta
se mantienen al navegar; se pierden al recargar. La lista de escenarios guardados
en Simulaciones sigue siendo temporal y se pierde al salir de esa pantalla.

## PlanificaciÃ³n secuencial DEMO

Simulaciones incluye un planificador acadÃ©mico de horario. Una formulaciÃ³n
binaria `x(i,h)` asigna cada vehÃ­culo a exactamente una franja y respeta
llegada, ventana, capacidad y restricciones activadas manualmente. Para el caso
pequeÃ±o DEMO se usa enumeraciÃ³n exacta de asignaciones factibles; no se
presenta como un solver externo. La funciÃ³n objetivo combina congestiÃ³n y
espera mediante parÃ¡metros identificados como `DEMO_MODEL_PARAMETERS`.

El horario elegido determina los costos de congestiÃ³n que recibe Dijkstra:
**ProgramaciÃ³n Entera decide cuÃ¡ndo â†’ Dijkstra decide por dÃ³nde**. Los
factores y la capacidad son supuestos configurables de demostraciÃ³n, no
mediciones oficiales.

## Fuentes del contexto real

- Municipalidad Provincial de Cajamarca â€” Ordenanza Municipal 905-2024-CMPC.
- Municipalidad Provincial de Cajamarca â€” comunicados de control de carga y descarga de 2024.
- Investigaciones de la Universidad Nacional de Cajamarca sobre capacidad, nivel de servicio y congestiÃ³n vial.
El asistente es un panel visual. SIMULAR aplica las condiciones a Dijkstra;
no ejecuta un modelo de simulación de tráfico. El botón de futura asignación
horaria informa que ese modelo está pendiente. No hay Programación Entera,
asignación automática de horarios, backend, IA, tráfico real, geocodificación,
navegación GPS ni API externa de rutas.

La siguiente fase podrá sustituir los ejemplos por datos validados y resultados
de un modelo, conservando el componente del mapa. Esa fase no se implementa aquí.
