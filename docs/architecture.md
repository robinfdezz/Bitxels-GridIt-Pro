# Arquitectura del Plugin: GridIt Pro (CEP para Adobe Illustrator)

## 1. Visión General de la Arquitectura
**GridIt Pro** está construido sobre el ecosistema **CEP (Common Extensibility Platform)** de Adobe, aprovechando un modelo desacoplado de dos niveles (*Two-Tier Architecture*):

1. **Frontend (Capa de Presentación / Client-side):**
   - Ejecutado en una instancia integrada de **Chromium Embedded Framework (CEF)**.
   - Tecnologías: HTML5 semántico, CSS3 moderno (Adobe Dark UX design system) y JavaScript (ES6+ transpilable / vanilla modular).
   - Responsabilidades: Gestión de estado visual, interactividad del usuario, validación de formularios y serialización de parámetros.

2. **Backend (Capa de Dominio / Host-side ExtendScript):**
   - Motor de scripting nativo de Adobe Illustrator basado en ECMAScript 3 (ExtendScript / C++ Host Bridge).
   - Archivo principal: [hostScript.jsx](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/jsx/hostScript.jsx).
   - Responsabilidades: Manipulación directa del Modelo de Objetos del Documento de Illustrator (DOM de Illustrator: `app.activeDocument`, `PathItem`, `Layer`, `Artboard`, guías nativas, geometría vectorial y refresco de pantalla).

```
┌─────────────────────────────────────────────────────────────┐
│                 Adobe Illustrator CEP Runtime               │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Frontend (Chromium CEF)                │   │
│   │  [index.html] ── [styles.css] ── [main.js]          │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│                    CSInterface.evalScript                   │
│                    (JSON Payload Bridge)                    │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │          Backend Engine (ExtendScript .jsx)         │   │
│   │                 [GridItHost Namespace]              │   │
│   │                                                     │   │
│   │  - Validación de Documento                          │   │
│   │  - Cálculo de Bounds (Mesa de Trabajo / Selección)  │   │
│   │  - Algoritmos Geométricos (Cartesiano, Isométrico,  │   │
│   │    Proporción Áurea)                                │   │
│   │  - Generación de PathItems y conversión a Guides    │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              ▼                              │
│                 Illustrator Document Engine                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Comunicación y Serialización de Datos
El puente de comunicación entre el entorno CEF (JavaScript moderno) y el entorno ExtendScript se realiza mediante **`CSInterface.evalScript()`**.

### Protocolo de Mensajería:
1. **Petición (Frontend ➔ Backend):**
   El frontend recolecta los parámetros numéricos y booleanos de la UI, los valida y los empaqueta en un objeto JSON plano:
   ```json
   {
     "type": "square",
     "spacing": 50,
     "cols": 12,
     "rows": 12,
     "targetScope": "artboard",
     "makeGuides": true,
     "diagonals": false,
     "clearPrevious": true,
     "layerName": "GridIt_Custom_Layer",
     "colorType": "cyan"
   }
   ```
   Se invoca el método correspondiente del namespace `GridItHost` pasando el string JSON escapado:
   ```javascript
   csInterface.evalScript("GridItHost.generateSquareGrid('" + escapedPayload + "')", callback);
   ```

2. **Respuesta (Backend ➔ Frontend):**
   ExtendScript procesa la geometría y devuelve siempre una respuesta serializada en formato JSON estándar:
   ```json
   {
     "success": true,
     "type": "Square",
     "elementsCount": 26,
     "layerName": "GridIt_Custom_Layer",
     "message": "Se generaron 26 guías cuadradas con éxito."
   }
   ```
   En caso de error o ausencia de documento abierto:
   ```json
   {
     "success": false,
     "message": "Error: Abre o crea un documento antes de generar cuadrículas."
   }
   ```

---

## 3. Estructura de Directorios del Proyecto
```
gridit-cep-plugin/
├── .debug                     # Puertos de depuración remota (DevTools en puerto 8088)
├── CSXS/
│   └── manifest.xml           # Configuración del paquete CEP (IDs, compatibilidad, ventanas)
├── client/                    # Capa de Interfaz de Usuario (CEF)
│   ├── css/
│   │   └── styles.css         # Tokens de diseño y estilos oscuros Adobe UX
│   ├── js/
│   │   ├── CSInterface.js     # Librería oficial Adobe CEP con fallback mock
│   │   └── main.js            # Controlador de la interfaz y llamadas a host
│   └── index.html             # Estructura del panel, selectores y formularios
├── jsx/                       # Capa de Dominio ExtendScript
│   └── hostScript.jsx         # Motor matemático y generador de objetos en Illustrator
└── docs/                      # Documentación del proyecto
    ├── architecture.md        # Especificación técnica y arquitectura
    ├── context.md             # Contexto de negocio y especificaciones de diseño
    └── versions.md            # Registro de versiones y Roadmap
```

---

## 4. Gestión de Memoria y Modelo de Capas
- **Capa Exclusiva (`GridIt_Custom_Layer`):** Para evitar alterar el trabajo del diseñador, todas las guías y mallas se crean dentro de una capa dedicada configurable. Si la capa no existe, el motor la crea en la cúspide de la pila de capas.
- **Limpieza Predictiva:** El usuario puede alternar la bandera `clearPrevious` para sustituir las guías previas sin acumular trazos residuales.
- **Conversión de Guías (`pathItem.guides = true`):** Las geometrías generadas pueden convertirse nativamente en guías de Illustrator (`View > Guides`), adoptando el comportamiento estándar de bloqueo (`Lock Guides`) y color cian del sistema operativo.
