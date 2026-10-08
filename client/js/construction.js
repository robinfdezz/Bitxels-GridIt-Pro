/**
 * BitGrid Pro - Controlador del Módulo de Construcción (Construction)
 * Con soporte de Vista Previa en Vivo (Live Preview en tiempo real con debounce)
 */

var ConstructionModule = (function () {
    "use strict";

    var csInterface = null;
    var activeElements = {
        horizontals: false,
        verticals: false,
        diagonals: false,
        circles: false,
        anchors: true,      // Activo por defecto
        handles: false,
        outlines: true,     // Activo por defecto
        spacing: false
    };

    var config = {
        anchorSize: 4.0,       // pt
        strokeWidth: 0.5,      // pt
        handleDotSize: 3.0,    // pt
        handleScale: 1.0,      // factor de extensión
        strokeOpacity: 100,    // %
        ghostOpacity: 0,       // % (0 = sin relleno, puro contorno técnico)
        strokeColor: "#10B981",// Color esmeralda inicial
        fillColor: "#FFFFFF",  // Color de relleno técnico por defecto
        clearPrev: true,
        asGuides: false,
        lockLayer: false,
        separateLayers: true
    };

    // Plantillas de valores por defecto
    var DEFAULT_ELEMENTS = {
        horizontals: false,
        verticals: false,
        diagonals: false,
        circles: false,
        anchors: false,
        handles: false,
        outlines: true,
        spacing: false
    };

    var DEFAULT_CONFIG = {
        anchorSize: 4.0,
        strokeWidth: 0.5,
        handleDotSize: 3.0,
        handleScale: 1.0,
        strokeOpacity: 100,
        ghostOpacity: 0,
        strokeColor: "#10B981",
        fillColor: "#FFFFFF",
        clearPrev: true,
        asGuides: false,
        lockLayer: false,
        separateLayers: true
    };

    var STORAGE_KEY_CONFIG = "bitgrid_con_config_v2";
    var STORAGE_KEY_ELEMENTS = "bitgrid_con_elements_v2";

    function saveSettingsToCache() {
        try {
            localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
            localStorage.setItem(STORAGE_KEY_ELEMENTS, JSON.stringify(activeElements));
        } catch(e) {}
    }

    function loadSettingsFromCache() {
        try {
            var sCfg = localStorage.getItem(STORAGE_KEY_CONFIG);
            if (sCfg) {
                var pCfg = JSON.parse(sCfg);
                for (var k in pCfg) {
                    if (pCfg.hasOwnProperty(k)) config[k] = pCfg[k];
                }
            }
            var sEl = localStorage.getItem(STORAGE_KEY_ELEMENTS);
            if (sEl) {
                var pEl = JSON.parse(sEl);
                for (var ek in pEl) {
                    if (pEl.hasOwnProperty(ek)) activeElements[ek] = pEl[ek];
                }
            }
        } catch(e) {}
    }

    function init(csInst, setStatusCallback) {
        csInterface = csInst;

        // Cargar configuración guardada en caché (LocalStorage)
        loadSettingsFromCache();

        // Elementos DOM
        var subtabElements = document.getElementById("con-subtab-elements");
        var subtabCustomize = document.getElementById("con-subtab-customize");
        var panelElements = document.getElementById("con-panel-elements");
        var panelCustomize = document.getElementById("con-panel-customize");

        var cards = document.querySelectorAll(".con-card");
        var btnClearAll = document.getElementById("btn-con-clear-all");
        var btnClean = document.getElementById("btn-con-clean");
        var btnFinalize = document.getElementById("btn-con-finalize");
        var btnReset = document.getElementById("btn-con-reset");

        // Sliders
        var sliderAnchorSize = document.getElementById("slider-con-anchor-size");
        var valAnchorSize = document.getElementById("val-con-anchor-size");
        var sliderStrokeW = document.getElementById("slider-con-stroke-w");
        var valStrokeW = document.getElementById("val-con-stroke-w");
        var sliderHandleSize = document.getElementById("slider-con-handle-size");
        var valHandleSize = document.getElementById("val-con-handle-size");
        var sliderHandleScale = document.getElementById("slider-con-handle-scale");
        var valHandleScale = document.getElementById("val-con-handle-scale");
        var sliderStrokeOp = document.getElementById("slider-con-stroke-op");
        var valStrokeOp = document.getElementById("val-con-stroke-op");
        var sliderGhostOp = document.getElementById("slider-con-ghost-op");
        var valGhostOp = document.getElementById("val-con-ghost-op");

        // Color & Swatches
        var swatchBtnsCon = document.querySelectorAll(".swatch-btn-con");
        var btnToggleColorPickerCon = document.getElementById("btn-toggle-color-picker-con");
        var colorPopoverCon = document.getElementById("color-popover-con");
        var btnCloseColorPopoverCon = document.getElementById("btn-close-color-popover-con");
        var btnEyedropperCon = document.getElementById("btn-eyedropper-con");
        var colorPreviewCon = document.getElementById("color-current-preview-con");
        var inputHexValCon = document.getElementById("input-hex-val-con");
        var btnApplyColorCon = document.getElementById("btn-apply-color-con");

        // Color & Swatches de Relleno Técnico
        var swatchBtnsConFill = document.querySelectorAll(".swatch-btn-con-fill");
        var btnToggleColorPickerConFill = document.getElementById("btn-toggle-color-picker-con-fill");
        var colorPopoverConFill = document.getElementById("color-popover-con-fill");
        var btnCloseColorPopoverConFill = document.getElementById("btn-close-color-popover-con-fill");
        var btnEyedropperConFill = document.getElementById("btn-eyedropper-con-fill");
        var colorPreviewConFill = document.getElementById("color-current-preview-con-fill");
        var inputHexValConFill = document.getElementById("input-hex-val-con-fill");
        var btnApplyColorConFill = document.getElementById("btn-apply-color-con-fill");

        // Toggles
        var toggleClearPrev = document.getElementById("toggle-con-clear-prev");
        var toggleAsGuides = document.getElementById("toggle-con-as-guides");
        var toggleLock = document.getElementById("toggle-con-lock");
        var toggleSeparateLayers = document.getElementById("toggle-con-separate-layers");

        function setStatus(msg, isSuccess) {
            if (typeof setStatusCallback === "function") {
                setStatusCallback(msg, isSuccess);
            }
        }

        // MOTOR DE VISTA PREVIA EN VIVO (Live Preview)
        var liveUpdateTimer = null;
        function triggerLiveUpdate(delay, changedProp) {
            saveSettingsToCache();
            // La reacción automática es EXCLUSIVA de la pestaña Personalizar
            if (!panelCustomize || panelCustomize.style.display === "none") {
                return;
            }
            clearTimeout(liveUpdateTimer);
            liveUpdateTimer = setTimeout(function () {
                if (!csInterface) return;
                var params = {
                    elements: activeElements,
                    config: config,
                    changedProperty: changedProp || null
                };
                var call = "ConstructionHost.updateConstruction('" + JSON.stringify(params).replace(/'/g, "\\'") + "')";
                csInterface.evalScript(call, function (res) {
                    try {
                        var data = JSON.parse(res);
                        if (data.success) {
                            setStatus("Vista previa en vivo actualizada (" + data.elementsCount + " elementos).", true);
                        }
                    } catch(e) {}
                });
            }, typeof delay === "number" ? delay : 140);
        }

        // 1. Sub-pestañas: Elementos vs Personalizar
        if (subtabElements && subtabCustomize && panelElements && panelCustomize) {
            subtabElements.addEventListener("click", function () {
                subtabElements.classList.add("active");
                subtabCustomize.classList.remove("active");
                panelElements.style.display = "grid";
                panelCustomize.style.display = "none";
            });

            subtabCustomize.addEventListener("click", function () {
                subtabCustomize.classList.add("active");
                subtabElements.classList.remove("active");
                panelElements.style.display = "none";
                panelCustomize.style.display = "flex";
            });
        }

        // 2. Toggles de las 8 Tarjetas Anatómicas con Auto-refresco en vivo
        cards.forEach(function (card) {
            var type = card.getAttribute("data-con");
            if (activeElements[type]) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }

            card.addEventListener("click", function () {
                activeElements[type] = !activeElements[type];
                card.classList.toggle("active", activeElements[type]);
                saveSettingsToCache();
                
                var count = Object.keys(activeElements).filter(function(k) { return activeElements[k]; }).length;
                setStatus("Construcción: " + count + " elementos seleccionados.", true);
            });
        });

        // 3. Sliders de Personalizar con Debounce en Vivo (140ms para máxima fluidez)
        if (sliderAnchorSize && valAnchorSize) {
            sliderAnchorSize.addEventListener("input", function () {
                config.anchorSize = parseFloat(sliderAnchorSize.value);
                valAnchorSize.textContent = config.anchorSize.toFixed(1) + " pt";
                triggerLiveUpdate(140, "anchorSize");
            });
        }

        if (sliderHandleSize && valHandleSize) {
            sliderHandleSize.addEventListener("input", function () {
                config.handleDotSize = parseFloat(sliderHandleSize.value);
                valHandleSize.textContent = config.handleDotSize.toFixed(1) + " pt";
                triggerLiveUpdate(140, "handleDotSize");
            });
        }

        if (sliderStrokeW && valStrokeW) {
            sliderStrokeW.addEventListener("input", function () {
                config.strokeWidth = parseFloat(sliderStrokeW.value);
                valStrokeW.textContent = config.strokeWidth.toFixed(2) + " pt";
                triggerLiveUpdate(140, "strokeWidth");
            });
        }

        if (sliderHandleScale && valHandleScale) {
            sliderHandleScale.addEventListener("input", function () {
                config.handleScale = parseFloat(sliderHandleScale.value);
                valHandleScale.textContent = config.handleScale.toFixed(1) + "x";
                triggerLiveUpdate(140, "handleScale");
            });
        }

        if (sliderStrokeOp && valStrokeOp) {
            sliderStrokeOp.addEventListener("input", function () {
                config.strokeOpacity = parseInt(sliderStrokeOp.value, 10);
                valStrokeOp.textContent = config.strokeOpacity + " %";
                triggerLiveUpdate(140, "strokeOpacity");
            });
        }

        if (sliderGhostOp && valGhostOp) {
            sliderGhostOp.addEventListener("input", function () {
                config.ghostOpacity = parseInt(sliderGhostOp.value, 10);
                valGhostOp.textContent = config.ghostOpacity + " %";
                triggerLiveUpdate(140, "ghostOpacity");
            });
        }

        // 4. Color Swatches y Popover de Color con Refresco Inmediato
        function applyConColor(hex) {
            if (!hex) return;
            var cleanHex = hex.replace("#", "").toUpperCase();
            if (cleanHex.length === 3) {
                cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
            }
            config.strokeColor = "#" + cleanHex;
            saveSettingsToCache();
            if (colorPreviewCon) colorPreviewCon.style.backgroundColor = config.strokeColor;
            if (inputHexValCon) inputHexValCon.value = cleanHex;
            triggerLiveUpdate(0, "strokeColor");
        }

        swatchBtnsCon.forEach(function (btn) {
            btn.addEventListener("click", function () {
                swatchBtnsCon.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                var col = btn.getAttribute("data-color");
                applyConColor(col);
                if (btnToggleColorPickerCon) btnToggleColorPickerCon.classList.remove("active");
                if (colorPopoverCon) colorPopoverCon.style.display = "none";
            });
        });

        if (btnToggleColorPickerCon && colorPopoverCon) {
            btnToggleColorPickerCon.addEventListener("click", function () {
                var isOpen = colorPopoverCon.style.display === "flex";
                colorPopoverCon.style.display = isOpen ? "none" : "flex";
                btnToggleColorPickerCon.classList.toggle("active", !isOpen);
            });
        }

        if (btnCloseColorPopoverCon && colorPopoverCon) {
            btnCloseColorPopoverCon.addEventListener("click", function () {
                colorPopoverCon.style.display = "none";
                if (btnToggleColorPickerCon) btnToggleColorPickerCon.classList.remove("active");
            });
        }

        if (btnApplyColorCon && inputHexValCon) {
            btnApplyColorCon.addEventListener("click", function () {
                var hex = inputHexValCon.value.trim();
                applyConColor(hex);
                swatchBtnsCon.forEach(function (b) { b.classList.remove("active"); });
                if (btnToggleColorPickerCon) btnToggleColorPickerCon.classList.add("active");
                if (colorPopoverCon) colorPopoverCon.style.display = "none";
            });
        }

        // Eyedropper: Muestrear color de Illustrator
        if (btnEyedropperCon) {
            btnEyedropperCon.addEventListener("click", function () {
                if (!csInterface) return;
                setStatus("Muestreando color del logotipo seleccionado...", true);
                csInterface.evalScript("HostScript.pickColorFromSelection()", function (res) {
                    try {
                        var data = JSON.parse(res);
                        if (data.success && data.hex) {
                            applyConColor(data.hex);
                            swatchBtnsCon.forEach(function (b) { b.classList.remove("active"); });
                            if (btnToggleColorPickerCon) btnToggleColorPickerCon.classList.add("active");
                        } else {
                            setStatus(data.message || "Selecciona un objeto para muestrear color.", false);
                        }
                    } catch (e) {
                        setStatus("Error al muestrear color.", false);
                    }
                });
            });
        }

        // 4b. Color de Relleno Técnico (Swatches, Popover y Eyedropper)
        function applyConFillColor(hex) {
            if (!hex) return;
            var cleanHex = hex.replace("#", "").toUpperCase();
            if (cleanHex.length === 3) {
                cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
            }
            config.fillColor = "#" + cleanHex;
            saveSettingsToCache();
            if (colorPreviewConFill) colorPreviewConFill.style.backgroundColor = config.fillColor;
            if (inputHexValConFill) inputHexValConFill.value = cleanHex;
            triggerLiveUpdate(0, "fillColor");
        }

        swatchBtnsConFill.forEach(function (btn) {
            btn.addEventListener("click", function () {
                swatchBtnsConFill.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                var col = btn.getAttribute("data-color");
                applyConFillColor(col);
                if (btnToggleColorPickerConFill) btnToggleColorPickerConFill.classList.remove("active");
                if (colorPopoverConFill) colorPopoverConFill.style.display = "none";
            });
        });

        if (btnToggleColorPickerConFill && colorPopoverConFill) {
            btnToggleColorPickerConFill.addEventListener("click", function (e) {
                e.stopPropagation();
                var isOpen = colorPopoverConFill.style.display === "flex";
                colorPopoverConFill.style.display = isOpen ? "none" : "flex";
                btnToggleColorPickerConFill.classList.toggle("active", !isOpen);
                if (colorPopoverCon) colorPopoverCon.style.display = "none";
                if (btnToggleColorPickerCon) btnToggleColorPickerCon.classList.remove("active");
            });
        }

        if (btnCloseColorPopoverConFill && colorPopoverConFill) {
            btnCloseColorPopoverConFill.addEventListener("click", function () {
                colorPopoverConFill.style.display = "none";
                if (btnToggleColorPickerConFill) btnToggleColorPickerConFill.classList.remove("active");
            });
        }

        if (btnApplyColorConFill && inputHexValConFill) {
            btnApplyColorConFill.addEventListener("click", function () {
                var hex = inputHexValConFill.value.trim();
                applyConFillColor(hex);
                swatchBtnsConFill.forEach(function (b) { b.classList.remove("active"); });
                if (btnToggleColorPickerConFill) btnToggleColorPickerConFill.classList.add("active");
                if (colorPopoverConFill) colorPopoverConFill.style.display = "none";
            });
        }

        if (btnEyedropperConFill) {
            btnEyedropperConFill.addEventListener("click", function () {
                if (!csInterface) return;
                setStatus("Muestreando color de relleno...", true);
                csInterface.evalScript("HostScript.pickColorFromSelection()", function (res) {
                    try {
                        var data = JSON.parse(res);
                        if (data.success && data.hex) {
                            applyConFillColor(data.hex);
                            swatchBtnsConFill.forEach(function (b) { b.classList.remove("active"); });
                            if (btnToggleColorPickerConFill) btnToggleColorPickerConFill.classList.add("active");
                        } else {
                            setStatus(data.message || "Selecciona un objeto para muestrear color.", false);
                        }
                    } catch (e) {
                        setStatus("Error al muestrear color.", false);
                    }
                });
            });
        }

        // 5. Toggles Avanzados
        if (toggleClearPrev) {
            toggleClearPrev.addEventListener("change", function () {
                config.clearPrev = toggleClearPrev.checked;
                saveSettingsToCache();
            });
        }

        if (toggleAsGuides) {
            toggleAsGuides.addEventListener("change", function () {
                config.asGuides = toggleAsGuides.checked;
                saveSettingsToCache();
                triggerLiveUpdate(0);
            });
        }

        if (toggleLock) {
            toggleLock.addEventListener("change", function () {
                config.lockLayer = toggleLock.checked;
                saveSettingsToCache();
                triggerLiveUpdate(0);
            });
        }

        if (toggleSeparateLayers) {
            toggleSeparateLayers.addEventListener("change", function () {
                config.separateLayers = toggleSeparateLayers.checked;
                saveSettingsToCache();
                triggerLiveUpdate(0);
            });
        }

        // 6. Acciones
        if (btnClearAll) {
            btnClearAll.addEventListener("click", function () {
                setStatus("Eliminando capas de construcción...", true);
                if (csInterface) {
                    csInterface.evalScript("ConstructionHost.clearAll()", function (res) {
                        try {
                            var data = JSON.parse(res);
                            setStatus(data.message || "Construcción eliminada.", data.success);
                        } catch(e) {
                            setStatus("Capas de construcción eliminadas.", true);
                        }
                    });
                }
            });
        }

        if (btnClean) {
            btnClean.addEventListener("click", function () {
                setStatus("Limpiando guías auxiliares de construcción...", true);
                if (csInterface) {
                    csInterface.evalScript("ConstructionHost.clean()", function (res) {
                        try {
                            var data = JSON.parse(res);
                            setStatus(data.message || "Lienzo limpio.", data.success);
                        } catch(e) {
                            setStatus("Lienzo limpio.", true);
                        }
                    });
                }
            });
        }

        if (btnFinalize) {
            btnFinalize.addEventListener("click", function () {
                var params = {
                    elements: activeElements,
                    config: config
                };

                setStatus("Consolidando lámina de construcción...", true);

                if (csInterface) {
                    var call = "ConstructionHost.finalize('" + JSON.stringify(params).replace(/'/g, "\\'") + "')";
                    csInterface.evalScript(call, function (res) {
                        try {
                            var data = JSON.parse(res);
                            if (data.success) {
                                setStatus("Lámina de construcción finalizada (" + data.elementsCount + " elementos anatómicos creados).", true);
                            } else {
                                setStatus(data.message || "Error al finalizar lámina de construcción.", false);
                            }
                        } catch(e) {
                            setStatus("Construcción generada en Illustrator.", true);
                        }
                    });
                }
            });
        }

        // Sincronizador de Interfaz Gráfica con el Estado de Configuración
        function syncUIFromConfig() {
            if (sliderAnchorSize && valAnchorSize) {
                sliderAnchorSize.value = config.anchorSize;
                valAnchorSize.textContent = Number(config.anchorSize).toFixed(1) + " pt";
            }
            if (sliderHandleSize && valHandleSize) {
                sliderHandleSize.value = config.handleDotSize;
                valHandleSize.textContent = Number(config.handleDotSize).toFixed(1) + " pt";
            }
            if (sliderStrokeW && valStrokeW) {
                sliderStrokeW.value = config.strokeWidth;
                valStrokeW.textContent = Number(config.strokeWidth).toFixed(2) + " pt";
            }
            if (sliderHandleScale && valHandleScale) {
                sliderHandleScale.value = config.handleScale;
                valHandleScale.textContent = Number(config.handleScale).toFixed(1) + "x";
            }
            if (sliderStrokeOp && valStrokeOp) {
                sliderStrokeOp.value = config.strokeOpacity;
                valStrokeOp.textContent = config.strokeOpacity + " %";
            }
            if (sliderGhostOp && valGhostOp) {
                sliderGhostOp.value = config.ghostOpacity;
                valGhostOp.textContent = config.ghostOpacity + " %";
            }

            // Toggles
            if (toggleClearPrev) toggleClearPrev.checked = (config.clearPrev !== false);
            if (toggleAsGuides) toggleAsGuides.checked = (config.asGuides === true);
            if (toggleLock) toggleLock.checked = (config.lockLayer === true);
            if (toggleSeparateLayers) toggleSeparateLayers.checked = (config.separateLayers !== false);

            // Colores Trazo
            var cleanStroke = (config.strokeColor || "#10B981").replace("#", "").toUpperCase();
            if (colorPreviewCon) colorPreviewCon.style.backgroundColor = "#" + cleanStroke;
            if (inputHexValCon) inputHexValCon.value = cleanStroke;
            swatchBtnsCon.forEach(function (btn) {
                var btnCol = (btn.getAttribute("data-color") || "").replace("#", "").toUpperCase();
                btn.classList.toggle("active", btnCol === cleanStroke);
            });

            // Colores Relleno
            var cleanFill = (config.fillColor || "#FFFFFF").replace("#", "").toUpperCase();
            if (colorPreviewConFill) colorPreviewConFill.style.backgroundColor = "#" + cleanFill;
            if (inputHexValConFill) inputHexValConFill.value = cleanFill;
            swatchBtnsConFill.forEach(function (btn) {
                var btnCol = (btn.getAttribute("data-color") || "").replace("#", "").toUpperCase();
                btn.classList.toggle("active", btnCol === cleanFill);
            });

            // Tarjetas de Elementos
            cards.forEach(function (card) {
                var type = card.getAttribute("data-con");
                card.classList.toggle("active", !!activeElements[type]);
            });
        }

        // Ejecutar sincronización inicial al cargar el plugin
        syncUIFromConfig();

        // Botón "Por Defecto" (Restablecer todas las opciones de construcción)
        if (btnReset) {
            btnReset.addEventListener("click", function () {
                for (var k in DEFAULT_CONFIG) {
                    if (DEFAULT_CONFIG.hasOwnProperty(k)) config[k] = DEFAULT_CONFIG[k];
                }
                for (var ek in DEFAULT_ELEMENTS) {
                    if (DEFAULT_ELEMENTS.hasOwnProperty(ek)) activeElements[ek] = DEFAULT_ELEMENTS[ek];
                }
                saveSettingsToCache();
                syncUIFromConfig();
                setStatus("Opciones de construcción restablecidas por defecto.", true);
                triggerLiveUpdate(0);
            });
        }
    }

    return {
        init: init
    };
})();

if (typeof window !== "undefined") {
    window.ConstructionModule = ConstructionModule;
}
