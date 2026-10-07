# Sistema de Diseño y Pautas Visuales (Design System) - BitGrid Pro

Este documento registra los estándares visuales, decisiones de interfaz de usuario (UI), arquitectura de componentes y convenciones de interacción establecidas en **BitGrid Pro**. Su objetivo es garantizar la máxima coherencia en futuras iteraciones y evitar la reinvención de componentes o estilos.

---

## 1. Regla de Oro: Prohibición Estricta de Emojis
> [!IMPORTANT]
> **PROHIBICIÓN ESTRICTA:** Bajo ninguna circunstancia se deben utilizar emojis Unicode (e.g., 🎨, ✨, ⚙️, 🚀, 💡, etc.) en el marcado HTML, estilos CSS, scripts JS/JSX ni cadenas de texto de la interfaz.
> 
> - **Iconografía Oficial:** Todos los íconos de la interfaz deben ser **gráficos vectoriales SVG nativos**, limpios, optimizados y con atributos de trazado explícitos (`stroke="currentColor"`, `stroke-width`, `stroke-linecap="round"`).
> - **Integración:** Se insertan directamente en el DOM mediante etiquetas `<svg>` con `viewBox="0 0 24 24"` o dimensiones proporcionales para garantizar escalabilidad nítida en pantallas Retina y 4K sin artefactos de renderizado del sistema operativo.

---

## 2. Lenguaje Geométrico: Cuadrados y Rectángulos Redondeados
En BitGrid Pro no se utilizan elementos circulares (`50%` de radio) para micro-controles, selectores ni interruptores. Toda la interfaz comparte una identidad geométrica estructurada de **cuadros redondeados** y **rectángulos redondeados**.

### A. Tiradores de Deslizadores (Slider Thumbs)
- **Forma obligatoria:** **Cuadrado con esquinas redondeadas** (`border-radius: 3.5px`).
- **Dimensiones:** `13px x 13px`.
- **Estilo:** Fondo blanco (`#ffffff`), borde de contraste oscuro (`2px solid #1a1a1a`), sombra suave (`box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6)`).
- **Interacción Hover:** Escala sutil a `1.12` con transición de `0.12s ease`.
- **Pista (Track):** Altura `3px`, esquinas redondeadas `2px`, fondo `#3a3a3a`.

### B. Muestras de Color de Trazo (Color Swatches)
- **Forma obligatoria:** **Cuadritos redondeados** (`border-radius: 3.5px`).
- **Dimensiones:** `15px x 15px`.
- **Borde base:** `1px solid rgba(255, 255, 255, 0.2)`.
- **Estado Activo (`.active`):** Doble anillo de enfoque cuadrado (`box-shadow: 0 0 0 2px #222222, 0 0 0 3.5px var(--green-primary)`).
- **Paleta predefinida:**
  - Cian: `#00C8FF`
  - Magenta: `#FF007F`
  - Azul Eléctrico: `#3B82F6`
  - Blanco Puro: `#FFFFFF`
  - Gris Técnico: `#888888`
  - Negro Carbón: `#1A1A1A`

### C. Selector de Color Personalizado Popover (100% In-Plugin, Dark Theme)
- **Diseño In-Plugin vs. Cuadro del Sistema:**
  - Se prescinde del `<input type="color">` nativo del navegador porque desborda la ventana hacia los paneles de Illustrator (Capas), carece de tema oscuro y bloquea la API de cuentagotas por políticas de sandbox en CEF.
  - Se sustituye por un **popover integrado en el DOM**, confinado dentro del panel de la extensión (`width: 100%`), con estética dark mode (`#1a1a1a`, borde `#2e2e2e`).
- **Componentes del Popover:**
  1. **Plano 2D de Saturación y Brillo:** Gradiente bidimensional interactivo con cursor en cuadrito redondeado (`11px x 11px`, `border-radius: 3px`).
  2. **Barra de Tono (Hue Rainbow):** Deslizador continuo del espectro cromático con tirador en cuadrito redondeado.
  3. **Herramienta Cuentagotas Híbrida:**
     - Si el entorno soporta la API `EyeDropper`, permite muestreo en pantalla.
     - Si la sandbox lo bloquea, se activa el **muestreo nativo de Illustrator vía ExtendScript** (`GridItHost.pickColorFromSelection()`), copiando con precisión matemática el trazo o relleno del objeto actualmente seleccionado en el lienzo de Illustrator (soporta RGB, CMYK y Escala de Grises).
  4. **Entradas sincronizadas:** Campo de código HEX con prefijo numérico (`#10B981`) y 3 entradas numéricas para canales RGB (0-255).
  5. **Geometría:** Botones, campos y tiradores respetan la regla de esquinas redondeadas (`border-radius: 3.5px`).

### D. Interruptores (Toggle Switches)
- **Riel / Pista (Track):**
  - **Forma obligatoria:** **Rectángulo redondeado** (`border-radius: 4px`).
  - Dimensiones: `28px` de ancho por `16px` de alto.
  - Borde: `1px solid rgba(255, 255, 255, 0.08)`.
  - Fondo Inactivo: Carbón `#333333`.
  - Fondo Activo: Verde Esmeralda `var(--green-primary)` (`#10b981`).
- **Perilla Móvil (Thumb / Knob):**
  - **Forma obligatoria:** **Cuadrado redondeado** (`border-radius: 2.5px`).
  - Dimensiones: `10px x 10px`.
  - Posición: Centrada verticalmente a `2px` de los bordes.
  - Sombra: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5)`.
  - Desplazamiento activo: `transform: translateX(12px)`.

---

## 3. Identidad de Marca y Encabezado (Header)
- **Disposición:** Columna vertical centrada (`flex-direction: column`).
- **Logotipo:**
  - Archivo oficial: `client/assets/bitxels.svg` (`20px` de alto, relación de aspecto preservada).
  - Sombra: `filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5))`.
- **Texto del Título:**
  - Cadena: `BitGrid Pro`.
  - Estilo: Tipografía limpia blanca (`#ffffff`), tamaño `12.5px`, peso `700`, espaciado entre letras `0.5px`.
  - **Regla estricta:** **NO utilizar contenedores tipo píldora, recuadros ni fondos** alrededor del texto del encabezado.

---

## 4. Agrupación Jerárquica en Adobe Illustrator
- Cuando el toggle **Agrupar resultado** está activo (`groupResult: true`):
  - Todos los trazados vectoriales generados se añaden dentro de un `GroupItem` dedicado en la capa `BitGrid_Custom_Layer`.
  - Nomenclatura semántica automática:
    - Retícula Cuadrada: `BitGrid_Cuadrada_[paso]pt`
    - Retícula Isométrica: `BitGrid_Isometrica_[paso]pt`
    - Círculos Áureos: `BitGrid_RazonAurea_[unidad]pt`
- Cuando el toggle está desactivado (`groupResult: false`):
  - Los trazados quedan sueltos en el nivel raíz de la capa para manipulación directa o despiece manual.

---

## 5. Regla de Opacidad del 20% para Funciones en Desarrollo
- Elementos marcados con `.disabled-feature` o `[data-functional="false"]`:
  ```css
  .disabled-feature,
  [data-functional="false"] {
      opacity: 0.2 !important;
      cursor: not-allowed !important;
      pointer-events: none !important;
      user-select: none !important;
  }
  ```
- **Aplicado a:** Pestañas *Presentaciones*, *Guías de Marca*, *Archivos*, enlace *Ayuda*, enlace *Compartir*, tarjetas de malla *Hexagonal*.

---

## 6. Paleta Cromática y Tokens del Tema Oscuro
| Token CSS | Valor Hex / HSL | Uso Principal |
| :--- | :--- | :--- |
| `--bg-app` | `#222222` | Fondo de la ventana CEP |
| `--bg-card` | `#181818` | Contenedor principal de la tarjeta Studio |
| `--green-primary` | `#10b981` | Acento primario, botones activos, focos |
| `--border-color` | `#282828` | Separadores y bordes estructurales |
| `--text-main` | `#f5f5f5` | Texto principal de alta legibilidad |
| `--text-gray` | `#9ca3af` | Etiquetas de apoyo y valores secundarios |


### E. Iconografía de las Tarjetas de Retícula (Quad Grid Cards)
- **Cuadrada (`data-type="square"`):**
  - Representación: Retícula ortogonal de 3x3 celdas cuadriculadas (`20px x 20px`, trazo `2px`).
- **Isométrica (`data-type="isometric"`):**
  - Representación: Retícula triaxial isométrica real a 30°/60° inscrita en proyección cúbica/hexagonal con ejes centrales y líneas paralelas verticales (`1.6px`), sustituyendo el antiguo ícono genérico de capas superpuestas.
- **Razón Áurea (`data-type="golden"`):**
  - Representación: Tres círculos concéntricos escalonados en proporción de Fibonacci (`r: 2.5, 6, 9.5`) atravesados por una cruz central de construcción (`1.6px`), reflejando con exactitud 1:1 la figura que el motor de Illustrator genera en el lienzo.
- **Hexagonal (`data-type="hexagon"`):**
  - Representación: Polígono hexagonal técnico (marcado como `.disabled-feature` al 20% de opacidad).
