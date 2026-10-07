# Registro de Versiones (Changelog) - BitGrid Pro

Todos los cambios notables de este proyecto están documentados en este archivo siguiendo el estándar [Semantic Versioning](https://semver.org/).

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
