<div align="center">

  <img src="client/assets/bitxels.svg" alt="BitGrid Pro Logo" width="280"/>

  <br/>
  <br/>

  # BitGrid Pro
  ### Generador Profesional de Mallas y Gu&iacute;as de Logotipos para Adobe Illustrator

  [![Adobe Illustrator](https://img.shields.io/badge/Adobe%20Illustrator-CC%202022--2026%2B-FF9A00?style=for-the-badge&logo=adobeillustrator&logoColor=white)](https://www.adobe.com/products/illustrator.html)
  [![CEP Runtime](https://img.shields.io/badge/CEP%20Runtime-9.0--12.0-00C8FF?style=for-the-badge)](https://github.com/Adobe-CEP)
  [![Version](https://img.shields.io/badge/Versi%C3%B3n-v0.1.5--alpha-3b82f6?style=for-the-badge)](docs/versions.md)
  [![Licencia](https://img.shields.io/badge/Licencia-MIT-10b981?style=for-the-badge)](LICENSE)
  [![Platform](https://img.shields.io/badge/Plataforma-Windows%20%7C%20macOS-gray?style=for-the-badge)](https://github.com/robinfdezz/Bitxels-GridIt-Pro)

  <p align="center">
    <b>BitGrid Pro</b> es una extensi&oacute;n CEP (Common Extensibility Platform) de alta precisi&oacute;n dise&ntilde;ada para dise&ntilde;adores de identidad visual, creadores de isotipos y arquitectos de marca. Automatiza la construcci&oacute;n de ret&iacute;culas ortogonales, perspectivas isom&eacute;tricas y proporciones &aacute;ureas directamente como <b>gu&iacute;as nativas vectoriales</b> en Adobe Illustrator.
  </p>

  <p align="center">
    <a href="#-por-qu-bitxels-grid">Por qu&eacute; BitGrid Pro</a> &bull;
    <a href="#-caractersticas-principales">Caracter&iacute;sticas</a> &bull;
    <a href="#-instalacin-y-uso">Instalaci&oacute;n</a> &bull;
    <a href="#-estructura-del-proyecto">Estructura</a> &bull;
    <a href="#-arquitectura-tcnica">Arquitectura</a> &bull;
    <a href="#-hoja-de-ruta-roadmap">Roadmap</a> &bull;
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
| **Hexagonal (Panal)** | [Pr&oacute;x.] | Geometr&iacute;a modular de 6 caras para patrones y logomarcas tecnol&oacute;gicas. |
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

## &#128640; Instalaci&oacute;n y Uso

### Prerrequisitos
- **Adobe Illustrator** CC 2022 (v26.0) hasta CC 2026+ (v30.x+) en Windows o macOS.

---

### Paso 1: Habilitar el Modo Desarrollador de CEP

Dado que la extensi&oacute;n est&aacute; en desarrollo local sin firma digital criptogr&aacute;fica de Adobe, es necesario activar `PlayerDebugMode`:

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
```

---

### Paso 2: Instalar la Extensi&oacute;n

Clona o enlaza este repositorio en la carpeta global de extensiones de Adobe CEP:

#### En Windows (PowerShell):
```powershell
# 1. Crear el directorio de extensiones si no existe
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Adobe\CEP\extensions"

# 2. Clonar el repositorio directamente dentro
cd "$env:APPDATA\Adobe\CEP\extensions"
git clone https://github.com/robinfdezz/Bitxels-GridIt-Pro.git bitxels-grid
```

*(O crea un enlace simb&oacute;lico apuntando a tu carpeta actual de desarrollo).*

#### En macOS:
```bash
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
3. Con un documento abierto, selecciona el tipo de malla (Cuadrada, Isom&eacute;trica o Raz&oacute;n &Aacute;urea), ajusta el espaciado y haz clic en **Hacer Gu&iacute;as** o **Generar**.

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
|-- LICENSE                    # Licencia de código abierto MIT
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
    |-- architecture.md        # Arquitectura two-tier, CEF y flujo de datos JSON
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
- [ ] **v0.2.0:** Algoritmo de Malla Hexagonal param&eacute;trica y mallas polares/radiales con &aacute;ngulos configurables.
- [ ] **v0.3.0:** M&oacute;dulo de Cotas y Construcci&oacute;n (*Anchors*, *Handles*, *Outlines*) para exportar manuales de marca.
- [ ] **v0.4.0:** Creador autom&aacute;tico de &Aacute;reas de Reserva (*Clearspace*) seg&uacute;n la altura `x` del logotipo.

Para consultar el registro hist&oacute;rico completo, revisa [docs/versions.md](docs/versions.md).

---

## &#128196; Licencia

Este proyecto est&aacute; bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para m&aacute;s informaci&oacute;n. Eres libre de usarlo, modificarlo y distribuirlo para fines personales o comerciales.

---

## &#128104;&#8205;&#128187; Autor y Cr&eacute;ditos

Desarrollado y mantenido por **[robinfdezz](https://github.com/robinfdezz)** &bull; **BitGrid Pro**.

Si este proyecto te resulta &uacute;til para tus proyectos de branding y dise&ntilde;o, &iexcl;no olvides dejar una estrella en el repositorio!
