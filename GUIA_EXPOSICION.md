# Guía de exposición — SITRAC Cajamarca

Demostración académica de aproximadamente 2 minutos. Abre la aplicación antes de comenzar; el mapa base necesita Internet. No recargues durante la demostración: los cálculos se conservan en memoria mientras navegas.

## 1. Problema

**00:00–00:20 · Inicio**

«SITRAC estudia cómo elegir un recorrido para un vehículo de carga en Cajamarca. Si una calle deja de estar disponible, el recorrido inicial puede dejar de servir. Queremos comparar las alternativas y elegir una que pueda recorrerse.»

## 2. Qué técnica usamos

**00:20–00:40**

«Usamos Dijkstra, una técnica de ruta más corta de Investigación de Operaciones. Compara el costo de las alternativas entre un origen y un destino. En nuestro ejemplo, el costo considera la distancia y la congestión; una vía bloqueada queda fuera de la búsqueda.»

## 3. Demostración

**00:40–01:20 · Simulación**

1. En Inicio pulsa **MODO EXPOSICIÓN**. Se abre Simulación con el ejemplo cargado y las condiciones normales.
2. En el paso 1 señala **Origen** y **Destino**: Ingreso sur → Entrega en el centro. Pulsa **SIGUIENTE**.
3. En el paso 2 pulsa **CALCULAR MEJOR RUTA**. Se dibuja la ruta azul: **2.31 km**, costo **2,310**. Pulsa **SIGUIENTE**.
4. En el paso 3 activa **Cerrar una vía**. Deja seleccionada **Jr. Comercio · conexión de ejemplo**.
5. Pulsa **RECALCULAR RUTA** y después **SIGUIENTE**. Se abre Resultados, paso 4.
6. Pulsa **Antes** y **Después**. Señala la ruta inicial y el desvío occidental de la nueva ruta: **2.54 km**, costo **2,540**.

«Primero calculamos en condiciones normales. Ahora cerramos una vía utilizada en ese recorrido. Al recalcular, SITRAC encuentra otra alternativa disponible.»

También se puede demostrar sin guía: **CARGAR EJEMPLO → CALCULAR MEJOR RUTA → Cerrar una vía → RECALCULAR RUTA → Ver comparación**. El menú Resultados conserva los mismos dos cálculos.

## 4. Qué ocurre

**01:20–01:45 · Resultados**

«La ruta inicial pasaba por Jr. Comercio. Después del cierre, Dijkstra evita esa conexión y utiliza la alternativa occidental. El recorrido ahora es más largo, pero tiene el menor costo entre las opciones que siguen disponibles. El costo no es dinero ni minutos. La explicación procede de los cálculos, no de inteligencia artificial.»

La ruta inicial queda guardada; no se sobrescribe al cerrar una vía. Cambiar un cierre exige pulsar **RECALCULAR RUTA** otra vez. Cambiar origen o destino inicia una comparación nueva.

## 5. Conclusión

**01:45–02:00**

«Investigación de Operaciones nos ayuda a comparar alternativas y justificar una decisión. Aquí demostramos una ruta de menor costo bajo una condición concreta. Los datos operativos son DEMO ACADÉMICO; todavía no validamos recorridos reales, tráfico ni horarios óptimos.»

Para repetir: **Reiniciar demostración**. Para recuperar el menú completo: **Salir del modo exposición**.

## Preguntas posibles del profesor

- **¿Por qué utilizaron Dijkstra?** Porque buscamos una ruta de costo mínimo entre dos puntos y todos los costos son no negativos. Es adecuado para nuestra red académica pequeña.
- **¿Qué optimiza?** La suma de los costos de las vías del recorrido. No optimiza simultáneamente horarios, flotas ni la congestión de toda la ciudad.
- **¿Qué representa el costo?** Distancia en metros multiplicada por un factor de congestión. Se expresa en metros ponderados, no en soles ni en tiempo.
- **¿Qué ocurre si una vía se bloquea?** Se excluye de las alternativas. Dijkstra se ejecuta otra vez; encuentra otro recorrido o informa que no hay ruta disponible.
- **¿Los datos son reales?** El mapa base es geográfico, de OpenStreetMap. La red utilizada por el cálculo, sus distancias, condiciones y conexiones son DEMO ACADÉMICO.
- **¿Cuál es la limitación actual del proyecto?** La red es pequeña y aproximada; supone conexiones bidireccionales. No valida sentidos reales, permisos para carga ni tráfico. No calcula horarios ni tiempos de viaje.
- **¿La nueva ruta siempre tiene un costo menor que la inicial?** No. Al cerrar una vía se reducen las opciones; la mejor alternativa disponible puede tener un costo mayor que el recorrido original.
- **¿Se consultan rutas externas o se utiliza IA?** No. Dijkstra calcula localmente y la explicación compara sus resultados. OpenStreetMap aporta solamente el mapa base.
- **¿Dónde se ve la fórmula?** En **¿Quieres saber cómo funciona?**. Los controles avanzados y la representación técnica permanecen dentro de **Ver detalles técnicos**.

## DecisiÃ³n secuencial: horario + ruta

Â«Nuestro problema tiene dos decisiones. Primero necesitamos saber cuÃ¡ndo
conviene que el vehÃ­culo pesado circule. Para eso utilizamos ProgramaciÃ³n
Entera Binaria: asignamos una franja respetando llegada, ventana y capacidad.
DespuÃ©s necesitamos saber por dÃ³nde debe circular, y para eso utilizamos
Dijkstra. El horario seleccionado determina los factores de congestiÃ³n que
recibe la red.Â»

La ProgramaciÃ³n Entera responde **cuÃ¡ndo** y Dijkstra responde **por dÃ³nde**.
Las horas 07:00â€“08:00, 12:00â€“13:00 y 18:00â€“19:00 son referencias
acadÃ©micas, no una regla general para todas las calles. Los factores del
planificador son `DEMO_MODEL_PARAMETERS` y no mediciones oficiales.

### Preguntas nuevas

- **Â¿Por quÃ© usan dos tÃ©cnicas?** Porque el horario y la ruta son decisiones distintas que se encadenan.
- **Â¿QuÃ© resuelve la ProgramaciÃ³n Entera?** Asigna una franja factible minimizando congestiÃ³n y espera.
- **Â¿QuÃ© resuelve Dijkstra?** Encuentra la ruta disponible de menor costo para el horario elegido.
- **Â¿Por quÃ© no prohÃ­ben camiones en hora punta?** El modelo busca una asignaciÃ³n factible; no convierte una referencia acadÃ©mica en una prohibiciÃ³n general.
- **Â¿Los camiones son la principal causa del trÃ¡fico?** No se afirma; el proyecto solo analiza su posible contribuciÃ³n.
- **Â¿QuÃ© ocurre si no existe horario factible?** Se informa que el modelo es infactible y no se calcula una ruta horaria.

## GUION DE VIDEO DEMOSTRATIVO

Duración: aproximadamente **80 segundos**. Graba la pantalla; no hace falta mostrar los detalles técnicos. Prepara la aplicación en Inicio.

### 00:00 – 00:10

**Pantalla:** Inicio.

**Acción:** Señala el nombre SITRAC y pulsa **MODO EXPOSICIÓN**.

**Narración:** «SITRAC demuestra cómo elegir una ruta de carga en Cajamarca y cómo cambiarla cuando una vía se bloquea. Usaremos datos académicos.»

### 00:10 – 00:25

**Pantalla:** Simulación, paso 1 y paso 2.

**Acción:** Señala Origen y Destino. Pulsa **SIGUIENTE** y **CALCULAR MEJOR RUTA**.

**Narración:** «El ejemplo ya tiene un origen y un destino. Dijkstra compara las alternativas y calcula la ruta de menor costo. En condiciones normales, el recorrido mide 2.31 kilómetros.»

### 00:25 – 00:45

**Pantalla:** Simulación, paso 3.

**Acción:** Pulsa **SIGUIENTE**, activa **Cerrar una vía** y conserva Jr. Comercio. Pulsa **RECALCULAR RUTA**.

**Narración:** «Ahora cerramos una vía utilizada por la ruta inicial. El cierre aparece en rojo. Al recalcular, SITRAC excluye esa vía y encuentra otro recorrido disponible.»

### 00:45 – 01:05

**Pantalla:** Resultados, paso 4.

**Acción:** Pulsa **SIGUIENTE**. Alterna **Antes** y **Después**; señala las tarjetas Ruta inicial y Nueva ruta.

**Narración:** «Antes, la ruta cruzaba Jr. Comercio. Después utiliza la alternativa occidental y mide 2.54 kilómetros. Cuesta más que la original, pero es la opción de menor costo entre las vías que siguen disponibles.»

### 01:05 – 01:20

**Pantalla:** Resultados, explicación del cambio.

**Acción:** Señala **¿Por qué cambió?**; muestra brevemente **¿Qué técnica utiliza SITRAC?**.

**Narración:** «Esto es Investigación de Operaciones: comparar alternativas y justificar una decisión con un cálculo. La red es de demostración. El proyecto todavía no calcula tráfico real ni horarios óptimos.»
