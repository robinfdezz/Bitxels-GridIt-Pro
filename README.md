# GridIt Pro - Adobe Illustrator CEP Extension

Extension profesional para Adobe Illustrator especializada en generación paramétrica de cuadrículas de construcción de logotipos, proyección isométrica y proporciones áureas.

---

## 🚀 Estructura del Proyecto

- [CSXS/manifest.xml](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/CSXS/manifest.xml): Definición del panel CEP, geometrías y versiones de Illustrator soportadas (CC 2020 a CC 2026+).
- [.debug](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/.debug): Configuración de puerto de depuración remota Chrome DevTools (`localhost:8088`).
- [client/index.html](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/client/index.html): Estructura del panel HTML5 con tema oscuro y pestañas interactivas.
- [client/css/styles.css](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/client/css/styles.css): Sistema de diseño visual oscuro inspirado en Adobe Spectrum.
- [client/js/main.js](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/client/js/main.js): Lógica de interacción frontend y llamadas a ExtendScript.
- [client/js/CSInterface.js](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/client/js/CSInterface.js): Puente de comunicación Adobe CEP con soporte de simulación para navegadores.
- [jsx/hostScript.jsx](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/jsx/hostScript.jsx): Motor de backend ExtendScript en Illustrator (creación de capas, cálculo de límites y guías).
- **Documentación:**
  - [docs/architecture.md](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/docs/architecture.md): Arquitectura detallada, ciclo de vida CEP y flujo de datos.
  - [docs/context.md](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/docs/context.md): Contexto y justificación del producto.
  - [docs/versions.md](file:///C:/Users/pc/.gemini/antigravity-ide/scratch/gridit-cep-plugin/docs/versions.md): Historial de versiones y Roadmap.

---

## 🛠️ Instalación y Pruebas en Adobe Illustrator (Windows)

### Paso 1: Habilitar el Modo Debug de CEP en el Registro de Windows
Para que Illustrator cargue extensiones sin firmar durante el desarrollo, ejecuta en PowerShell como Administrador:
```powershell
# Para Illustrator CC 2020 a CC 2026 (CEP 9, 10 y 11)
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d "1" /f
```

### Paso 2: Crear el Enlace Simbólico en la Carpeta de Extensiones de CEP
Copia o vincula simbólicamente la carpeta del plugin a la ruta de extensiones de Adobe:
```powershell
# Crear la carpeta de extensiones si no existe
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Adobe\CEP\extensions"

# Crear enlace simbólico (o copiar la carpeta)
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\Adobe\CEP\extensions\gridit-cep-plugin" -Target "C:\Users\pc\.gemini\antigravity-ide\scratch\gridit-cep-plugin"
```

### Paso 3: Abrir en Adobe Illustrator
1. Inicia o reinicia **Adobe Illustrator**.
2. Ve al menú superior: **Ventana > Extensiones > GridIt Pro** (*Window > Extensions > GridIt Pro*).
3. Abre un documento nuevo y presiona **Generate Guides**.
