/**
 * GridIt Studio - Controlador Frontend (Estilo Akrivi Studio)
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

        // DOM Elements
        var segBase = document.getElementById("seg-base");
        var segConstruction = document.getElementById("seg-construction");
        var segClearspace = document.getElementById("seg-clearspace");

        var viewBaseQuad = document.getElementById("view-base-quad");
        var viewConstructionQuad = document.getElementById("view-construction-quad");
        var viewClearspace = document.getElementById("view-clearspace");

        var quadItems = document.querySelectorAll("#view-base-quad .quad-item");
        var sliderSpacing = document.getElementById("slider-spacing");
        var valSpacing = document.getElementById("val-spacing");
        var inputCols = document.getElementById("input-cols");
        var inputRows = document.getElementById("input-rows");
        var selectScope = document.getElementById("select-scope");
        var toggleDiagonals = document.getElementById("toggle-diagonals");
        var toggleClearPrev = document.getElementById("toggle-clear-prev");

        var sliderClearspace = document.getElementById("slider-clearspace");
        var valClearspace = document.getElementById("val-clearspace");

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

        /* 1. Toggle AcordeÃ³n Personalizar */
        if (btnToggleAccordion && accordion) {
            btnToggleAccordion.addEventListener("click", function() {
                accordion.classList.toggle("open");
            });
        }

        /* 2. Control Segmentado (Base | ConstrucciÃ³n | Ãrea de Reserva) */
        var segmentBtns = [segBase, segConstruction, segClearspace];
        function setSegment(seg) {
            currentSegment = seg;
            segmentBtns.forEach(function(b) { if (b) b.classList.remove("active"); });

            if (viewBaseQuad) viewBaseQuad.style.display = (seg === "base") ? "grid" : "none";
            if (viewConstructionQuad) viewConstructionQuad.style.display = (seg === "construction") ? "grid" : "none";
            if (viewClearspace) viewClearspace.style.display = (seg === "clearspace") ? "flex" : "none";

            if (seg === "base" && segBase) segBase.classList.add("active");
            if (seg === "construction" && segConstruction) segConstruction.classList.add("active");
            if (seg === "clearspace" && segClearspace) segClearspace.classList.add("active");
        }

        if (segBase) segBase.addEventListener("click", function() { setSegment("base"); });
        if (segConstruction) segConstruction.addEventListener("click", function() { setSegment("construction"); });
        if (segClearspace) segClearspace.addEventListener("click", function() { setSegment("clearspace"); });

        /* 3. Selector de Tarjetas (Square, Isometric, Hexagon, Golden) */
        quadItems.forEach(function(card) {
            card.addEventListener("click", function() {
                quadItems.forEach(function(c) { c.classList.remove("active"); });
                card.classList.add("active");
                currentType = card.getAttribute("data-type");

                var boxColsRows = document.getElementById("box-cols-rows");
                if (currentType === "golden") {
                    if (boxColsRows) boxColsRows.style.display = "none";
                    setStatus("Seleccionado: RazÃ³n Ãurea (Fibonacci)", true);
                } else {
                    if (boxColsRows) boxColsRows.style.display = "grid";
                    setStatus("Seleccionado: Malla " + currentType.charAt(0).toUpperCase() + currentType.slice(1), true);
                }
            });
        });

        /* 4. Sliders en Vivo */
        if (sliderSpacing && valSpacing) {
            sliderSpacing.addEventListener("input", function() {
                valSpacing.textContent = parseFloat(sliderSpacing.value).toFixed(2);
            });
        }

        if (sliderClearspace && valClearspace) {
            sliderClearspace.addEventListener("input", function() {
                valClearspace.textContent = sliderClearspace.value + " pt";
            });
        }

        /* 5. Reiniciar */
        if (btnReset) {
            btnReset.addEventListener("click", function() {
                if (sliderSpacing) { sliderSpacing.value = 50; valSpacing.textContent = "50.00"; }
                if (inputCols) inputCols.value = 12;
                if (inputRows) inputRows.value = 12;
                if (toggleDiagonals) toggleDiagonals.checked = false;
                if (toggleClearPrev) toggleClearPrev.checked = true;
                setStatus("Valores reiniciados a los predeterminados.", true);
            });
        }

        /* 6. GeneraciÃ³n (Hacer GuÃ­as o Generar) */
        function executeGeneration(asGuides) {
            var params = {
                type: currentType,
                spacing: parseFloat(sliderSpacing ? sliderSpacing.value : 50),
                cols: parseInt(inputCols ? inputCols.value : 12, 10),
                rows: parseInt(inputRows ? inputRows.value : 12, 10),
                targetScope: selectScope ? selectScope.value : "artboard",
                makeGuides: asGuides,
                diagonals: toggleDiagonals ? toggleDiagonals.checked : false,
                clearPrevious: toggleClearPrev ? toggleClearPrev.checked : true,
                layerName: "GridIt_Custom_Layer",
                colorType: "cyan"
            };

            var method = "generateSquareGrid";
            if (currentType === "isometric") method = "generateIsometricGrid";
            else if (currentType === "golden") method = "generateGoldenCircles";
            else if (currentType === "hexagon") method = "generateIsometricGrid"; // base triaxial hexagonal

            setStatus("Generando mallas en Illustrator...", true);

            var scriptCall = "GridItHost." + method + "('" + JSON.stringify(params).replace(/'/g, "\\'") + "')";
            if (csInterface) {
                csInterface.evalScript(scriptCall, function(res) {
                    try {
                        var data = JSON.parse(res);
                        if (data.success) {
                            setStatus(data.message || "GuÃ­as generadas con Ã©xito.", true);
                        } else {
                            setStatus(data.message || "Error al generar guÃ­as.", false);
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
                    setStatus("GridIt Studio activo.", true);
                }
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();