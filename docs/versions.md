# Registro de Versiones (Changelog) - Bitxels Grid

Todos los cambios notables de este proyecto están documentados en este archivo siguiendo el estándar [Semantic Versioning](https://semver.org/).

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
