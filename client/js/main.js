/**
 * BitGrid Pro - Controlador Frontend
 */

(function () {
    "use strict";

    function init() {
        var csInterface = null;
        try {
            csInterface = new CSInterface();
        } catch(e) {
            console.error("CSInterface fallo:", e);
        }

        var currentType = "square";
        var currentSegment = "base";
        var activeStrokeColor = "#10B981";

        // DOM Elements
        var segBase = document.getElementById("seg-base");
        var segConstruction = document.getElementById("seg-construction");
        var segClearspace = document.getElementById("seg-clearspace");

        var viewBaseQuad = document.getElementById("view-base-quad");
        var quadItems = document.querySelectorAll("#view-base-quad .quad-item");

        var sliderSpacing = document.getElementById("slider-spacing");
        var valSpacing = document.getElementById("val-spacing");

        var sliderStrokeWidth = document.getElementById("slider-stroke-width");
        var valStrokeWidth = document.getElementById("val-stroke-width");

        var swatchBtns = document.querySelectorAll(".swatch-btn");
        var inputCustomColor = document.getElementById("input-custom-color");

        var inputCols = document.getElementById("input-cols");
        var inputRows = document.getElementById("input-rows");
        var selectScope = document.getElementById("select-scope");
        var toggleDiagonals = document.getElementById("toggle-diagonals");
        var toggleClearPrev = document.getElementById("toggle-clear-prev");
        var toggleGroupResult = document.getElementById("toggle-group-result");

        var btnMakeGuides = document.getElementById("btn-make-guides");
        var btnGenerate = document.getElementById("btn-generate");
        var btnReset = document.getElementById("btn-reset");

        var accordion = document.getElementById("accordion-customize");
        var btnToggleAccordion = document.getElementById("btn-toggle-accordion");

        var statusText = document.getElementById("status-text");
        var statusDot = document.getElementById("status-dot");

        function setStatus(msg, isSuccess) {
            if (statusText) statusText.textContent = msg;
            if (statusDot) {
                statusDot.className = "status-dot" + (isSuccess ? "" : " error");
            }
        }

        /* 1. Toggle Acordeón Personalizar */
        if (btnToggleAccordion && accordion) {
            btnToggleAccordion.addEventListener("click", function() {
                accordion.classList.toggle("open");
            });
        }

        /* 2. Control Segmentado */
        var segmentBtns = [segBase, segConstruction, segClearspace];
        function setSegment(seg) {
            currentSegment = seg;
            segmentBtns.forEach(function(b) { if (b) b.classList.remove("active"); });
            if (seg === "base" && segBase) segBase.classList.add("active");
        }

        if (segBase) segBase.addEventListener("click", function() { setSegment("base"); });

        /* 3. Selector de Tarjetas (Square, Isometric, Hexagon, Golden) */
        quadItems.forEach(function(card) {
            card.addEventListener("click", function() {
                if (card.classList.contains("disabled-feature")) return;
                quadItems.forEach(function(c) { c.classList.remove("active"); });
                card.classList.add("active");
                currentType = card.getAttribute("data-type");

                var boxColsRows = document.getElementById("box-cols-rows");
                if (currentType === "golden") {
                    if (boxColsRows) boxColsRows.style.display = "none";
                    setStatus("Seleccionado: Razon Aurea (Fibonacci)", true);
                } else {
                    if (boxColsRows) boxColsRows.style.display = "grid";
                    var nameLabel = currentType.charAt(0).toUpperCase() + currentType.slice(1);
                    setStatus("Seleccionado: Malla " + nameLabel, true);
                }
            });
        });

        /* 4. Sliders en Vivo */
        if (sliderSpacing && valSpacing) {
            sliderSpacing.addEventListener("input", function() {
                valSpacing.textContent = parseFloat(sliderSpacing.value).toFixed(2);
            });
        }

        if (sliderStrokeWidth && valStrokeWidth) {
            sliderStrokeWidth.addEventListener("input", function() {
                valStrokeWidth.textContent = parseFloat(sliderStrokeWidth.value).toFixed(2) + " pt";
            });
        }

        
        /* 5. Selector de Color Personalizado Popover (100% In-Plugin, Dark Theme) */
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
                h *= 60;
            }
            return { h: h, s: s, v: v };
        }

        function rgbToHex(r, g, b) {
            var hexR = ("0" + r.toString(16)).slice(-2);
            var hexG = ("0" + g.toString(16)).slice(-2);
            var hexB = ("0" + b.toString(16)).slice(-2);
            return (hexR + hexG + hexB).toUpperCase();
        }

        function hexToRgb(hex) {
            var clean = hex.replace("#", "");
            if (clean.length === 3) {
                clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
            }
            var num = parseInt(clean, 16);
            if (isNaN(num)) return { r: 16, g: 185, b: 129 };
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
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
                applyHexColor(activeStrokeColor);
            });
        });

        /* 6. Reiniciar */
        if (btnReset) {
            btnReset.addEventListener("click", function() {
                if (sliderSpacing) { sliderSpacing.value = 50; valSpacing.textContent = "50.00"; }
                if (sliderStrokeWidth) { sliderStrokeWidth.value = 0.5; valStrokeWidth.textContent = "0.50 pt"; }
                if (inputCols) inputCols.value = 12;
                if (inputRows) inputRows.value = 12;
                if (toggleDiagonals) toggleDiagonals.checked = false;
                if (toggleClearPrev) toggleClearPrev.checked = true;
                if (toggleGroupResult) toggleGroupResult.checked = true;
                activeStrokeColor = "#10B981";
                swatchBtns.forEach(function(b) { b.classList.remove("active"); });
                if (swatchBtns[0]) swatchBtns[0].classList.add("active");
                applyHexColor("#10B981");
                if (colorPopover) colorPopover.style.display = "none";
                if (btnToggleColorPicker) btnToggleColorPicker.classList.remove("active");
                setStatus("Valores reiniciados a los predeterminados.", true);
            });
        }

        /* 7. Generación (Hacer Guías o Generar) */
        function executeGeneration(asGuides) {
            var params = {
                type: currentType,
                spacing: parseFloat(sliderSpacing ? sliderSpacing.value : 50),
                strokeWidth: parseFloat(sliderStrokeWidth ? sliderStrokeWidth.value : 0.5) || 0.5,
                strokeColor: activeStrokeColor || "#10B981",
                cols: parseInt(inputCols ? inputCols.value : 12, 10),
                rows: parseInt(inputRows ? inputRows.value : 12, 10),
                targetScope: selectScope ? selectScope.value : "artboard",
                makeGuides: asGuides,
                diagonals: toggleDiagonals ? toggleDiagonals.checked : false,
                clearPrevious: toggleClearPrev ? toggleClearPrev.checked : true,
                groupResult: toggleGroupResult ? toggleGroupResult.checked : true,
                layerName: "BitGrid_Custom_Layer"
            };

            var method = "generateSquareGrid";
            if (currentType === "isometric") method = "generateIsometricGrid";
            else if (currentType === "golden") method = "generateGoldenCircles";

            setStatus("Generando mallas en Illustrator...", true);

            var scriptCall = "GridItHost." + method + "('" + JSON.stringify(params).replace(/'/g, "\\'") + "')";
            if (csInterface) {
                csInterface.evalScript(scriptCall, function(res) {
                    try {
                        var data = JSON.parse(res);
                        if (data.success) {
                            setStatus(data.message || "Guias generadas con exito.", true);
                        } else {
                            setStatus(data.message || "Error al generar guias.", false);
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