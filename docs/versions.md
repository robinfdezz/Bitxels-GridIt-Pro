# Registro de Versiones (Changelog) - BitGrid Pro

Todos los cambios notables de este proyecto están documentados en este archivo siguiendo el estándar [Semantic Versioning](https://semver.org/).

---

## [v0.4.0] - 2026-10-08
### Módulo de Construcción Vectorial, Componentes UI Personalizados y Optimización Base
- **Módulo de Construcción (Construction Module):**
  - Integrado submódulo completo para ingeniería inversa y documentación de geometría de logotipos.
  - 8 componentes de inspección vectorial: Horizontales, Verticales, Diagonales, Círculos Constructivos, Puntos de Ancla, Manejadores Bezier, Contornos y Cotas.
  - Generación de círculos constructivos basados en curvatura real en puntos de ancla.
  - Manejadores vectoriales independientes con cabezales y líneas guía directas.
  - Soporte de relleno técnico "fantasma" (*Ghost Fill*) con opacidad ajustable independiente.
  - Selector de agrupación por capas separadas o capa técnica unificada.
  - Edición reactiva selectiva por propiedad (`changedProperty`) que permite afinar atributos de un grupo de elementos sin recalcular el resto.
  - Memoria caché local (`localStorage`) para persistir la configuración completa entre sesiones.
- **Componentes UI Reutilizables de Alta Gama:**
  - **Dropdown Personalizado (`.custom-dropdown`):** Eliminación total de menús emergentes nativos del sistema operativo y su resaltado azul predeterminado. Menú flotante 100% CSS en tema oscuro (`#161619`), hover refinado (`#232328`), resplandor esmeralda (`#10B981`) y checkmark de selección activa, con sincronización transparente bidireccional sobre los elementos `<select>`.
  - **Stepper Numérico Universal (`initGlobalNumberInputSteppers`):** Soporte global en todos los inputs numéricos para subir y bajar valores con la ruedita del ratón (`wheel`) y flechas de teclado (`ArrowUp` / `ArrowDown`), con soporte para `Shift` (saltos de 10) y `Alt` (ajuste fino decimal).
  - **Fila Unificada en Personalizar:** Reorganización horizontal con Columnas y Filas a la izquierda y Color de Trazo a la derecha, alineados a nivel superior con tipografía técnica uniforme.
- **Correcciones y Refuerzos de Estabilidad:**
  - Corregido `ReferenceError: opacity no está definido` en las funciones de malla Isométrica, Razón Áurea y Hexagonal en `jsx/hostScript.jsx`.
  - Implementado `GridItHost.hasBaseGrid` para evitar que se dibuje una retícula automáticamente al navegar a la sub-pestaña Personalizar si aún no existe nada generado en el documento.
  - Aislamiento defensivo (`try/catch`) en el bootstrapping de submódulos para garantizar resiliencia total de la interfaz.

---



## [v0.3.0] - 2026-10-07
### Nueva Funcionalidad: Malla Hexagonal Modular (Honeycomb Grid)
- **Frontend Interactivo:**
  - Habilitada la tarjeta **Malla Hexagonal** con icono regular de 6 lados.
  - Bloque dinámico de opciones avanzadas para hexágonos:
    - **Orientación Configurable:** *Vértice Vertical (Pointy-topped, 30°)* vs. *Cara Plana Horizontal (Flat-topped, 0°)*.
    - **Subdivisión Interna:** Toggle para generar 3 radios diametrales que dividen cada celda en 6 triángulos equiláteros.
  - Etiqueta dinámica de slider: adapta a "Radio / Lado (pt)" al seleccionar hexagonal.
  - Integración total con el botón de reinicio y estados de la UI.
- **Backend ExtendScript (`jsx/hostScript.jsx`):**
  - Implementado `GridItHost.generateHexagonalGrid(paramsJson)`.
  - Construcción de polígonos cerrados individuales (`pathItem.closed = true`) para permitir selección directa, relleno de color y uso inmediato con el *Creador de Formas* (*Shape Builder*).
  - Algoritmo de teselación con paso exacto $\Delta x = \sqrt{3} R, \Delta y = 1.5 R$ (Pointy) y $\Delta x = 1.5 R, \Delta y = \sqrt{3} R$ (Flat) sin huecos ni holguras.
  - Soporte completo para *Mesa de trabajo activa*, *Matriz centrada* ($cols \times rows$) y *Selección*.
  - Agrupación automática bajo `BitGrid_Hexagonal_[Orientacion]_MesaX_[R]pt`.
  - Respeto al aislamiento de mesas de trabajo contiguas (`clearTargetScopeItems`).

---

## [v0.2.0] - 2026-10-06
### Homologación Estética Esmeralda, Aislamiento por Mesas y Selector de Color Popover
- **Aislamiento Multimesa (`clearTargetScopeItems`):**
  - La opción "Limpiar anteriores" ahora respeta escrupulosamente los límites espaciales de la mesa activa, evitando borrar retículas en mesas de trabajo vecinas.
- **Malla Isométrica Concurrente Perfecta (Estrella de 6 Puntas):**
  - Geometría triaxial a 30°, 90° y 150° centrada y concurrente. Tres líneas se cruzan en un único punto matemático exacto generando estrellas de 6 puntas perfectas.
  - Recorte estricto por algoritmo Cohen-Sutherland dentro del lienzo o área de selección.
- **Selector de Color Popover 100% In-Plugin:**
  - Popover modal integrado flotando sobre la interfaz oscura de CEP sin ventanas emergentes de OS.
  - Muestreo con cuentagotas nativo de Illustrator (`GridItHost.pickColorFromSelection`).
- **Homologación de Color y UI:**
  - Homologación completa al color de acento esmeralda (`#10B981` / `#34D399`), reemplazando rastros azules.
  - Eliminación de sombras en botones para estilo plano moderno.
  - Geometría consistente de esquinas redondeadas rectangulares (`border-radius: 3.5px`).

---

## [v0.1.8] - 2026-10-06
### Nueva Funcionalidad: Manipulación de Grosor y Color de Trazo en "Generar"
- **Controles de Estilo de Trazo en Frontend:**
  - Nuevo slider **Grosor de Trazo (pt)**: Rango de `0.1 pt` a `5.0 pt` (por defecto `0.5 pt`) con tirador cuadrado redondeado y lectura numérica en vivo.
  - Paleta interactiva de **Swatches de Color**: Cian, Magenta, Azul Eléctrico, Blanco, Gris, Negro.
  - Selector libre de color personalizado (ícono vectorial SVG) para cualquier valor hexadecimal de marca.
- **Backend ExtendScript (`jsx/hostScript.jsx`):**
  - Parser hexadecimal a RGB (`parseHexToRgb`) integrado en ExtendScript.
  - Inyección dinámica de `strokeWidth` y `strokeColor` en las retículas cuadradas, isométricas y de proporción áurea al usar el botón **Generar**.
- **Documentación:**
  - Registrados parámetros en [docs/functions.md](functions.md), estándares en [docs/design-system.md](design-system.md) y [README.md](../README.md).

---

## [v0.1.7] - 2026-10-06
### Nueva Funcionalidad: Agrupación Paramétrica y Refinamiento UI
- **Backend ExtendScript (`jsx/hostScript.jsx`):**
  - Implementación del parámetro `groupResult` en `generateSquareGrid`, `generateIsometricGrid` y `generateGoldenCircles`.
  - Agrupación automática en Illustrator dentro de un `GroupItem` con nombre semántico (ej. `BitGrid_Cuadrada_50pt`) si el toggle está activo.
- **Frontend & UI:**
  - Nuevo interruptor toggle en el acordeón *Personalizar*: **Agrupar resultado** (activado por defecto).
  - Rediseño del tirador del slider (thumb): cambiado de círculo a **cuadrado con bordes redondeados** (`border-radius: 3.5px`).
  - Rediseño de cabecera: logotipo SVG centrado en la parte superior y texto limpio **BitGrid Pro** debajo sin fondo de píldora.
- **Documentación:**
  - Creado [docs/design-system.md](design-system.md) registrando todos los estándares visuales, decisiones de diseño y tokens para futuras versiones.
  - Actualizado [docs/functions.md](functions.md) con la documentación del parámetro de agrupación.

---

## [v0.1.6] - 2026-10-06
### Nombre Oficial: BitGrid Pro
- **Consolidación de Marca:**
  - Actualización formal del nombre del plugin a **BitGrid Pro** en todo el proyecto: manifiesto de Illustrator (`CSXS/manifest.xml`), menú de extensiones (`Ventana > Extensiones > BitGrid Pro`), encabezado del panel y documentación.
  - Actualización de la capa nativa por defecto en Illustrator a `BitGrid_Custom_Layer`.
  - Distintivo visual en cabecera: Logotipo oficial + insignia `GRID PRO`.

---

## [v0.1.5] - 2026-10-06
### Integración de Identidad "Bitxels Grid" y Filtro de Opacidad al 20%
- **Identidad de Marca:**
  - Renombrado del plugin a **Bitxels Grid** en interfaz, manifiesto ([manifest.xml](../CSXS/manifest.xml)) y metadatos.
  - Integración del logotipo oficial SVG ([bitxels.svg](../client/assets/bitxels.svg)) en la cabecera junto a la insignia `GRID`.
  - Estructuración de la carpeta dedicada de recursos en `client/assets/` y `assets/`.
- **Claridad Visual de Funcionalidades (Opacidad 20%):**
  - Se aplicó `opacity: 0.2; pointer-events: none;` a todos los elementos que forman parte de la hoja de ruta visual pero aún no tienen lógica activa conectada (*Presentaciones*, *Guías de Marca*, *Archivos*, *Ver tutorial*, pestañas *Construcción* y *Área de Reserva*, tarjeta *Hexagonal*, *Ayuda*, *Compartir*).
  - Los componentes activos (*Cuadrada*, *Isométrica*, *Razón Áurea*, sliders, opciones, *Hacer Guías*, *Generar*, *Reiniciar*) permanecen al 100% interactivos y nítidos.

---

## [v0.1.4] - 2026-10-06
### Rediseño Visual Integral (Inspirado en Akrivi Studio)
- **Transformación de la Interfaz:**
  - Nueva estética flotante con tarjeta oscura de bordes redondeados (`#181818`, radio 14px y borde sutil `#282828`).
  - Encabezado con emblema minimalista y sub-navegación horizontal con indicador de línea activa (*Mallas de Logo*, *Presentaciones*, *Guías de Marca*, *Archivos*).
  - Insignia azul de cabecera con botón de acción lateral *Ver tutorial*.
  - Selector segmentado estilo píldora de 3 vías: **Base**, **Construcción** y **Área de Reserva**.
  - Cuadrícula de 4 tarjetas de selección directa (*Cuadrada*, *Isométrica*, *Hexagonal*, *Razón Áurea*) con iconos vectoriales en azul eléctrico.
  - Acordeón colapsable **Personalizar** con controles deslizantes (sliders) ultrafinos y lecturas numéricas en tiempo real.
  - Botones de acción duales destacados:
    - **Hacer Guías**: Botón oscuro estilizado con icono de guías.
    - **Generar**: Botón de firma con degradado azul eléctrico brillante y destello.
  - Pie de tarjeta con enlaces utilitarios: *Reiniciar*, *Ayuda* y *Compartir*.

---

## [v0.1.3] - 2026-10-06
### Internacionalización Completa al Español (i18n)
- **Interfaz de Usuario (Frontend):**
  - Toda la interfaz de usuario en [index.html](../client/index.html) traducida completamente al español.
  - Pestañas: **Mallas**, **Construcción** y **Ajustes**.
  - Tipos de mallas: **Cuadrada** (Matriz Cartesiana), **Isométrica** (Triaxial 30° / 60°) y **Razón Áurea** (Proporción φ 1.618).
  - Formularios y controles: *Espaciado / Paso (pt)*, *Subdivisiones*, *Columnas*, *Filas*, *Área de Aplicación*.
  - Opciones: *Convertir en Guías Nativas (Cian)*, *Incluir Diagonales a 45°*, *Limpiar guías previas de GridIt*.
  - Botón principal de acción: **Generar Guías**.
- **Controlador JavaScript ([main.js](../client/js/main.js)):**
  - Todos los mensajes de estado, notificaciones contextuales y avisos de preajustes localizados al español.
- **Backend ExtendScript ([hostScript.jsx](../jsx/hostScript.jsx)):**
  - Mensajes de retorno JSON traducidos al español (confirmaciones de generación, conteo de ejes y validaciones de documento).
- **Manifiesto ([manifest.xml](../CSXS/manifest.xml)):**
  - Nombre del paquete traducido a *Bitxels Grid - Generador de Mallas y Guías para Logotipos*.

---

## [v0.1.2] - 2026-10-06
### Adaptación y Compatibilidad: Adobe Illustrator 2026 (CEP 11 / 12)
- Ajuste del rango de versión de host a `[26.0, 99.9]` en el manifiesto.
- Habilitación de parámetros avanzados de Chromium CEF (`--enable-nodejs`, `--mixed-context`, `--mixed-content-allowed`, `--allow-file-access-from-files`, `--disable-web-security`).
- Configuración de registro `PlayerDebugMode = "1"` para ramas `CSXS.9` a `CSXS.14`.

---

## [v0.1.1] - 2026-10-06
### Corregido / Estabilidad de UI (Chromium CEF)
- Corrección de pantalla gris/blanca en Chromium CEF con fondo defensivo inline en `<html>` y `<body>`.
- Aislamiento seguro del entorno Node.js para evitar conflictos de librerías.
- Inicialización reactiva con comprobación de `document.readyState`.
- Trazas de depuración exhaustivas en consola.

---

## [v0.1.0-alpha] - 2026-10-06
### Añadido
- Estructura base del proyecto CEP para Adobe Illustrator.
- Motor de cálculo geométrico y generación de capas en ExtendScript.
- Panel inicial en HTML5/CSS3 y archivo de depuración remota `.debug`.
