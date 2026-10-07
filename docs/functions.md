# Documentación de Funciones y Alcance Técnico - BitGrid Pro

Esta guía detalla exhaustivamente cada una de las funciones implementadas y operativas en **BitGrid Pro**, su propósito técnico, parámetros de entrada, valores de retorno y su alcance dentro de Adobe Illustrator.

---

## Índice
1. [Backend ExtendScript (hostScript.jsx)](#1-backend-extendscript-hostscriptjsx)
   - [ping()](#ping)
   - [generateSquareGrid(paramsJson)](#generatesquaregridparamsjson)
   - [generateIsometricGrid(paramsJson)](#generateisometricgridparamsjson)
   - [generateGoldenCircles(paramsJson)](#generategoldencirclesparamsjson)
   - [generateHexagonalGrid(paramsJson)](#generatehexagonalgridparamsjson)
   - [clearGridLayer(layerName)](#cleargridlayerlayername)
   - [Funciones Auxiliares Internas](#funciones-auxiliares-internas)
2. [Frontend Controller (client/js/main.js)](#2-frontend-controller-clientjsmainjs)
   - [init()](#init)
   - [executeGeneration(asGuides)](#executegenerationasguides)
   - [setSegment(seg)](#setsegmentseg)
   - [setStatus(msg, isSuccess)](#setstatusmsg-issuccess)
3. [Matriz de Parámetros y Alcance de Controles](#3-matriz-de-parámetros-y-alcance-de-controles)

---

## 1. Backend ExtendScript (hostScript.jsx)

El motor de backend opera dentro del espacio de nombres aislado `GridItHost` para evitar colisiones en el contexto global de Illustrator.

### `ping()`
- **Propósito:** Valida el estado de la aplicación y verifica si el usuario tiene al menos un documento abierto en Illustrator.
- **Parámetros:** Ninguno.
- **Retorno (JSON):**
  ```json
  // Si hay documento:
  {
    "success": true,
    "hasDocument": true,
    "documentName": "Logotipo_Brand.ai",
    "artboardsCount": 2
  }
  // Si no hay documento:
  {
    "success": false,
    "hasDocument": false,
    "message": "No hay ningún documento abierto en Illustrator."
  }
  ```
- **Alcance:** Operación de solo lectura. Se invoca automáticamente al cargar el panel y no realiza ninguna modificación en el documento.

---

### `generateSquareGrid(paramsJson)`
- **Propósito:** Construye una cuadrícula ortogonal (cartesiana) basada en los límites especificados y los parámetros geométricos del usuario.
- **Parámetros (`paramsJson` - Objeto serializado en JSON):**
  | Campo | Tipo | Valor Predeterminado | Descripción |
  | :--- | :---: | :---: | :--- |
  | `spacing` | `Number` | `50` | Espaciado o paso en puntos tipográficos (pt) entre cada línea. |
  | `cols` | `Number` | `12` | Cantidad de columnas (relevante cuando el target es `custom`). |
  | `rows` | `Number` | `12` | Cantidad de filas (relevante cuando el target es `custom`). |
  | `targetScope` | `String` | `"artboard"` | Alcance: `"artboard"` (mesa de trabajo), `"selection"` (objeto seleccionado) o `"custom"` (matriz centrada). |
  | `makeGuides` | `Boolean` | `true` | Si es `true`, convierte los trazados en guías nativas de Illustrator (`pathItem.guides = true`). |
  | `diagonals` | `Boolean` | `false` | Si es `true`, genera diagonales a 45° y 135° de vértice a vértice. |
  | `clearPrevious`| `Boolean` | `true` | Si es `true`, purga los elementos anteriores de la capa de destino. |
  | `groupResult` | `Boolean` | `true` | Si es `true`, agrupa todos los trazos generados dentro de un `GroupItem` nombrado semánticamente en Illustrator. |
  | `layerName` | `String` | `"BitGrid_Custom_Layer"`| Nombre de la capa dedicada donde se alojarán los trazados. |
  | `strokeWidth` | `Number` | `0.5` | Grosor del trazo en puntos tipográficos (`0.1 pt` a `5.0 pt`) al usar **Generar**. |
  | `strokeColor` | `String` | `"#10B981"` | Color hexadecimal del trazo (`#00C8FF`, `#FF007F`, etc. o color libre del picker) al usar **Generar**. |

- **Retorno (JSON):**
  ```json
  {
    "success": true,
    "type": "Cuadrada",
    "elementsCount": 36,
    "layerName": "BitGrid_Custom_Layer",
    "message": "Se generaron 36 guías cuadradas con éxito."
  }
  ```
- **Alcance:**
  - Crea o reutiliza la capa `BitGrid_Custom_Layer`.
  - Dibuja líneas verticales desde `left` hasta `right` con incremento de `spacing`.
  - Dibuja líneas horizontales desde `top` hasta `bottom` con decremento de `spacing`.
  - Traza diagonales opcionales.
  - Ejecuta un refresco final único con `app.redraw()` para optimizar el rendimiento.

---

### `generateIsometricGrid(paramsJson)`
- **Propósito:** Genera una retícula triaxial axonométrica con inclinación a 30° respecto a la horizontal (ejes a 30°, 90° y 150°).
- **Parámetros:** Idénticos a `generateSquareGrid`.
- **Lógica Matemática:**
  1. **Eje Vertical (90°):** Líneas verticales perpendiculares con paso igual a `spacing`.
  2. **Eje Ascendente (+30°):** Calcula la pendiente mediante $	an(30^circ) approx 0.57735$. Calcula el desplazamiento vertical $Delta y = 2 cdot 	ext{spacing} cdot 	an(30^circ)$ y cubre todo el ancho y alto del contenedor.
  3. **Eje Descendente (-30°):** Líneas simétricas con pendiente negativa $-	an(30^circ)$ para cerrar el triángulo equilátero isométrico.
- **Retorno (JSON):**
  ```json
  {
    "success": true,
    "type": "Isométrica",
    "elementsCount": 54,
    "layerName": "BitGrid_Custom_Layer",
    "message": "Malla isométrica generada con éxito (54 ejes triaxiales)."
  }
  ```
- **Alcance:** Cobertura matemática exacta sin dejar huecos en los extremos de la mesa de trabajo o área seleccionada.

---

### `generateGoldenCircles(paramsJson)`
- **Propósito:** Genera un paquete de círculos concéntricos escalados siguiendo la progresión de la sucesión de Fibonacci y proporción áurea ($phi approx 1.618$).
- **Parámetros:** Recibe `baseUnit` (`spacing`), `targetScope`, `makeGuides`, `clearPrevious`, `layerName`.
- **Lógica Matemática:**
  - Aplica los pasos de Fibonacci: $[1, 2, 3, 5, 8, 13, 21, 34]$.
  - Calcula el radio para cada paso: $	ext{radio} = rac{	ext{Fib} cdot 	ext{baseUnit}}{2}$.
  - Crea elipses concéntricas perfectamente centradas en las coordenadas del centro del área de destino:
    ```javascript
    targetLayer.pathItems.ellipse(centerY + radius, centerX - radius, diameter, diameter);
    ```
  - Añade dos ejes en cruz (horizontal y vertical) para alineación milimétrica del isotipo.
- **Retorno (JSON):**
  ```json
  {
    "success": true,
    "type": "Razón Áurea",
    "elementsCount": 10,
    "layerName": "BitGrid_Custom_Layer",
    "message": "Círculos áureos y cruz de construcción generados (10 elementos)."
  }
  ```
- **Alcance:** Ideal para el trazado de isotipos basados en arcos tangentes y radios armónicos.

---

### `clearGridLayer(layerName)`
- **Propósito:** Elimina por completo la capa dedicada de guías para reiniciar el espacio de trabajo con un solo clic.
- **Parámetros:** `layerName` (por defecto `"BitGrid_Custom_Layer"`).
- **Retorno (JSON):**
  ```json
  {
    "success": true,
    "message": "Capa 'BitGrid_Custom_Layer' eliminada correctamente."
  }
  ```
- **Alcance:** Localiza la capa por su nombre y la remueve del DOM de Illustrator; no afecta ninguna otra capa del documento.

---

### Funciones Auxiliares Internas
1. **`getActiveDocument()`:** Retorna `app.activeDocument` o `null` si `app.documents.length === 0`.
2. **`getOrCreateLayer(doc, layerName)`:** Localiza la capa por nombre. Si no existe, crea una nueva capa en el nivel superior y la desbloquea. No borra elementos indiscriminadamente.
3. **`clearTargetScopeItems(layer, targetScope, doc, clearPrev)`:** Aísla el borrado de guías o retículas previas al ámbito de la mesa de trabajo activa (`artboardRect`) o a la selección activa. Protege y conserva intactos los trazados generados en todas las demás mesas de trabajo del documento.
4. **`clipLineToRect(x0, y0, x1, y1, xmin, ymin, xmax, ymax)`:** Implementación del algoritmo bidimensional **Cohen-Sutherland** para recortar milimétricamente cualquier segmento diagonal a 30° contra los 4 bordes del lienzo (`left`, `right`, `bottom`, `top`), impidiendo que las líneas se proyecten fuera de la mesa de trabajo.
5. **`getTargetBounds(doc, targetScope, cols, rows, spacing)`:** Calcula el rectángulo delimitador `[left, top, right, bottom]` en el sistema de coordenadas de Illustrator (donde $top > bottom$):
   - `"artboard"`: Obtiene los límites de la mesa de trabajo activa.
   - `"selection"`: Calcula la caja de unión envolvente (`visibleBounds`) de todos los objetos actualmente seleccionados.
   - `"custom"`: Centra una matriz de dimensiones $\text{cols} \cdot \text{spacing} \times \text{rows} \cdot \text{spacing}$ en el centro de la mesa de trabajo.
6. **`parseHexToRgb(hexStr)`:** Transforma cadenas de color hexadecimal (`#RRGGBB`) en objetos nativos `RGBColor` para colorear las retículas en Illustrator.
7. **`applyPathStyle(pathItem, isGuide, strokeW, strokeColorHex)`:** Aplica `pathItem.guides = true` o configura un trazado visible con grosor (`strokeWidth`) y color (`strokeColor`) personalizados según los controles de la extensión.

---

## 2. Frontend Controller (client/js/main.js)

### `init()`
- **Propósito:** Inicializa el panel, enlaza los eventos del DOM y establece la comunicación con el host de Illustrator.
- **Resiliencia CEF:** Comprueba si `document.readyState === "loading"`; si el documento ya está cargado (`"interactive"` o `"complete"`), se ejecuta de inmediato sin esperar eventos tardíos de Chromium CEF.
- **Ping Inicial:** Ejecuta `GridItHost.ping()` para actualizar el punto de conexión (verde/rojo) y mostrar el nombre del documento activo.

---

### `executeGeneration(asGuides)`
- **Propósito:** Recolecta todos los valores de los controles de la interfaz, empaqueta el payload JSON y despacha la llamada correspondiente a ExtendScript mediante `CSInterface.evalScript()`.
- **Parámetro `asGuides`:**
  - `true` (invocado desde el botón **Hacer Guías**): Genera guías nativas de Illustrator.
  - `false` (invocado desde el botón **Generar**): Genera trazados vectoriales visibles convencionales.
- **Mapeo de Métodos:**
  - Si `currentType === "square"` $ightarrow$ `GridItHost.generateSquareGrid`
  - Si `currentType === "isometric"` $ightarrow$ `GridItHost.generateIsometricGrid`
  - Si `currentType === "golden"` $ightarrow$ `GridItHost.generateGoldenCircles`
  - Si `currentType === "hexagon"` $ightarrow$ Enrutado a base triaxial isométrica.

---

### `setSegment(seg)`
- **Propósito:** Conmuta visualmente entre los segmentos de la interfaz (`"base"`, `"construction"`, `"clearspace"`), mostrando y ocultando las vistas respectivas del panel.
- **Alcance:** Controla el estado visual de la píldora superior.

---

### `setStatus(msg, isSuccess)`
- **Propósito:** Proporciona retroalimentación visual al usuario en la barra inferior del panel.
- **Parámetros:**
  - `msg` (`String`): Mensaje a mostrar.
  - `isSuccess` (`Boolean`): Conmuta la clase CSS del punto de estado entre verde (éxito) y rojo (error).

---

## 3. Matriz de Parámetros y Alcance de Controles

| Control en Pantalla | Selector / ID | Rango de Valores | Acción en Illustrator |
| :--- | :--- | :---: | :--- |
| **Tipo Cuadrada** | `#card-square` | Activo / Inactivo | Genera retícula ortogonal cartesiana. |
| **Tipo Isométrica** | `#card-isometric` | Activo / Inactivo | Genera retícula triaxial con ejes a 30°/60°. |
| **Tipo Razón Áurea** | `#card-golden` | Activo / Inactivo | Genera elipses de Fibonacci y cruz central. |
| **Slider Espaciado** | `#slider-spacing` | `10 pt` a `250 pt` | Define la distancia entre cada línea de la cuadrícula o radio base. |
| **Columnas y Filas** | `#input-cols`, `#input-rows` | `1` a `100` | Define el tamaño de la matriz cuando el ámbito es centrado. |
| **Área de Destino** | `#select-scope` | `artboard`, `selection`, `custom` | Determina dónde se acotan las guías generadas. |
| **Diagonales 45°** | `#toggle-diagonals` | `true` / `false` | Agrega diagonales cruzadas de esquina a esquina. |
| **Reemplazar previas** | `#toggle-clear-prev` | `true` / `false` | Limpia la capa previa antes de generar las nuevas guías. |
| **Agrupar resultado** | `#toggle-group-result` | `true` / `false` | Encapsula las líneas generadas en un grupo nombrado (`BitGrid_Cuadrada_50pt`, etc.) o las deja sueltas. |
| **Grosor de Trazo** | `#slider-stroke-width` | `0.1 pt` a `5.0 pt` | Grosor vectorial físico de los trazos al usar **Generar**. |
| **Color de Trazo** | `.swatch-btn`, `#input-custom-color` | Valores Hexadecimales | Color RGB físico exacto del trazo vectorial al usar **Generar**. |
| **Hacer Guías** | `#btn-make-guides` | Botón | Ejecuta con `pathItem.guides = true` (guías nativas cian). |
| **Generar** | `#btn-generate` | Botón | Ejecuta con `pathItem.guides = false` (trazados estándar). |
| **Reiniciar** | `#btn-reset` | Botón | Restablece todos los sliders y controles a los valores por defecto. |
