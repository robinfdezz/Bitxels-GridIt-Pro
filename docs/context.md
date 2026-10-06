# Contexto del Proyecto: GridIt Pro

## 1. Justificación y Propósito
El diseño de logotipos, isotipos y sistemas de identidad visual moderna exige una rigurosa precisión geométrica basada en mallas ortogonales, perspectivas isométricas y proporciones áureas (Fibonacci, regla de tercios y círculos tangentes).

Actualmente, los diseñadores en **Adobe Illustrator** se enfrentan a un proceso manual y tedioso:
1. Crear líneas repetidas con la herramienta *Blend* o duplicar con *Transform Each*.
2. Calcular a mano los ángulos de 30° / 60° para perspectivas isométricas.
3. Convertir manualmente cada objeto en guía mediante el atajo `Ctrl + 5` (`Cmd + 5`).
4. Organizar capas para no mezclar las guías con los artes finales.

**GridIt Pro** nace como una solución integral mediante una extensión CEP que automatiza y acelera este flujo de trabajo con un solo clic, ofreciendo controles paramétricos interactivos y generación instantánea de guías nativas de alta precisión.

---

## 2. Objetivos Principales
1. **Velocidad de Flujo de Trabajo:** Reducir el tiempo de preparación de una mesa de trabajo para diseño de marcas de ~5 minutos a menos de 2 segundos.
2. **Precisión Matemática:** Asegurar que los espaciados, inclinaciones isométricas (ejes triaxiales a 30° respecto a la horizontal) y progresiones de Fibonacci se calculen con exactitud de subpíxel/punto tipográfico.
3. **No Invasivo:** Operar siempre sobre una capa dedicada (`GridIt_Custom_Layer`) para aislar los elementos auxiliares del diseño del cliente.
4. **Experiencia de Usuario Nativa:** Proporcionar una interfaz visual oscura elegante que se integre visualmente con la paleta de Adobe Illustrator (Adobe Spectrum Dark UX).

---

## 3. Perfil de Usuario y Casos de Uso
- **Diseñadores de Identidad Visual:** Construcción de retículas de isotipos corporativos.
- **Ilustradores Isométricos:** Creación inmediata de cuadrículas triaxiales para arquitectura, videojuegos e iconografía.
- **Diseñadores de UI / Iconografía:** Configuración de retículas estándar (16x16, 24x24, 32x32, 512x512) con diagonales de seguridad a 45°.

---

## 4. Requerimientos de Calidad y Restricciones Técnicas
- **Compatibilidad de Versiones:** Adobe Illustrator CC 2020 (v24.0) hasta CC 2026+ (v30.x+) en Windows y macOS.
- **Motor de Scripting:** ExtendScript en Illustrator es monohilo. Las operaciones geométricas deben ejecutarse por lotes y finalizar con una única llamada a `app.redraw()` para evitar caídas de rendimiento visual.
- **Desacoplamiento:** El frontend HTML5 no debe asumir la presencia del motor Illustrator sin validar previamente, permitiendo previsualizaciones rápidas en cualquier navegador web moderno a través del adaptador de simulación integrado en `CSInterface.js`.
