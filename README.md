<div align="center">

  <img src="client/assets/bitxels.svg" alt="BitGrid Pro Logo" width="280"/>

  <br/>
  <br/>

  # BitGrid Pro
  ### Generador Profesional de Mallas y Gu&iacute;as de Logotipos para Adobe Illustrator

  [![Adobe Illustrator](https://img.shields.io/badge/Adobe%20Illustrator-CC%202022--2026%2B-FF9A00?style=for-the-badge&logo=adobeillustrator&logoColor=white)](https://www.adobe.com/products/illustrator.html)
  [![CEP Runtime](https://img.shields.io/badge/CEP%20Runtime-9.0--12.0-00C8FF?style=for-the-badge)](https://github.com/Adobe-CEP)
  [![Version](https://img.shields.io/badge/Versi%C3%B3n-v0.3.0-10b981?style=for-the-badge)](CHANGELOG.md)
  [![Licencia](https://img.shields.io/badge/Licencia-GPL--3.0-10b981?style=for-the-badge)](LICENSE)
  [![Platform](https://img.shields.io/badge/Plataforma-Windows%20%7C%20macOS-gray?style=for-the-badge)](https://github.com/robinfdezz/Bitxels-GridIt-Pro)

  <p align="center">
    <b>BitGrid Pro</b> es una extensi&oacute;n CEP (Common Extensibility Platform) de alta precisi&oacute;n dise&ntilde;ada para dise&ntilde;adores de identidad visual, creadores de isotipos y arquitectos de marca. Automatiza la construcci&oacute;n de ret&iacute;culas ortogonales, perspectivas isom&eacute;tricas y proporciones &aacute;ureas directamente como <b>gu&iacute;as nativas vectoriales</b> en Adobe Illustrator.
  </p>

  <p align="center">
    <a href="#-por-qu-bitxels-grid">Por qu&eacute; BitGrid Pro</a> &bull;
    <a href="#-caractersticas-principales">Caracter&iacute;sticas</a> &bull;
    <a href="#-gua-de-uso-rpida-tutorial-de-opciones">Gu&iacute;a de Uso</a> &bull;
    <a href="#-instalacin-paso-a-paso">Instalaci&oacute;n</a> &bull;
    <a href="CHANGELOG.md">Historial de Versiones</a> &bull;
    <a href="#-arquitectura-tcnica">Arquitectura</a> &bull;
    <a href="#-licencia">Licencia</a>
  </p>
</div>

---

## &#9889; &iquest;Por qu&eacute; BitGrid Pro?

Construir ret&iacute;culas de logotipos manualmente en Illustrator suele tomar entre 5 y 10 minutos por mesa de trabajo: duplicar trazos con *Transform Each*, calcular rotaciones a 30&deg; para isom&eacute;trico, agrupar, bloquear y convertir a gu&iacute;as (`Ctrl + 5`).

Con **BitGrid Pro**, seleccionas tus par&aacute;metros y en **menos de 1 segundo**:
- Se genera la ret&iacute;cula matem&aacute;tica calculada al subp&iacute;xel.
- Se a&iacute;sla en una capa dedicada (`BitGrid_Custom_Layer`).
- Se convierte autom&aacute;ticamente en gu&iacute;as nativas cian bloqueables.
- No interfiere con el arte ni las capas activas de tu cliente.

---

## &#10024; Caracter&iacute;sticas Principales

| Malla / Geometr&iacute;a | Estado | Descripci&oacute;n T&eacute;cnica |
| :--- | :---: | :--- |
| **Cuadrada (Cartesiana)** | [Activo] | Matriz ortogonal param&eacute;trica con soporte para diagonales a 45&deg; y 135&deg;. |
| **Isom&eacute;trica (Triaxial)** | [Activo] | Proyecci&oacute;n axonom&eacute;trica de 30&deg; / 60&deg; calculada trigonom&eacute;tricamente para iconos y 3D. |
| **Raz&oacute;n &Aacute;urea (&phi; 1.618)** | [Activo] | Paquete conc&eacute;ntrico de c&iacute;rculos con la serie de Fibonacci (8, 13, 21, 34, 55, 89) y cruz central. |
| **Hexagonal (Panal)** | [Activo] | Geometr&iacute;a modular de 6 caras (v&eacute;rtice vertical u horizontal, celdas vectoriales cerradas individuales y subdivisi&oacute;n interna opcional en 6 tri&aacute;ngulos equil&aacute;teros). |
| **Construcci&oacute;n de Puntos & Anclas** | [Pr&oacute;x.] | Exportador de cotas visuales con manejadores b&eacute;zier para manuales de marca. |
| **&Aacute;rea de Reserva (Clearspace)** | [Pr&oacute;x.] | Zona de exclusi&oacute;n perimetral autom&aacute;tica basada en el valor `x` del isotipo. |

> &#128161; **Nota Visual:** Las funciones en desarrollo est&aacute;n atenuadas al **20% de opacidad** en la interfaz para mantener total transparencia visual sobre lo que est&aacute; operativo.

---

## &#127912; Sistema de Dise&ntilde;o Visual (Dark UI)

Inspirado en la est&eacute;tica moderna de paneles oscuros profesionales:
- **Tarjeta Flotante:** Fondo carb&oacute;n mate (`#181818`), esquinas redondeadas de 14px y bordes sutiles.
- **Selectores P&iacute;ldora:** Segmentos de navegaci&oacute;n r&aacute;pida con transiciones fluidas.
- **Sliders en Tiempo Real:** Controles de espaciado con retroalimentaci&oacute;n num&eacute;rica continua al instante.
- **Acento Azul El&eacute;ctrico:** Botones primarios destacados con gradiente (`#4c8bf7` &rarr; `#286beb`) y sombras de iluminaci&oacute;n.

---

## &#128214; Gu&iacute;a de Uso R&aacute;pida (Tutorial de Opciones)

BitGrid Pro est&aacute; concebido para una interacci&oacute;n fluida en tres pasos: **seleccionar ret&iacute;cula**, **personalizar par&aacute;metros** y **hacer gu&iacute;as o generar**.

```text
[ Elegir Retícula ]  -->  [ Personalizar Parámetros ]  -->  [ Hacer Guías / Generar ]
(Cuadrada / Iso / Hex / Áurea)    (Radio, Color, Área, Mesas)         (Guías nativas o trazo vectorial)
```

---

### 1. Tipos de Mallas Activas
Haz clic sobre cualquiera de las 4 tarjetas principales de la secci&oacute;n **Base**:
- **Cuadrada (Cartesiana):**
  - Ret&iacute;cula ortogonal tradicional milim&eacute;trica.
  - Opcional: Interruptor de **Diagonales a 45&deg; y 135&deg;** para trazado de &aacute;ngulos y l&iacute;neas din&aacute;micas.
- **Isom&eacute;trica (Triaxial 30&deg; / 90&deg; / 150&deg;):**
  - Tres familias de l&iacute;neas concurrentes calculadas trigonom&eacute;tricamente.
  - Forma estrellas de 6 puntas perfectas recortadas con precisi&oacute;n al ras de la mesa de trabajo.
- **Hexagonal (Panal / Honeycomb):**
  - Ret&iacute;cula modular compuesta por **pol&iacute;gonos cerrados individuales** (`closed = true`) para colorear directamente, seleccionar con un clic o combinar con la herramienta *Creador de Formas* (*Shape Builder* / `Shift + M`).
  - **Orientaci&oacute;n:** Elige entre *V&eacute;rtice Vertical* (pointy-topped, 30&deg;) o *Cara Plana Horizontal* (flat-topped, 0&deg;).
  - **Subdivisi&oacute;n:** Activa *Radios / Ejes internos* para trazar 3 ejes diametrales que dividen cada celda en 6 tri&aacute;ngulos equil&aacute;teros.
- **Raz&oacute;n &Aacute;urea (&phi; 1.618):**
  - Anillos conc&eacute;ntricos escalados en la progresi&oacute;n de Fibonacci (`1, 2, 3, 5, 8, 13, 21, 34`) y cruz de construcci&oacute;n central para alinear arcos tangentes en isotipos.

---

### 2. Panel Desplegable "Personalizar"
Despliega el acopiador para adaptar el trazado a las necesidades de tu identidad visual:
- **Espaciado / Radio / Lado (pt):** Control deslizante con lectura num&eacute;rica continua para definir el tama&ntilde;o de celda.
- **Grosor de Trazo (pt):** De `0.10 pt` a `5.00 pt` para la generaci&oacute;n de vectores reales visibles.
- **Color de Trazo:** 
  - 6 muestras r&aacute;pidas de color predeterminadas.
  - **Selector de Color Flotante (Popover):** Con plano 2D de saturaci&oacute;n/brillo, barra de tono (*hue*), entradas num&eacute;ricas HEX/RGB y herramienta **Cuentagotas** nativa para muestrear directamente cualquier elemento abierto en Illustrator.
- **&Aacute;rea de Aplicaci&oacute;n:**
  - *Mesa de Trabajo Activa:* Llena el lienzo actual recortando limpiamente cualquier trazo que sobresalga.
  - *Matriz Centrada:* Construye una ret&iacute;cula fija de **Columnas &times; Filas** centrada geom&eacute;tricamente en la mesa.
  - *Selecci&oacute;n:* Se ajusta al cuadro delimitador del objeto o grupo que tengas seleccionado.
- **Control de Capas y Mesas:**
  - *Reemplazar previas en mesa activa:* Limpia &uacute;nicamente las ret&iacute;culas de la mesa actual; **no borra** lo generado en otras mesas de trabajo del documento.
  - *Agrupar resultado:* Organiza todo lo generado dentro de un grupo etiquetado sem&aacute;nticamente (ej. `BitGrid_Hexagonal_Vertical_Mesa1_50pt`).

---

### 3. Botones de Acci&oacute;n
- **Hacer Gu&iacute;as:** Convierte la geometr&iacute;a en gu&iacute;as nativas vectoriales de Illustrator (l&iacute;neas cian bloqueables que no se imprimen ni exportan en el arte final).
- **Generar:** Dibuja trazados vectoriales reales con el color y grosor que hayas seleccionado (ideal para manuales de marca y exposiciones de geometr&iacute;a).
- **Reiniciar:** Restablece todos los valores a los valores predeterminados de f&aacute;brica con un solo clic.

---

## &#128640; Instalaci&oacute;n Paso a Paso

Elige el m&eacute;todo que m&aacute;s te acomode: el m&eacute;todo autom&aacute;tico por consola o la instalaci&oacute;n manual para dise&ntilde;adores sin usar terminal.

### Prerrequisitos
- **Adobe Illustrator** CC 2022 (v26.0) hasta CC 2026+ (v30.x+) en Windows o macOS.

---

### Paso 1: Habilitar el Modo Desarrollador de CEP

Dado que la extensi&oacute;n se instala de forma local, es necesario habilitar `PlayerDebugMode` una sola vez en el sistema operativo:

#### En Windows (PowerShell como Administrador):
```powershell
# Habilitar PlayerDebugMode en versiones CEP 9 a 14 (Illustrator 2022 a 2026+)
9..14 | ForEach-Object {
    $key = "HKCU:\Software\Adobe\CSXS.$_"
    if (-not (Test-Path $key)) { New-Item -Path $key -Force | Out-Null }
    Set-ItemProperty -Path $key -Name "PlayerDebugMode" -Value "1" -Type String -Force
}
```

#### En macOS (Terminal):
```bash
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
defaults write com.adobe.CSXS.13 PlayerDebugMode 1
defaults write com.adobe.CSXS.14 PlayerDebugMode 1
```

---

### Paso 2: Colocar la Carpeta de la Extensi&oacute;n

#### Opci&oacute;n A: Instalaci&oacute;n Manual (Recomendada para Dise&ntilde;adores sin Consola)
1. En esta p&aacute;gina de GitHub, haz clic en el bot&oacute;n verde **Code** (arriba a la derecha) y selecciona **Download ZIP**.
2. Descomprime el archivo descargado.
3. Cambia el nombre de la carpeta descomprimida a `bitxels-grid` (o d&eacute;jala como est&aacute;).
4. Copia esa carpeta y p&eacute;gala en la ruta oficial de extensiones de Adobe:
   - **En Windows:** Presiona las teclas `Win + R`, pega exactamente esta ruta y pulsa Enter:
     ```text
     %APPDATA%\Adobe\CEP\extensions\
     ```
     *(Si las carpetas `CEP` o `extensions` no existen, puedes crearlas manualmente).*
   - **En macOS:** Abre el Finder, presiona `Cmd + Shift + G`, pega esta ruta y pulsa Enter:
     ```text
     ~/Library/Application Support/Adobe/CEP/extensions/
     ```

#### Opci&oacute;n B: Instalaci&oacute;n con Git (Para Desarrolladores)
- **Windows (PowerShell):**
  ```powershell
  New-Item -ItemType Directory -Force -Path "$env:APPDATA\Adobe\CEP\extensions"
  cd "$env:APPDATA\Adobe\CEP\extensions"
  git clone https://github.com/robinfdezz/Bitxels-GridIt-Pro.git bitxels-grid
  ```
- **macOS:**
  ```bash
  mkdir -p ~/Library/Application\ Support/Adobe/CEP/extensions/
  cd ~/Library/Application\ Support/Adobe/CEP/extensions/
  git clone https://github.com/robinfdezz/Bitxels-GridIt-Pro.git bitxels-grid
  ```

---

### Paso 3: Abrir en Adobe Illustrator
1. Inicia o reinicia **Adobe Illustrator**.
2. Dir&iacute;gete al men&uacute; superior:
   ```text
   Ventana > Extensiones > BitGrid Pro
   (Window > Extensions > BitGrid Pro)
   ```
3. &iexcl;Listo! El panel se abrir&aacute; con el tema oscuro nativo y todas las herramientas listas para usar.

---

> [!TIP]
> **&iquest;Tienes dudas o no est&aacute;s familiarizado con la consola o las carpetas del sistema?**
> Puedes copiar y pegar todo este bloque de instalaci&oacute;n en tu asistente de Inteligencia Artificial favorito (**ChatGPT, Claude, Gemini, etc.**) dici&eacute;ndole:
> *"Ay&uacute;dame a instalar esta extensi&oacute;n en mi computadora paso a paso. Mi sistema operativo es [Windows / Mac]"*.
> La IA te guiar&aacute; con capturas, atajos de teclado y explicaciones amigables adaptadas a tu nivel.

---

## &#128736; Depuraci&oacute;n y Modo Developer

BitGrid Pro incluye soporte preconfigurado para **Chrome DevTools**:
1. Con Illustrator y el panel abiertos, entra en Google Chrome a:
   ```text
   http://localhost:8088
   ```
2. Haz clic en el enlace del panel para acceder a la consola, inspeccionar elementos del DOM, medir rendimiento y depurar llamadas `ExtendScript`.

---

## &#128193; Estructura del Proyecto

```
Bitxels-GridIt-Pro/
|-- .debug                     # Puertos DevTools de depuración remota (puerto 8088)
|-- LICENSE                    # Licencia de código abierto GNU GPLv3
|-- README.md                  # Documentación principal del repositorio
|-- bitxels.svg                # Logotipo vectorial de la marca
|-- CSXS/
|   \-- manifest.xml           # Configuración del paquete CEP (Host ILST [26.0, 99.9])
|-- client/                    # Frontend (Chromium Embedded Framework - CEF)
|   |-- assets/
|   |   \-- bitxels.svg        # Recursos gráficos y logos
|   |-- css/
|   |   \-- styles.css         # Sistema de diseño visual oscuro (Akrivi Dark Theme)
|   |-- js/
|   |   |-- CSInterface.js     # Puente de comunicación Adobe CEP oficial con mock
|   |   \-- main.js            # Controlador reactivo y manejador de eventos del DOM
|   \-- index.html             # Estructura del panel HTML5 y controles interactivos
|-- jsx/                       # Backend (Adobe ExtendScript)
|   \-- hostScript.jsx         # Motor matemático y manipulador del DOM de Illustrator
\-- docs/                      # Documentación Técnica
    |-- architecture.md        # Especificación técnica y arquitectura
|   |-- functions.md           # Documentación detallada de funciones y alcance
|   |-- design-system.md       # Sistema de diseño, estándares UI y decisiones visuales
    |-- context.md             # Justificación del producto y perfil de usuario
    \-- versions.md            # Registro formal de versiones y cambios detallados
```

---

## &#127963; Arquitectura T&eacute;cnica

El plugin est&aacute; dise&ntilde;ado bajo un modelo desacoplado de dos niveles (**Two-Tier CEP Architecture**):

```
+-------------------------------------------------------------+
|                 Adobe Illustrator CEP Runtime               |
|                                                             |
|   +-----------------------------------------------------+   |
|   |              Frontend (Chromium CEF)                |   |
|   |     HTML5 + CSS3 Variables + JavaScript Vanilla     |   |
|   +--------------------------+--------------------------+   |
|                              |                              |
|                    CSInterface.evalScript                   |
|                    (JSON Payload Bridge)                    |
|                              |                              |
|   +--------------------------v--------------------------+   |
|   |          Backend Engine (ExtendScript .jsx)         |   |
|   |                 [GridItHost Namespace]              |   |
|   |                                                     |   |
|   |  - Validación estricta de documentos activos        |   |
|   |  - Límites de Artboard vs Límites de Selección      |   |
|   |  - Algoritmos de trigonometría (tan 30°, Fibonacci) |   |
|   |  - Creación de PathItems y conversión a guías       |   |
|   +--------------------------+--------------------------+   |
|                              v                              |
|                 Illustrator Document Engine                 |
+-------------------------------------------------------------+
```

Consulta [docs/architecture.md](docs/architecture.md) para detalles completos de la comunicaci&oacute;n JSON.

---

## &#128506; Hoja de Ruta (Roadmap)

- [x] **v0.1.0:** Estructura inicial CEP, mallas cuadradas, isom&eacute;tricas y proporci&oacute;n &aacute;urea.
- [x] **v0.1.2:** Compatibilidad completa con Adobe Illustrator 2026 (CEP 11/12) y pol&iacute;ticas CEF.
- [x] **v0.1.3:** Internacionalizaci&oacute;n y adaptaci&oacute;n completa al espa&ntilde;ol.
- [x] **v0.1.4:** Redise&ntilde;o visual integral estilo Akrivi Studio (tarjetas flotantes oscuras).
- [x] **v0.1.5:** Identidad de marca **Bitxels Grid**, integraci&oacute;n de logotipo SVG y filtro de claridad (20% opacidad).
- [x] **v0.2.0:** Concurrencia isom&eacute;trica de estrella de 6 puntas, selector de color popover con cuentagotas para Illustrator, gesti&oacute;n multi-mesa aislada y homologaci&oacute;n est&eacute;tica verde.
- [x] **v0.3.0:** Malla Hexagonal modular param&eacute;trica (orientaci&oacute;n vertical u horizontal, celdas vectoriales cerradas individuales y subdivisi&oacute;n interna opcional en 6 tri&aacute;ngulos equil&aacute;teros con recorte al lienzo). Licencia oficial GNU GPLv3 y gu&iacute;a de uso r&aacute;pida.
- [ ] **v0.4.0:** M&oacute;dulo de Cotas y Construcci&oacute;n (*Anchors*, *Handles*, *Outlines*) para exportar manuales de marca.
- [ ] **v0.5.0:** Creador autom&aacute;tico de &Aacute;reas de Reserva (*Clearspace*) seg&uacute;n la altura `x` del logotipo.

Para consultar el registro hist&oacute;rico completo de todas las versiones, revisa [CHANGELOG.md](CHANGELOG.md).

---

## &#128196; Licencia

Este proyecto est&aacute; protegido bajo la Licencia **GNU General Public License v3.0 (GPLv3)**. Consulta el archivo [LICENSE](LICENSE) para m&aacute;s informaci&oacute;n. Eres libre de usarlo, estudiarlo y mejorarlo, pero cualquier trabajo derivado o redistribuci&oacute;n debe permanecer 100% libre y de c&oacute;digo abierto bajo la misma licencia.

---

## &#128104;&#8205;&#128187; Autor y Cr&eacute;ditos

Desarrollado y mantenido por **[robinfdezz](https://github.com/robinfdezz)** &bull; **BitGrid Pro**.

Si este proyecto te resulta &uacute;til para tus proyectos de branding y dise&ntilde;o, &iexcl;no olvides dejar una estrella en el repositorio!
