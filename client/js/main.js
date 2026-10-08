/**
 * BitGrid Pro - Controlador Frontend
 * Con soporte de Vista Previa en Vivo (Live Preview instantáneo), Caché LocalStorage y Sincronización
 */

(function () {
    "use strict";

    var BASE_DEFAULT_CONFIG = {
        type: "square",
        spacing: 50,
        strokeWidth: 0.5,
        strokeOpacity: 100,
        strokeColor: "#10B981",
        cols: 12,
        rows: 12,
        targetScope: "artboard",
        diagonals: false,
        hexOrientation: "pointy",
        hexSpokes: false,
        clearPrevious: true,
        groupResult: true
    };

    var baseConfig = Object.assign({}, BASE_DEFAULT_CONFIG);
    var STORAGE_KEY_BASE_CONFIG = "bitgrid_base_config_v1";

    function saveBaseSettingsToCache() {
        try {
            localStorage.setItem(STORAGE_KEY_BASE_CONFIG, JSON.stringify(baseConfig));
        } catch(e) {}
    }

    function loadBaseSettingsFromCache() {
        try {
            var sCfg = localStorage.getItem(STORAGE_KEY_BASE_CONFIG);
            if (sCfg) {
                var pCfg = JSON.parse(sCfg);
                for (var k in pCfg) {
                    if (pCfg.hasOwnProperty(k)) {
                        baseConfig[k] = pCfg[k];
                    }
                }
            }
        } catch(e) {}
    }

    function init() {
        var csInterface = null;
        try {
            csInterface = new CSInterface();
        } catch(e) {
            console.error("CSInterface fallo:", e);
        }

        // Cargar configuración guardada de Base
        loadBaseSettingsFromCache();
        initGlobalNumberInputSteppers();
        initCustomDropdowns();

        var currentType = baseConfig.type || "square";
        var currentSegment = "base";
        var activeStrokeColor = baseConfig.strokeColor || "#10B981";

        // DOM Elements - Segmentos y Vistas
        var segBase = document.getElementById("seg-base");
        var segConstruction = document.getElementById("seg-construction");
        var segClearspace = document.getElementById("seg-clearspace");

        var viewBaseQuad = document.getElementById("view-base-quad");
        var quadItems = document.querySelectorAll("#view-base-quad .quad-item");

        // Sub-pestañas en Módulo Base
        var baseSubtabGrids = document.getElementById("base-subtab-grids");
        var baseSubtabCustomize = document.getElementById("base-subtab-customize");
        var basePanelGrids = document.getElementById("view-base-quad");
        var basePanelCustomize = document.getElementById("panel-base-customize");

        // Sliders & Controles de Base
        var sliderSpacing = document.getElementById("slider-spacing");
        var valSpacing = document.getElementById("val-spacing");

        var sliderStrokeWidth = document.getElementById("slider-stroke-width");
        var valStrokeWidth = document.getElementById("val-stroke-width");

        var sliderBaseStrokeOp = document.getElementById("slider-base-stroke-op");
        var valBaseStrokeOp = document.getElementById("val-base-stroke-op");

        var swatchBtns = document.querySelectorAll(".swatch-btn");
        var inputCustomColor = document.getElementById("input-custom-color");

        var inputCols = document.getElementById("input-cols");
        var inputRows = document.getElementById("input-rows");
        var selectScope = document.getElementById("select-scope");
        var toggleDiagonals = document.getElementById("toggle-diagonals");
        var rowToggleDiagonals = document.getElementById("row-toggle-diagonals");
        var hexOptionsBlock = document.getElementById("hex-options-block");
        var selectHexOrientation = document.getElementById("select-hex-orientation");
        var toggleHexSpokes = document.getElementById("toggle-hex-spokes");
        var lblSpacing = document.getElementById("lbl-spacing");
        var toggleClearPrev = document.getElementById("toggle-clear-prev");
        var toggleGroupResult = document.getElementById("toggle-group-result");

        var btnMakeGuides = document.getElementById("btn-make-guides");
        var btnGenerate = document.getElementById("btn-generate");
        var btnReset = document.getElementById("btn-reset");

        var statusText = document.getElementById("status-text");
        var statusDot = document.getElementById("status-dot");

        function setStatus(msg, isSuccess) {
            if (statusText) statusText.textContent = msg;
            if (statusDot) {
                statusDot.className = "status-dot" + (isSuccess ? "" : " error");
            }
        }

        // MOTOR DE VISTA PREVIA EN VIVO (Live Preview) PARA BASE
        var baseLiveUpdateTimer = null;
        function triggerBaseLiveUpdate(delay, changedProp) {
            saveBaseSettingsToCache();

            // La reacción en vivo en Base se activa cuando el panel Personalizar está visible
            if (!basePanelCustomize || basePanelCustomize.style.display === "none") {
                return;
            }

            clearTimeout(baseLiveUpdateTimer);
            baseLiveUpdateTimer = setTimeout(function () {
                if (!csInterface) return;

                // Solo actualizar si el usuario ya generó previamente una retícula en el documento
                csInterface.evalScript("GridItHost.hasBaseGrid('BitGrid_Custom_Layer')", function (hasGridRes) {
                    var hasGrid = (hasGridRes === "true" || hasGridRes === true);
                    if (!hasGrid) {
                        // Si no hay ninguna retícula creada aún, no dibujar nada automáticamente
                        return;
                    }

                    var params = {
                        type: currentType,
                        spacing: parseFloat(sliderSpacing ? sliderSpacing.value : 50),
                        strokeWidth: parseFloat(sliderStrokeWidth ? sliderStrokeWidth.value : 0.5) || 0.5,
                        strokeColor: activeStrokeColor || "#10B981",
                        opacity: parseFloat(sliderBaseStrokeOp ? sliderBaseStrokeOp.value : 100),
                        cols: parseInt(inputCols ? inputCols.value : 12, 10),
                        rows: parseInt(inputRows ? inputRows.value : 12, 10),
                        targetScope: selectScope ? selectScope.value : "artboard",
                        makeGuides: false,
                        diagonals: toggleDiagonals ? toggleDiagonals.checked : false,
                        orientation: selectHexOrientation ? selectHexOrientation.value : "pointy",
                        innerSpokes: toggleHexSpokes ? toggleHexSpokes.checked : false,
                        clearPrevious: toggleClearPrev ? toggleClearPrev.checked : true,
                        groupResult: toggleGroupResult ? toggleGroupResult.checked : true,
                        layerName: "BitGrid_Custom_Layer"
                    };

                    // Actualización in-situ ultra-rápida (60 FPS) para propiedades puramente visuales
                    if (changedProp === "strokeColor" || changedProp === "strokeWidth" || changedProp === "opacity") {
                        var scriptUpdate = "GridItHost.updateBaseGridStyles('" + JSON.stringify(params).replace(/'/g, "\\'") + "')";
                        csInterface.evalScript(scriptUpdate, function (res) {
                            try {
                                var data = JSON.parse(res);
                                if (data.success && !data.needRegenerate) {
                                    setStatus("Estilos de retícula actualizados en vivo.", true);
                                    return;
                                }
                            } catch(e) {}
                            doBaseRegenerate(params);
                        });
                    } else {
                        doBaseRegenerate(params);
                    }
                });
            }, typeof delay === "number" ? delay : 130);
        }

        function doBaseRegenerate(params) {
            var method = "generateSquareGrid";
            if (params.type === "isometric") method = "generateIsometricGrid";
            else if (params.type === "golden") method = "generateGoldenCircles";
            else if (params.type === "hexagon") method = "generateHexagonalGrid";

            var scriptCall = "GridItHost." + method + "('" + JSON.stringify(params).replace(/'/g, "\\'") + "')";
            csInterface.evalScript(scriptCall, function (res) {
                try {
                    var data = JSON.parse(res);
                    if (data.success) {
                        setStatus(data.message || "Retícula actualizada en vivo.", true);
                    }
                } catch(e) {}
            });
        }

        /* 1. Sub-pestañas en Módulo Base: Cuadrículas vs Personalizar */
        if (baseSubtabGrids && baseSubtabCustomize && basePanelGrids && basePanelCustomize) {
            baseSubtabGrids.addEventListener("click", function() {
                baseSubtabGrids.classList.add("active");
                baseSubtabCustomize.classList.remove("active");
                basePanelGrids.style.display = "grid";
                basePanelCustomize.style.display = "none";
            });

            baseSubtabCustomize.addEventListener("click", function() {
                baseSubtabCustomize.classList.add("active");
                baseSubtabGrids.classList.remove("active");
                basePanelGrids.style.display = "none";
                basePanelCustomize.style.display = "flex";
            });
        }

        /* 2. Control Segmentado (Base vs Construcción) */
        var segmentBtns = [segBase, segConstruction, segClearspace];
        function setSegment(seg) {
            currentSegment = seg;
            segmentBtns.forEach(function(b) { if (b) b.classList.remove("active"); });
            var viewBase = document.getElementById("view-base-container");
            var viewCon = document.getElementById("view-construction-container");

            if (seg === "base") {
                if (segBase) segBase.classList.add("active");
                if (viewBase) viewBase.style.display = "flex";
                if (viewCon) viewCon.style.display = "none";
                setStatus("Módulo Base activo: Generador de retículas.", true);
            } else if (seg === "construction") {
                if (segConstruction) segConstruction.classList.add("active");
                if (viewBase) viewBase.style.display = "none";
                if (viewCon) viewCon.style.display = "flex";
                setStatus("Módulo Construcción activo: Selecciona tu logo en Illustrator.", true);
            }
        }

        if (segBase) segBase.addEventListener("click", function() { setSegment("base"); });
        if (segConstruction) segConstruction.addEventListener("click", function() { setSegment("construction"); });

                // Inicializar submódulo de construcción de forma segura
        if (window.ConstructionModule && typeof window.ConstructionModule.init === "function") {
            try {
                window.ConstructionModule.init(csInterface, setStatus);
            } catch (conErr) {
                console.error("Error al inicializar ConstructionModule:", conErr);
            }
        }

        /* 3. Selector de Tarjetas (Square, Isometric, Hexagon, Golden) */
        function updateTypeLayout(type) {
            var boxColsRows = document.getElementById("box-cols-rows");
            if (type === "hexagon") {
                if (hexOptionsBlock) hexOptionsBlock.style.display = "flex";
                if (rowToggleDiagonals) rowToggleDiagonals.style.display = "none";
                if (lblSpacing) lblSpacing.textContent = "Radio / Lado (pt)";
                if (boxColsRows) boxColsRows.style.display = "flex";
            } else if (type === "golden") {
                if (hexOptionsBlock) hexOptionsBlock.style.display = "none";
                if (rowToggleDiagonals) rowToggleDiagonals.style.display = "none";
                if (lblSpacing) lblSpacing.textContent = "Unidad Base (pt)";
                if (boxColsRows) boxColsRows.style.display = "none";
            } else if (type === "isometric") {
                if (hexOptionsBlock) hexOptionsBlock.style.display = "none";
                if (rowToggleDiagonals) rowToggleDiagonals.style.display = "none";
                if (lblSpacing) lblSpacing.textContent = "Espaciado (pt)";
                if (boxColsRows) boxColsRows.style.display = "flex";
            } else {
                if (hexOptionsBlock) hexOptionsBlock.style.display = "none";
                if (rowToggleDiagonals) rowToggleDiagonals.style.display = "flex";
                if (lblSpacing) lblSpacing.textContent = "Espaciado (pt)";
                if (boxColsRows) boxColsRows.style.display = "flex";
            }
        }

        quadItems.forEach(function(card) {
            card.addEventListener("click", function() {
                if (card.classList.contains("disabled-feature")) return;
                quadItems.forEach(function(c) { c.classList.remove("active"); });
                card.classList.add("active");
                currentType = card.getAttribute("data-type");
                baseConfig.type = currentType;
                updateTypeLayout(currentType);

                if (currentType === "hexagon") setStatus("Seleccionado: Malla Hexagonal", true);
                else if (currentType === "golden") setStatus("Seleccionado: Razón Áurea (Fibonacci)", true);
                else if (currentType === "isometric") setStatus("Seleccionado: Malla Isométrica", true);
                else setStatus("Seleccionado: Malla Cuadrada", true);

                triggerBaseLiveUpdate(50, "type");
            });
        });

        /* 4. Sliders en Vivo */
        if (sliderSpacing && valSpacing) {
            sliderSpacing.addEventListener("input", function() {
                valSpacing.textContent = parseFloat(sliderSpacing.value).toFixed(2);
                baseConfig.spacing = parseFloat(sliderSpacing.value);
                triggerBaseLiveUpdate(130, "spacing");
            });
        }

        if (sliderStrokeWidth && valStrokeWidth) {
            sliderStrokeWidth.addEventListener("input", function() {
                valStrokeWidth.textContent = parseFloat(sliderStrokeWidth.value).toFixed(2) + " pt";
                baseConfig.strokeWidth = parseFloat(sliderStrokeWidth.value);
                triggerBaseLiveUpdate(80, "strokeWidth");
            });
        }

        if (sliderBaseStrokeOp && valBaseStrokeOp) {
            sliderBaseStrokeOp.addEventListener("input", function() {
                valBaseStrokeOp.textContent = sliderBaseStrokeOp.value + "%";
                baseConfig.strokeOpacity = parseFloat(sliderBaseStrokeOp.value);
                triggerBaseLiveUpdate(80, "opacity");
            });
        }

        /* Controles de Matriz y Opciones */
        if (inputCols) {
            inputCols.addEventListener("input", function() {
                baseConfig.cols = parseInt(inputCols.value, 10);
                triggerBaseLiveUpdate(180, "colsRows");
            });
        }

        if (inputRows) {
            inputRows.addEventListener("input", function() {
                baseConfig.rows = parseInt(inputRows.value, 10);
                triggerBaseLiveUpdate(180, "colsRows");
            });
        }

        if (selectScope) {
            selectScope.addEventListener("change", function() {
                baseConfig.targetScope = selectScope.value;
                triggerBaseLiveUpdate(80, "scope");
            });
        }

        if (toggleDiagonals) {
            toggleDiagonals.addEventListener("change", function() {
                baseConfig.diagonals = toggleDiagonals.checked;
                triggerBaseLiveUpdate(0, "diagonals");
            });
        }

        if (selectHexOrientation) {
            selectHexOrientation.addEventListener("change", function() {
                baseConfig.hexOrientation = selectHexOrientation.value;
                triggerBaseLiveUpdate(0, "orientation");
            });
        }

        if (toggleHexSpokes) {
            toggleHexSpokes.addEventListener("change", function() {
                baseConfig.hexSpokes = toggleHexSpokes.checked;
                triggerBaseLiveUpdate(0, "innerSpokes");
            });
        }

        if (toggleClearPrev) {
            toggleClearPrev.addEventListener("change", function() {
                baseConfig.clearPrevious = toggleClearPrev.checked;
                saveBaseSettingsToCache();
            });
        }

        if (toggleGroupResult) {
            toggleGroupResult.addEventListener("change", function() {
                baseConfig.groupResult = toggleGroupResult.checked;
                saveBaseSettingsToCache();
            });
        }

        /* 5. Selector de Color Personalizado Popover */
        var btnToggleColorPicker = document.getElementById("btn-toggle-color-picker");
        var colorPopover = document.getElementById("color-popover");
        var btnCloseColorPopover = document.getElementById("btn-close-color-popover");
        var btnApplyColor = document.getElementById("btn-apply-color");

        var satValBox = document.getElementById("color-sat-val-box");
        var colorCursor = document.getElementById("color-cursor");
        var hueBar = document.getElementById("color-hue-bar");
        var hueThumb = document.getElementById("color-hue-thumb");

        var btnEyedropper = document.getElementById("btn-eyedropper");
        var colorCurrentPreview = document.getElementById("color-current-preview");
        var inputHexVal = document.getElementById("input-hex-val");
        var inputRgbR = document.getElementById("input-rgb-r");
        var inputRgbG = document.getElementById("input-rgb-g");
        var inputRgbB = document.getElementById("input-rgb-b");

        var currentHue = 160;
        var currentSat = 0.91;
        var currentVal = 0.73;

        function hsvToRgb(h, s, v) {
            var r, g, b, i, f, p, q, t;
            h = (h % 360 + 360) % 360 / 60;
            i = Math.floor(h);
            f = h - i;
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));
            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }

        function rgbToHsv(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, v = max;
            var d = max - min;
            s = max === 0 ? 0 : d / max;
            if (max === min) {
                h = 0;
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h * 360, s: s, v: v };
        }

        function hexToRgb(hex) {
            hex = hex.replace("#", "");
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            var num = parseInt(hex, 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
        }

        function rgbToHex(r, g, b) {
            var bin = (r << 16) | (g << 8) | b;
            return (function(h) {
                return new Array(7 - h.length).join("0") + h;
            })(bin.toString(16).toUpperCase());
        }

        function renderColorPickerUI(updateInputs) {
            if (satValBox) {
                satValBox.style.backgroundColor = "hsl(" + Math.round(currentHue) + ", 100%, 50%)";
            }
            if (colorCursor) {
                colorCursor.style.left = (currentSat * 100) + "%";
                colorCursor.style.top = ((1 - currentVal) * 100) + "%";
            }
            if (hueThumb) {
                hueThumb.style.left = ((currentHue / 360) * 100) + "%";
            }

            var rgb = hsvToRgb(currentHue, currentSat, currentVal);
            var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            activeStrokeColor = "#" + hex;
            baseConfig.strokeColor = activeStrokeColor;

            if (colorCurrentPreview) {
                colorCurrentPreview.style.backgroundColor = activeStrokeColor;
            }

            if (updateInputs) {
                if (inputHexVal) inputHexVal.value = hex;
                if (inputRgbR) inputRgbR.value = rgb.r;
                if (inputRgbG) inputRgbG.value = rgb.g;
                if (inputRgbB) inputRgbB.value = rgb.b;
            }
        }

        function applyHexColor(hexString) {
            var rgb = hexToRgb(hexString);
            var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            currentHue = hsv.h;
            currentSat = hsv.s;
            currentVal = hsv.v;
            renderColorPickerUI(true);
        }

        // Toggle del popover
        if (btnToggleColorPicker && colorPopover) {
            btnToggleColorPicker.addEventListener("click", function(e) {
                e.stopPropagation();
                var isOpen = colorPopover.style.display === "flex";
                colorPopover.style.display = isOpen ? "none" : "flex";
                if (!isOpen) {
                    btnToggleColorPicker.classList.add("active");
                    swatchBtns.forEach(function(b) { b.classList.remove("active"); });
                    applyHexColor(activeStrokeColor);
                } else {
                    btnToggleColorPicker.classList.remove("active");
                }
            });
        }

        if (btnCloseColorPopover && colorPopover) {
            btnCloseColorPopover.addEventListener("click", function(e) {
                e.stopPropagation();
                colorPopover.style.display = "none";
                if (btnToggleColorPicker) btnToggleColorPicker.classList.remove("active");
            });
        }

        if (btnApplyColor && colorPopover) {
            btnApplyColor.addEventListener("click", function() {
                colorPopover.style.display = "none";
                setStatus("Color de trazo fijado en " + activeStrokeColor, true);
                triggerBaseLiveUpdate(0, "strokeColor");
            });
        }

        // Interacción con plano 2D Saturación/Brillo
        var isDraggingSatVal = false;
        function updateSatValFromEvent(e) {
            if (!satValBox) return;
            var rect = satValBox.getBoundingClientRect();
            var x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            var y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
            currentSat = x / rect.width;
            currentVal = 1 - (y / rect.height);
            renderColorPickerUI(true);
            triggerBaseLiveUpdate(70, "strokeColor");
        }

        if (satValBox) {
            satValBox.addEventListener("mousedown", function(e) {
                isDraggingSatVal = true;
                updateSatValFromEvent(e);
            });
        }

        // Interacción con barra de Hue
        var isDraggingHue = false;
        function updateHueFromEvent(e) {
            if (!hueBar) return;
            var rect = hueBar.getBoundingClientRect();
            var x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            currentHue = (x / rect.width) * 360;
            renderColorPickerUI(true);
            triggerBaseLiveUpdate(70, "strokeColor");
        }

        if (hueBar) {
            hueBar.addEventListener("mousedown", function(e) {
                isDraggingHue = true;
                updateHueFromEvent(e);
            });
        }

        document.addEventListener("mousemove", function(e) {
            if (isDraggingSatVal) updateSatValFromEvent(e);
            if (isDraggingHue) updateHueFromEvent(e);
        });

        document.addEventListener("mouseup", function() {
            isDraggingSatVal = false;
            isDraggingHue = false;
        });

        // Entradas manuales Hex y RGB
        if (inputHexVal) {
            inputHexVal.addEventListener("input", function() {
                var clean = inputHexVal.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
                inputHexVal.value = clean;
                if (clean.length === 6) {
                    applyHexColor(clean);
                    triggerBaseLiveUpdate(50, "strokeColor");
                }
            });
        }

        function handleRgbInput() {
            var r = Math.max(0, Math.min(255, parseInt(inputRgbR ? inputRgbR.value : 0, 10) || 0));
            var g = Math.max(0, Math.min(255, parseInt(inputRgbG ? inputRgbG.value : 0, 10) || 0));
            var b = Math.max(0, Math.min(255, parseInt(inputRgbB ? inputRgbB.value : 0, 10) || 0));
            var hsv = rgbToHsv(r, g, b);
            currentHue = hsv.h;
            currentSat = hsv.s;
            currentVal = hsv.v;
            renderColorPickerUI(false);
            if (inputHexVal) inputHexVal.value = rgbToHex(r, g, b);
            triggerBaseLiveUpdate(50, "strokeColor");
        }

        if (inputRgbR) inputRgbR.addEventListener("input", handleRgbInput);
        if (inputRgbG) inputRgbG.addEventListener("input", handleRgbInput);
        if (inputRgbB) inputRgbB.addEventListener("input", handleRgbInput);

        // Herramienta Cuentagotas (Eyedropper)
        function sampleFromIllustrator() {
            if (csInterface) {
                csInterface.evalScript("GridItHost.pickColorFromSelection()", function(res) {
                    try {
                        var data = JSON.parse(res);
                        if (data.success && data.hex) {
                            applyHexColor(data.hex);
                            triggerBaseLiveUpdate(0, "strokeColor");
                            setStatus(data.message || "Color tomado de Illustrator.", true);
                        } else {
                            setStatus(data.message || "Selecciona un objeto en Illustrator primero.", false);
                        }
                    } catch(err) {
                        setStatus("Selecciona un objeto con trazo o relleno en Illustrator.", false);
                    }
                });
            } else {
                setStatus("Cuentagotas activo para Illustrator.", true);
            }
        }

        if (btnEyedropper) {
            btnEyedropper.addEventListener("click", function() {
                if (window.EyeDropper) {
                    try {
                        var dropper = new EyeDropper();
                        dropper.open().then(function(result) {
                            if (result && result.sRGBHex) {
                                applyHexColor(result.sRGBHex);
                                triggerBaseLiveUpdate(0, "strokeColor");
                                setStatus("Color muestreado: " + result.sRGBHex, true);
                            }
                        }).catch(function() {
                            sampleFromIllustrator();
                        });
                    } catch(e) {
                        sampleFromIllustrator();
                    }
                } else {
                    sampleFromIllustrator();
                }
            });
        }

        /* Swatches de Color Rápidos */
        swatchBtns.forEach(function(btn) {
            btn.addEventListener("click", function() {
                swatchBtns.forEach(function(b) { b.classList.remove("active"); });
                btn.classList.add("active");
                if (btnToggleColorPicker) btnToggleColorPicker.classList.remove("active");
                if (colorPopover) colorPopover.style.display = "none";
                activeStrokeColor = btn.getAttribute("data-color");
                baseConfig.strokeColor = activeStrokeColor;
                applyHexColor(activeStrokeColor);
                triggerBaseLiveUpdate(0, "strokeColor");
            });
        });

        /* Sincronizar UI desde Config */
        function syncBaseUIFromConfig() {
            currentType = baseConfig.type || "square";
            quadItems.forEach(function(card) {
                if (card.getAttribute("data-type") === currentType) {
                    card.classList.add("active");
                } else {
                    card.classList.remove("active");
                }
            });
            updateTypeLayout(currentType);

            if (sliderSpacing && valSpacing) {
                sliderSpacing.value = baseConfig.spacing;
                valSpacing.textContent = parseFloat(baseConfig.spacing).toFixed(2);
            }
            if (sliderStrokeWidth && valStrokeWidth) {
                sliderStrokeWidth.value = baseConfig.strokeWidth;
                valStrokeWidth.textContent = parseFloat(baseConfig.strokeWidth).toFixed(2) + " pt";
            }
            if (sliderBaseStrokeOp && valBaseStrokeOp) {
                sliderBaseStrokeOp.value = baseConfig.strokeOpacity;
                valBaseStrokeOp.textContent = baseConfig.strokeOpacity + "%";
            }
            if (inputCols) inputCols.value = baseConfig.cols;
            if (inputRows) inputRows.value = baseConfig.rows;
            if (selectScope) { selectScope.value = baseConfig.targetScope; selectScope.dispatchEvent(new Event("change", { bubbles: true })); }
            if (toggleDiagonals) toggleDiagonals.checked = !!baseConfig.diagonals;
            if (selectHexOrientation) { selectHexOrientation.value = baseConfig.hexOrientation; selectHexOrientation.dispatchEvent(new Event("change", { bubbles: true })); }
            if (toggleHexSpokes) toggleHexSpokes.checked = !!baseConfig.hexSpokes;
            if (toggleClearPrev) toggleClearPrev.checked = (baseConfig.clearPrevious !== false);
            if (toggleGroupResult) toggleGroupResult.checked = (baseConfig.groupResult !== false);

            activeStrokeColor = baseConfig.strokeColor || "#10B981";
            applyHexColor(activeStrokeColor);

            var foundSwatch = false;
            swatchBtns.forEach(function(b) {
                if (b.getAttribute("data-color").toUpperCase() === activeStrokeColor.toUpperCase()) {
                    b.classList.add("active");
                    foundSwatch = true;
                } else {
                    b.classList.remove("active");
                }
            });
            if (btnToggleColorPicker) {
                btnToggleColorPicker.classList.toggle("active", !foundSwatch);
            }
        }

        // Aplicar estado inicial guardado en la interfaz
        syncBaseUIFromConfig();

        /* 6. Reiniciar (Restablecer valores por defecto, guardar y refrescar en vivo) */
        if (btnReset) {
            btnReset.addEventListener("click", function() {
                baseConfig = Object.assign({}, BASE_DEFAULT_CONFIG);
                saveBaseSettingsToCache();
                syncBaseUIFromConfig();
                if (colorPopover) colorPopover.style.display = "none";
                if (btnToggleColorPicker) btnToggleColorPicker.classList.remove("active");
                setStatus("Valores reiniciados a los predeterminados.", true);
                triggerBaseLiveUpdate(0, "reset");
            });
        }

        /* 7. Generación (Hacer Guías o Generar) */
        function executeGeneration(asGuides) {
            saveBaseSettingsToCache();
            var params = {
                type: currentType,
                spacing: parseFloat(sliderSpacing ? sliderSpacing.value : 50),
                strokeWidth: parseFloat(sliderStrokeWidth ? sliderStrokeWidth.value : 0.5) || 0.5,
                strokeColor: activeStrokeColor || "#10B981",
                opacity: parseFloat(sliderBaseStrokeOp ? sliderBaseStrokeOp.value : 100),
                cols: parseInt(inputCols ? inputCols.value : 12, 10),
                rows: parseInt(inputRows ? inputRows.value : 12, 10),
                targetScope: selectScope ? selectScope.value : "artboard",
                makeGuides: asGuides,
                diagonals: toggleDiagonals ? toggleDiagonals.checked : false,
                orientation: selectHexOrientation ? selectHexOrientation.value : "pointy",
                innerSpokes: toggleHexSpokes ? toggleHexSpokes.checked : false,
                clearPrevious: toggleClearPrev ? toggleClearPrev.checked : true,
                groupResult: toggleGroupResult ? toggleGroupResult.checked : true,
                layerName: "BitGrid_Custom_Layer"
            };

            var method = "generateSquareGrid";
            if (currentType === "isometric") method = "generateIsometricGrid";
            else if (currentType === "golden") method = "generateGoldenCircles";
            else if (currentType === "hexagon") method = "generateHexagonalGrid";

            setStatus("Generando mallas en Illustrator...", true);

            var scriptCall = "GridItHost." + method + "('" + JSON.stringify(params).replace(/'/g, "\\'") + "')";
            if (csInterface) {
                csInterface.evalScript(scriptCall, function(res) {
                    try {
                        var data = JSON.parse(res);
                        if (data.success) {
                            setStatus(data.message || (asGuides ? "Guías generadas con éxito." : "Retícula generada con éxito."), true);
                        } else {
                            setStatus(data.message || "Error al generar guías.", false);
                        }
                    } catch(e) {
                        setStatus("Respuesta recibida de Illustrator.", true);
                    }
                });
            }
        }

        if (btnMakeGuides) {
            btnMakeGuides.addEventListener("click", function() {
                executeGeneration(true);
            });
        }

        if (btnGenerate) {
            btnGenerate.addEventListener("click", function() {
                executeGeneration(false);
            });
        }

        // Ping inicial
        if (csInterface) {
            csInterface.evalScript("GridItHost.ping()", function(res) {
                try {
                    var data = JSON.parse(res);
                    if (data.success && data.hasDocument) {
                        setStatus("Conectado: " + data.documentName, true);
                    } else {
                        setStatus("Listo. Abre un documento en Illustrator.", true);
                    }
                } catch(e) {
                    setStatus("BitGrid Pro activo.", true);
                }
            });
        }
    }

    /* ==========================================================================
       SOPORTE UNIVERSAL PARA INPUTS NUMÉRICOS:
       Ruedita del ratón (Wheel) y Flechas del Teclado (Up/Down)
       Aplica a todos los inputs actuales y futuros (delegación global en document)
       ========================================================================== */
    function initGlobalNumberInputSteppers() {
        // 1. Control mediante Ruedita del Ratón
        document.addEventListener("wheel", function (e) {
            var target = e.target;
            if (!target || target.tagName !== "INPUT" || target.type !== "number" || target.disabled || target.readOnly) {
                return;
            }

            e.preventDefault();

            var currentVal = parseFloat(target.value);
            if (isNaN(currentVal)) currentVal = 0;

            var step = parseFloat(target.step) || 1;
            // Shift = 10x, Alt = 0.1x
            var multiplier = e.shiftKey ? 10 : (e.altKey ? 0.1 : 1);
            var delta = (e.deltaY < 0 ? 1 : -1) * step * multiplier;

            var min = (target.min !== "" && target.min !== null) ? parseFloat(target.min) : null;
            var max = (target.max !== "" && target.max !== null) ? parseFloat(target.max) : null;

            var newVal = currentVal + delta;
            if (min !== null && newVal < min) newVal = min;
            if (max !== null && newVal > max) newVal = max;

            var decimals = (step.toString().split(".")[1] || "").length;
            if (multiplier < 1) decimals = Math.max(decimals + 1, 1);
            target.value = decimals > 0 ? newVal.toFixed(decimals) : Math.round(newVal);

            // Notificar a oyentes reactivos (Live Preview, guardado en cache, etc.)
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
        }, { passive: false });

        // 2. Control mediante Flechas del Teclado (Flecha Arriba / Abajo)
        document.addEventListener("keydown", function (e) {
            var target = e.target;
            if (!target || target.tagName !== "INPUT" || target.type !== "number" || target.disabled || target.readOnly) {
                return;
            }

            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();

                var currentVal = parseFloat(target.value);
                if (isNaN(currentVal)) currentVal = 0;

                var step = parseFloat(target.step) || 1;
                var multiplier = e.shiftKey ? 10 : (e.altKey ? 0.1 : 1);
                var delta = (e.key === "ArrowUp" ? 1 : -1) * step * multiplier;

                var min = (target.min !== "" && target.min !== null) ? parseFloat(target.min) : null;
                var max = (target.max !== "" && target.max !== null) ? parseFloat(target.max) : null;

                var newVal = currentVal + delta;
                if (min !== null && newVal < min) newVal = min;
                if (max !== null && newVal > max) newVal = max;

                var decimals = (step.toString().split(".")[1] || "").length;
                if (multiplier < 1) decimals = Math.max(decimals + 1, 1);
                target.value = decimals > 0 ? newVal.toFixed(decimals) : Math.round(newVal);

                target.dispatchEvent(new Event("input", { bubbles: true }));
                target.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });
    }

    /* ==========================================================================
       COMPONENTE REUTILIZABLE: CUSTOM DROPDOWNS
       Sustituye el menú nativo del sistema operativo (que pinta hover azul)
       por un menú 100% integrado al tema oscuro con micro-interacciones.
       Preserva todos los eventos, valores y selectores de los <select> originales.
       ========================================================================== */
    function initCustomDropdowns() {
        var selects = document.querySelectorAll("select.custom-select");
        selects.forEach(function (select) {
            if (select.getAttribute("data-customized") === "true") return;
            select.setAttribute("data-customized", "true");

            // Ocultar de manera accesible el select nativo
            select.classList.add("custom-select-hidden");

            // Crear el contenedor custom dropdown
            var container = document.createElement("div");
            container.className = "custom-dropdown";
            container.setAttribute("data-for", select.id || "");

            // Botón de activación (trigger)
            var trigger = document.createElement("button");
            trigger.type = "button";
            trigger.className = "custom-dropdown-trigger";

            var textSpan = document.createElement("span");
            textSpan.className = "custom-dropdown-text";
            var selectedOpt = select.options[select.selectedIndex] || select.options[0];
            textSpan.textContent = selectedOpt ? selectedOpt.text : "";

            var chevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            chevronSvg.setAttribute("class", "custom-dropdown-chevron");
            chevronSvg.setAttribute("width", "11");
            chevronSvg.setAttribute("height", "11");
            chevronSvg.setAttribute("viewBox", "0 0 24 24");
            chevronSvg.setAttribute("fill", "none");
            chevronSvg.setAttribute("stroke", "currentColor");
            chevronSvg.setAttribute("stroke-width", "2.2");
            chevronSvg.setAttribute("stroke-linecap", "round");
            chevronSvg.setAttribute("stroke-linejoin", "round");
            var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            polyline.setAttribute("points", "6 9 12 15 18 9");
            chevronSvg.appendChild(polyline);

            trigger.appendChild(textSpan);
            trigger.appendChild(chevronSvg);

            // Menú flotante de opciones
            var menu = document.createElement("div");
            menu.className = "custom-dropdown-menu";
            menu.style.display = "none";

            function buildMenuItems() {
                menu.innerHTML = "";
                for (var i = 0; i < select.options.length; i++) {
                    var opt = select.options[i];
                    var item = document.createElement("div");
                    item.className = "custom-dropdown-item" + (opt.selected ? " active" : "");
                    item.setAttribute("data-value", opt.value);

                    var itemText = document.createElement("span");
                    itemText.textContent = opt.text;
                    item.appendChild(itemText);

                    var checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    checkSvg.setAttribute("class", "custom-dropdown-check");
                    checkSvg.setAttribute("width", "10");
                    checkSvg.setAttribute("height", "10");
                    checkSvg.setAttribute("viewBox", "0 0 24 24");
                    checkSvg.setAttribute("fill", "none");
                    checkSvg.setAttribute("stroke", "currentColor");
                    checkSvg.setAttribute("stroke-width", "2.5");
                    checkSvg.setAttribute("stroke-linecap", "round");
                    checkSvg.setAttribute("stroke-linejoin", "round");
                    var checkPoly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                    checkPoly.setAttribute("points", "20 6 9 17 4 12");
                    checkSvg.appendChild(checkPoly);
                    item.appendChild(checkSvg);

                    (function (val, txt) {
                        item.addEventListener("click", function (e) {
                            e.stopPropagation();
                            select.value = val;
                            textSpan.textContent = txt;
                            closeDropdown();
                            var allItems = menu.querySelectorAll(".custom-dropdown-item");
                            allItems.forEach(function (it) {
                                it.classList.toggle("active", it.getAttribute("data-value") === val);
                            });
                            select.dispatchEvent(new Event("change", { bubbles: true }));
                            select.dispatchEvent(new Event("input", { bubbles: true }));
                        });
                    })(opt.value, opt.text);

                    menu.appendChild(item);
                }
            }

            buildMenuItems();

            function toggleDropdown(e) {
                e.stopPropagation();
                var isOpen = (menu.style.display === "flex");
                closeAllCustomDropdowns();
                if (!isOpen) {
                    menu.style.display = "flex";
                    container.classList.add("open");
                }
            }

            function closeDropdown() {
                menu.style.display = "none";
                container.classList.remove("open");
            }

            trigger.addEventListener("click", toggleDropdown);

            // Sincronizar automáticamente si el código JS cambia el valor del select
            select.addEventListener("change", function () {
                var curOpt = select.options[select.selectedIndex];
                if (curOpt) {
                    textSpan.textContent = curOpt.text;
                    var allItems = menu.querySelectorAll(".custom-dropdown-item");
                    allItems.forEach(function (it) {
                        it.classList.toggle("active", it.getAttribute("data-value") === select.value);
                    });
                }
            });

            container.appendChild(trigger);
            container.appendChild(menu);

            if (select.parentNode) {
                select.parentNode.insertBefore(container, select.nextSibling);
            }
        });
    }

    function closeAllCustomDropdowns() {
        var openMenus = document.querySelectorAll(".custom-dropdown-menu");
        openMenus.forEach(function (m) { m.style.display = "none"; });
        var openContainers = document.querySelectorAll(".custom-dropdown.open");
        openContainers.forEach(function (c) { c.classList.remove("open"); });
    }

    document.addEventListener("click", function () {
        closeAllCustomDropdowns();
    });

    // Recarga rápida en desarrollo con F5 o Ctrl+R
    window.addEventListener("keydown", function(e) {
        if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"))) {
            e.preventDefault();
            window.location.reload();
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
