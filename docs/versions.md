# Registro de Versiones (Changelog) - GridIt Pro

Todos los cambios notables de este proyecto estÃ¡n documentados en este archivo siguiendo el estÃ¡ndar [Semantic Versioning](https://semver.org/).

---

## [v0.1.5] - 2026-10-06
### IntegraciÃ³n de Identidad "Bitxels Grid" y Filtro de Opacidad al 20%
- **Identidad de Marca:**
  - Renombrado del plugin a **Bitxels Grid** en interfaz, manifiesto ([manifest.xml](file:///C:/Users/pc/Documents/gridit-cep-plugin/CSXS/manifest.xml)) y metadatos.
  - IntegraciÃ³n del logotipo oficial SVG ([bitxels.svg](file:///C:/Users/pc/Documents/gridit-cep-plugin/client/assets/bitxels.svg)) en la cabecera junto a la insignia `GRID`.
  - EstructuraciÃ³n de la carpeta dedicada de recursos en `client/assets/` y `assets/`.
- **Claridad Visual de Funcionalidades (Opacidad 20%):**
  - Se aplicÃ³ `opacity: 0.2; pointer-events: none;` a todos los elementos que forman parte de la hoja de ruta visual pero aÃºn no tienen lÃ³gica activa conectada (*Presentaciones*, *GuÃ­as de Marca*, *Archivos*, *Ver tutorial*, pestaÃ±as *ConstrucciÃ³n* y *Ãrea de Reserva*, tarjeta *Hexagonal*, *Ayuda*, *Compartir*).
  - Los componentes activos (*Cuadrada*, *IsomÃ©trica*, *RazÃ³n Ãurea*, sliders, opciones, *Hacer GuÃ­as*, *Generar*, *Reiniciar*) permanecen al 100% interactivos y nÃ­tidos.

## [v0.1.4] - 2026-10-06
### RediseÃ±o Visual Integral (Inspirado en Akrivi Studio)
- **TransformaciÃ³n de la Interfaz:**
  - Nueva estÃ©tica flotante con tarjeta oscura de bordes redondeados (`#181818`, radio 14px y borde sutil `#282828`).
  - Encabezado con emblema minimalista y sub-navegaciÃ³n horizontal con indicador de lÃ­nea activa (`Mallas de Logo`, `Presentaciones`, `GuÃ­as de Marca`, `Archivos`).
  - Insignia azul de cabecera con botÃ³n de acciÃ³n lateral *Ver tutorial*.
  - Selector segmentado estilo pÃ­ldora de 3 vÃ­as: **Base**, **ConstrucciÃ³n** y **Ãrea de Reserva**.
  - CuadrÃ­cula de 4 tarjetas de selecciÃ³n directa (*Cuadrada*, *IsomÃ©trica*, *Hexagonal*, *RazÃ³n Ãurea*) con iconos vectoriales en azul elÃ©ctrico.
  - AcordeÃ³n colapsable **Personalizar** con controles deslizantes (sliders) ultrafinos y lecturas numÃ©ricas en tiempo real.
  - Botones de acciÃ³n duales destacados:
    - **Hacer GuÃ­as**: BotÃ³n oscuro estilizado con icono de guÃ­as.
    - **Generar**: BotÃ³n de firma con degradado azul elÃ©ctrico brillante y destello (`âœ¨`).
  - Pie de tarjeta con enlaces utilitarios: *Reiniciar*, *Ayuda* y *Compartir*.

## [v0.1.3] - 2026-10-06
### InternacionalizaciÃ³n Completa al EspaÃ±ol (i18n)
- **Interfaz de Usuario (Frontend):**
  - Toda la interfaz de usuario en [index.html](file:///C:/Users/pc/Documents/gridit-cep-plugin/client/index.html) traducida completamente al espaÃ±ol.
  - PestaÃ±as: **Mallas**, **ConstrucciÃ³n** y **Ajustes**.
  - Tipos de mallas: **Cuadrada** (Matriz Cartesiana), **IsomÃ©trica** (Triaxial 30Â° / 60Â°) y **RazÃ³n Ãurea** (ProporciÃ³n Ï† 1.618).
  - Formularios y controles: *Espaciado / Paso (pt)*, *Subdivisiones*, *Columnas*, *Filas*, *Ãrea de AplicaciÃ³n* (Mesa de Trabajo Activa, LÃ­mites de SelecciÃ³n, Matriz Centrada).
  - Opciones: *Convertir en GuÃ­as Nativas (Cian)*, *Incluir Diagonales a 45Â°*, *Limpiar guÃ­as previas de GridIt*.
  - BotÃ³n principal de acciÃ³n: **Generar GuÃ­as**.
- **Controlador JavaScript ([main.js](file:///C:/Users/pc/Documents/gridit-cep-plugin/client/js/main.js)):**
  - Todos los mensajes de estado, notificaciones contextuales y avisos de preajustes localizados al espaÃ±ol.
- **Backend ExtendScript ([hostScript.jsx](file:///C:/Users/pc/Documents/gridit-cep-plugin/jsx/hostScript.jsx)):**
  - Mensajes de retorno JSON traducidos al espaÃ±ol (confirmaciones de generaciÃ³n, conteo de ejes y validaciones de documento).
- **Manifiesto ([manifest.xml](file:///C:/Users/pc/Documents/gridit-cep-plugin/CSXS/manifest.xml)):**
  - Nombre del paquete traducido a *GridIt Pro - Generador de Mallas y GuÃ­as para Logotipos*.

---

## [v0.1.2] - 2026-10-06
### AdaptaciÃ³n y Compatibilidad: Adobe Illustrator 2026 (CEP 11 / 12)
- Ajuste del rango de host a `[26.0,99.9]` y banderas de seguridad de Chromium CEF.
- Soporte de registro `PlayerDebugMode = "1"` para CSXS.12.

---

## [v0.1.1] - 2026-10-06
### Corregido / Estabilidad de UI (Chromium CEF)
- Aislamiento de contexto Node.js y manejo dual de ciclo de vida del DOM.

---

## [v0.1.0-alpha] - 2026-10-06
### AÃ±adido
- Estructura base del plugin CEP, algoritmos matemÃ¡ticos y documentaciÃ³n inicial.