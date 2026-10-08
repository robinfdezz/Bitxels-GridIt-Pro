//@include "constructionHost.jsx"

/**
 * BitGrid Pro - Motor Backend ExtendScript
 * Target: Adobe Illustrator (CC 2022 - 2026+)
 */

#target illustrator

var GridItHost = (function () {
    'use strict';

    var JSONHelper = {
        stringify: function (obj) {
            var t = typeof obj;
            if (t !== "object" || obj === null) {
                if (t === "string") return '"' + obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
                return String(obj);
            } else {
                var json = [],
                    isArray = (obj && obj.constructor === Array);
                for (var n in obj) {
                    if (obj.hasOwnProperty(n)) {
                        var v = obj[n];
                        t = typeof v;
                        if (t === "string") v = '"' + v.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
                        else if (t === "object" && v !== null) v = JSONHelper.stringify(v);
                        json.push((isArray ? "" : '"' + n + '":') + String(v));
                    }
                }
                return (isArray ? "[" : "{") + String(json) + (isArray ? "]" : "}");
            }
        },
        parse: function (str) {
            try {
                return eval('(' + str + ')');
            } catch (e) {
                return null;
            }
        }
    };

    function getActiveDocument() {
        if (app.documents.length === 0) {
            return null;
        }
        return app.activeDocument;
    }

    function getOrCreateLayer(doc, layerName) {
        var layer = null;
        try {
            layer = doc.layers.getByName(layerName);
        } catch (e) {
            layer = doc.layers.add();
            layer.name = layerName;
        }
        layer.locked = false;
        layer.visible = true;
        return layer;
    }

    /**
     * Limpia únicamente los elementos de la mesa de trabajo activa sin destruir las demás mesas
     */
    function clearTargetScopeItems(layer, targetScope, doc, clearPrev) {
        if (!clearPrev || !layer) return;

        var abIndex = doc.artboards.getActiveArtboardIndex();
        var abRect = doc.artboards[abIndex].artboardRect;
        var abL = abRect[0];
        var abT = abRect[1];
        var abR = abRect[2];
        var abB = abRect[3];

        var total = layer.pageItems.length;
        for (var i = total - 1; i >= 0; i--) {
            var item = layer.pageItems[i];
            try {
                var b = item.visibleBounds;
                var itemL = b[0];
                var itemT = b[1];
                var itemR = b[2];
                var itemB = b[3];

                if (targetScope === "selection" && doc.selection && doc.selection.length > 0) {
                    // Si es selección, solo borrar lo que intersecte con la selección
                    var selBounds = [Infinity, -Infinity, -Infinity, Infinity];
                    for (var s = 0; s < doc.selection.length; s++) {
                        var sb = doc.selection[s].visibleBounds;
                        if (sb[0] < selBounds[0]) selBounds[0] = sb[0];
                        if (sb[1] > selBounds[1]) selBounds[1] = sb[1];
                        if (sb[2] > selBounds[2]) selBounds[2] = sb[2];
                        if (sb[3] < selBounds[3]) selBounds[3] = sb[3];
                    }
                    var outSel = (itemR < selBounds[0] || itemL > selBounds[2] || itemB > selBounds[1] || itemT < selBounds[3]);
                    if (!outSel) {
                        item.remove();
                    }
                } else {
                    // Tanto para "artboard" (Mesa Completa) como para "custom" (Matriz Centrada):
                    // Ambos se ubican en la mesa de trabajo activa, por lo que SOLO se eliminan
                    // los elementos de esta mesa, preservando intactas las demás mesas.
                    var outsideAb = (itemR < abL || itemL > abR || itemB > abT || itemT < abB);
                    if (!outsideAb) {
                        item.remove();
                    }
                }
            } catch (err) {
                // Protección contra elementos bloqueados o no accesibles
            }
        }
    }

    function getTargetBounds(doc, targetScope, cols, rows, spacing) {
        if (targetScope === "selection" && doc.selection && doc.selection.length > 0) {
            var selBounds = [Infinity, -Infinity, -Infinity, Infinity];
            for (var s = 0; s < doc.selection.length; s++) {
                var b = doc.selection[s].visibleBounds;
                if (b[0] < selBounds[0]) selBounds[0] = b[0];
                if (b[1] > selBounds[1]) selBounds[1] = b[1];
                if (b[2] > selBounds[2]) selBounds[2] = b[2];
                if (b[3] < selBounds[3]) selBounds[3] = b[3];
            }
            return selBounds;
        }

        if (targetScope === "custom") {
            var abIndex = doc.artboards.getActiveArtboardIndex();
            var abRect = doc.artboards[abIndex].artboardRect;
            var abW = Math.abs(abRect[2] - abRect[0]);
            var abH = Math.abs(abRect[1] - abRect[3]);
            var gridW = cols * spacing;
            var gridH = rows * spacing;
            var centerX = abRect[0] + (abW / 2);
            var centerY = abRect[1] - (abH / 2);

            return [
                centerX - (gridW / 2),
                centerY + (gridH / 2),
                centerX + (gridW / 2),
                centerY - (gridH / 2)
            ];
        }

        var activeAb = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        return activeAb.artboardRect;
    }

    /**
     * Convierte cadena hexadecimal (#RRGGBB) a valores RGB
     */
    function parseHexToRgb(hexStr) {
        if (!hexStr) return { r: 16, g: 185, b: 129 };
        var clean = String(hexStr).replace("#", "");
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

    /**
     * Aplica el estilo al trazado sin errores de referencia
     */
    
    /**
     * Algoritmo de recorte de líneas al rectángulo de la mesa/matriz (Cohen-Sutherland)
     * Evita que las diagonales a 30° se salgan de la mesa de trabajo o invadan otras mesas
     */
    function computeOutCode(x, y, xmin, ymin, xmax, ymax) {
        var code = 0;
        if (x < xmin) code |= 1;
        else if (x > xmax) code |= 2;
        if (y < ymin) code |= 4;
        else if (y > ymax) code |= 8;
        return code;
    }

    function clipLineToRect(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
        var code0 = computeOutCode(x0, y0, xmin, ymin, xmax, ymax);
        var code1 = computeOutCode(x1, y1, xmin, ymin, xmax, ymax);
        var accept = false;
        var iter = 0;

        while (iter < 20) {
            iter++;
            if ((code0 | code1) === 0) {
                accept = true;
                break;
            } else if ((code0 & code1) !== 0) {
                break;
            } else {
                var codeOut = code0 ? code0 : code1;
                var x = 0, y = 0;

                if (codeOut & 8) { // Top (ymax)
                    x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0);
                    y = ymax;
                } else if (codeOut & 4) { // Bottom (ymin)
                    x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0);
                    y = ymin;
                } else if (codeOut & 2) { // Right (xmax)
                    y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0);
                    x = xmax;
                } else if (codeOut & 1) { // Left (xmin)
                    y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0);
                    x = xmin;
                }

                if (codeOut === code0) {
                    x0 = x;
                    y0 = y;
                    code0 = computeOutCode(x0, y0, xmin, ymin, xmax, ymax);
                } else {
                    x1 = x;
                    y1 = y;
                    code1 = computeOutCode(x1, y1, xmin, ymin, xmax, ymax);
                }
            }
        }

        if (accept) {
            return [[x0, y0], [x1, y1]];
        }
        return null;
    }

    function applyPathStyle(pathItem, isGuide, strokeW, strokeColorHex, opacity) {
        if (isGuide) {
            pathItem.guides = true;
            pathItem.filled = false;
        } else {
            pathItem.guides = false;
            pathItem.filled = false;
            pathItem.stroked = true;
            pathItem.strokeWidth = (typeof strokeW === "number" && strokeW > 0) ? strokeW : 0.5;

            var rgb = parseHexToRgb(strokeColorHex);
            var col = new RGBColor();
            col.red = rgb.r;
            col.green = rgb.g;
            col.blue = rgb.b;
            pathItem.strokeColor = col;
            if (typeof opacity === "number" && opacity >= 0 && opacity <= 100) {
                pathItem.opacity = opacity;
            }
        }
    }

    return {
        ping: function () {
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    hasDocument: false,
                    message: "No hay ningun documento abierto en Illustrator."
                });
            }
            return JSONHelper.stringify({
                success: true,
                hasDocument: true,
                documentName: doc.name,
                artboardsCount: doc.artboards.length
            });
        },

        hasBaseGrid: function (layerName) {
            var doc = getActiveDocument();
            if (!doc) return "false";
            var target = layerName || "BitGrid_Custom_Layer";
            for (var l = 0; l < doc.layers.length; l++) {
                if (doc.layers[l].name === target && doc.layers[l].pageItems.length > 0) {
                    return "true";
                }
            }
            return "false";
        },

        updateBaseGridStyles: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    message: "No hay documento abierto."
                });
            }

            var layerName = params.layerName || "BitGrid_Custom_Layer";
            var targetLayer = null;
            for (var l = 0; l < doc.layers.length; l++) {
                if (doc.layers[l].name === layerName) {
                    targetLayer = doc.layers[l];
                    break;
                }
            }

            if (!targetLayer || targetLayer.pageItems.length === 0) {
                return JSONHelper.stringify({
                    success: true,
                    updatedCount: 0,
                    needRegenerate: true
                });
            }

            var strokeW = Number(params.strokeWidth) || 0.5;
            var strokeColor = params.strokeColor || "#10B981";
            var opacity = (typeof params.opacity === "number") ? params.opacity : 100;

            var rgb = parseHexToRgb(strokeColor);
            var col = new RGBColor();
            col.red = rgb.r;
            col.green = rgb.g;
            col.blue = rgb.b;

            var abIndex = doc.artboards.getActiveArtboardIndex();
            var abRect = doc.artboards[abIndex].artboardRect;
            var abL = abRect[0];
            var abT = abRect[1];
            var abR = abRect[2];
            var abB = abRect[3];

            function applyToItem(item) {
                if (item.typename === "GroupItem") {
                    for (var g = 0; g < item.pageItems.length; g++) {
                        applyToItem(item.pageItems[g]);
                    }
                } else if (item.typename === "PathItem" || item.typename === "CompoundPathItem") {
                    if (!item.guides) {
                        item.stroked = true;
                        item.filled = false;
                        item.strokeWidth = strokeW;
                        item.strokeColor = col;
                        item.opacity = opacity;
                    }
                }
            }

            var count = 0;
            for (var i = 0; i < targetLayer.pageItems.length; i++) {
                var pItem = targetLayer.pageItems[i];
                try {
                    var b = pItem.visibleBounds;
                    var outsideAb = (b[2] < abL || b[0] > abR || b[3] > abT || b[1] < abB);
                    if (!outsideAb) {
                        applyToItem(pItem);
                        count++;
                    }
                } catch(e) {}
            }

            app.redraw();

            return JSONHelper.stringify({
                success: true,
                updatedCount: count,
                needRegenerate: (count === 0)
            });
        },

        generateSquareGrid: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Error: Abre o crea un documento antes de generar cuadriculas."
                });
            }

            try {
                var spacing = Number(params.spacing) || 40;
                var layerName = params.layerName || "BitGrid_Custom_Layer";
                var isGuide = (params.makeGuides !== false);
                var clearPrev = (params.clearPrevious !== false);
                var shouldGroup = (params.groupResult !== false);
                var diagonals = !!params.diagonals;
                var strokeW = Number(params.strokeWidth) || 0.5;
                var strokeColor = params.strokeColor || "#10B981";
                var opacity = (typeof params.opacity === "number") ? params.opacity : 100;

                var targetLayer = getOrCreateLayer(doc, layerName);
                clearTargetScopeItems(targetLayer, params.targetScope || "artboard", doc, clearPrev);
                var container = targetLayer;
                if (shouldGroup) {
                    var gridGroup = targetLayer.groupItems.add();
                    var abNum = doc.artboards.getActiveArtboardIndex() + 1;
                    gridGroup.name = "BitGrid_Cuadrada_Mesa" + abNum + "_" + Math.round(spacing) + "pt";
                    container = gridGroup;
                }

                var bounds = getTargetBounds(doc, params.targetScope, Number(params.cols) || 10, Number(params.rows) || 10, spacing);
                var left = bounds[0];
                var top = bounds[1];
                var right = bounds[2];
                var bottom = bounds[3];
                var lineCount = 0;

                // Líneas Verticales
                for (var x = left; x <= right + 0.1; x += spacing) {
                    var vLine = container.pathItems.add();
                    vLine.setEntirePath([[x, top], [x, bottom]]);
                    applyPathStyle(vLine, isGuide, strokeW, strokeColor, opacity);
                    lineCount++;
                }

                // Líneas Horizontales
                for (var y = top; y >= bottom - 0.1; y -= spacing) {
                    var hLine = container.pathItems.add();
                    hLine.setEntirePath([[left, y], [right, y]]);
                    applyPathStyle(hLine, isGuide, strokeW, strokeColor, opacity);
                    lineCount++;
                }

                // Diagonales opcionales
                if (diagonals) {
                    var diag1 = container.pathItems.add();
                    diag1.setEntirePath([[left, top], [right, bottom]]);
                    applyPathStyle(diag1, isGuide, strokeW, strokeColor, opacity);

                    var diag2 = container.pathItems.add();
                    diag2.setEntirePath([[left, bottom], [right, top]]);
                    applyPathStyle(diag2, isGuide, strokeW, strokeColor, opacity);
                    lineCount += 2;
                }

                app.redraw();

                return JSONHelper.stringify({
                    success: true,
                    type: "Cuadrada",
                    elementsCount: lineCount,
                    layerName: layerName,
                    message: "Se generaron " + lineCount + " lineas con exito."
                });

            } catch (err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Excepcion al crear malla cuadrada: " + err.toString()
                });
            }
        },

                generateIsometricGrid: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Error: No hay documento activo."
                });
            }

            try {
                var spacing = Number(params.spacing) || 40;
                var layerName = params.layerName || "BitGrid_Custom_Layer";
                var isGuide = (params.makeGuides !== false);
                var clearPrev = (params.clearPrevious !== false);
                var shouldGroup = (params.groupResult !== false);
                var strokeW = Number(params.strokeWidth) || 0.5;
                var strokeColor = params.strokeColor || "#10B981";
                var opacity = (typeof params.opacity === "number") ? params.opacity : 100;

                var targetLayer = getOrCreateLayer(doc, layerName);
                clearTargetScopeItems(targetLayer, params.targetScope || "artboard", doc, clearPrev);
                var container = targetLayer;
                if (shouldGroup) {
                    var isoGroup = targetLayer.groupItems.add();
                    var abNumIso = doc.artboards.getActiveArtboardIndex() + 1;
                    isoGroup.name = "BitGrid_Isometrica_Mesa" + abNumIso + "_" + Math.round(spacing) + "pt";
                    container = isoGroup;
                }

                var bounds = getTargetBounds(doc, params.targetScope, Number(params.cols) || 12, Number(params.rows) || 12, spacing);
                var left = bounds[0];
                var top = bounds[1];
                var right = bounds[2];
                var bottom = bounds[3];

                var width = Math.abs(right - left);
                var height = Math.abs(top - bottom);
                var yMin = Math.min(top, bottom);
                var yMax = Math.max(top, bottom);

                var cx = left + (width / 2);
                var cy = yMin + (height / 2);

                var tan30 = Math.tan((30 * Math.PI) / 180);
                var m = tan30;
                var V = 2 * spacing * m;
                var lineCount = 0;

                // 1. Ejes Verticales (Centrados simétricamente en cx)
                var xCoords = [];
                for (var xL = cx; xL >= left - 0.001; xL -= spacing) {
                    xCoords.push(xL);
                }
                for (var xR = cx + spacing; xR <= right + 0.001; xR += spacing) {
                    xCoords.push(xR);
                }

                for (var i = 0; i < xCoords.length; i++) {
                    var vx = xCoords[i];
                    var vLine = container.pathItems.add();
                    vLine.setEntirePath([[vx, yMax], [vx, yMin]]);
                    applyPathStyle(vLine, isGuide, strokeW, strokeColor, opacity);
                    lineCount++;
                }

                // Cálculo del rango de períodos verticales para cubrir el área
                var halfW = width / 2;
                var halfH = height / 2;
                var spanK = Math.ceil((halfH + (m * halfW)) / V) + 2;

                // 2. Diagonales a +30° (Concurrencia exacta en los nodos de los ejes verticales)
                for (var k = -spanK; k <= spanK; k++) {
                    var yAtLeft = -m * halfW + cy + (k * V);
                    var yAtRight = m * halfW + cy + (k * V);

                    var ptsUp = clipLineToRect(left, yAtLeft, right, yAtRight, left, yMin, right, yMax);
                    if (ptsUp) {
                        var isoUp = container.pathItems.add();
                        isoUp.setEntirePath(ptsUp);
                        applyPathStyle(isoUp, isGuide, strokeW, strokeColor, opacity);
                        lineCount++;
                    }
                }

                // 3. Diagonales a -30° (Concurrencia exacta formando estrellas de 6 puntas perfectas)
                for (var j = -spanK; j <= spanK; j++) {
                    var yAtLeft2 = m * halfW + cy + (j * V);
                    var yAtRight2 = -m * halfW + cy + (j * V);

                    var ptsDown = clipLineToRect(left, yAtLeft2, right, yAtRight2, left, yMin, right, yMax);
                    if (ptsDown) {
                        var isoDown = container.pathItems.add();
                        isoDown.setEntirePath(ptsDown);
                        applyPathStyle(isoDown, isGuide, strokeW, strokeColor, opacity);
                        lineCount++;
                    }
                }

                app.redraw();

                return JSONHelper.stringify({
                    success: true,
                    type: "Isometrica",
                    elementsCount: lineCount,
                    layerName: layerName,
                    message: "Malla isometrica generada con exito (" + lineCount + " ejes triaxiales concurrentes)."
                });

            } catch (err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Excepcion al crear malla isometrica: " + err.toString()
                });
            }
        },

        generateGoldenCircles: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Error: No hay documento activo."
                });
            }

            try {
                var layerName = params.layerName || "BitGrid_Custom_Layer";
                var isGuide = (params.makeGuides !== false);
                var clearPrev = (params.clearPrevious !== false);
                var shouldGroup = (params.groupResult !== false);
                var strokeW = Number(params.strokeWidth) || 0.5;
                var strokeColor = params.strokeColor || "#10B981";
                var baseUnit = Number(params.spacing) || 30;
                var opacity = (typeof params.opacity === "number") ? params.opacity : 100;

                var targetLayer = getOrCreateLayer(doc, layerName);
                clearTargetScopeItems(targetLayer, params.targetScope || "artboard", doc, clearPrev);
                var container = targetLayer;
                if (shouldGroup) {
                    var goldenGroup = targetLayer.groupItems.add();
                    var abNumGold = doc.artboards.getActiveArtboardIndex() + 1;
                    goldenGroup.name = "BitGrid_RazonAurea_Mesa" + abNumGold + "_" + Math.round(baseUnit) + "pt";
                    container = goldenGroup;
                }

                var bounds = getTargetBounds(doc, params.targetScope, 10, 10, baseUnit);
                var centerX = bounds[0] + (Math.abs(bounds[2] - bounds[0]) / 2);
                var centerY = bounds[1] - (Math.abs(bounds[1] - bounds[3]) / 2);

                var fibSteps = [1, 2, 3, 5, 8, 13, 21, 34];
                var count = 0;

                for (var i = 0; i < fibSteps.length; i++) {
                    var radius = (fibSteps[i] * baseUnit) / 2;
                    var diameter = radius * 2;
                    var circle = container.pathItems.ellipse(
                        centerY + radius,
                        centerX - radius,
                        diameter,
                        diameter
                    );
                    applyPathStyle(circle, isGuide, strokeW, strokeColor, opacity);
                    count++;
                }

                var crosshairSize = baseUnit * 2;
                var hCross = container.pathItems.add();
                hCross.setEntirePath([[centerX - crosshairSize, centerY], [centerX + crosshairSize, centerY]]);
                applyPathStyle(hCross, isGuide, strokeW, strokeColor, opacity);

                var vCross = container.pathItems.add();
                vCross.setEntirePath([[centerX, centerY + crosshairSize], [centerX, centerY - crosshairSize]]);
                applyPathStyle(vCross, isGuide, strokeW, strokeColor, opacity);
                count += 2;

                app.redraw();

                return JSONHelper.stringify({
                    success: true,
                    type: "Razon Aurea",
                    elementsCount: count,
                    layerName: layerName,
                    message: "Circulos aureos y cruz de construccion generados (" + count + " elementos)."
                });

            } catch (err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Excepcion al crear circulos aureos: " + err.toString()
                });
            }
        },

        
                /**
         * Genera una malla hexagonal perfecta (honeycomb) en Illustrator
         * - Vértice vertical (pointy-topped, 30°) o Cara plana (flat-topped, 0°)
         * - Celdas cerradas individuales (pathItem.closed = true) para fácil coloreado/relleno
         * - Opcional: Radios/ejes internos de subdivisión en 6 triángulos equiláteros
         * - Compatible con: Mesa de trabajo activa (artboard), Matriz centrada (custom cols x rows), o Selección
         */
        generateHexagonalGrid: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Error: No hay documento activo."
                });
            }

            try {
                var radius = Number(params.spacing) || 40;
                if (radius < 1) radius = 1;
                var orientation = (params.orientation === "flat") ? "flat" : "pointy";
                var innerSpokes = !!params.innerSpokes;
                var layerName = params.layerName || "BitGrid_Custom_Layer";
                var isGuide = (params.makeGuides !== false);
                var clearPrev = (params.clearPrevious !== false);
                var shouldGroup = (params.groupResult !== false);
                var strokeW = Number(params.strokeWidth) || 0.5;
                var strokeColor = params.strokeColor || "#10B981";
                var opacity = (typeof params.opacity === "number") ? params.opacity : 100;
                var targetScope = params.targetScope || "artboard";
                var cols = Math.max(1, parseInt(params.cols, 10) || 12);
                var rows = Math.max(1, parseInt(params.rows, 10) || 12);

                var targetLayer = getOrCreateLayer(doc, layerName);
                clearTargetScopeItems(targetLayer, targetScope, doc, clearPrev);
                var container = targetLayer;
                if (shouldGroup) {
                    var hexGroup = targetLayer.groupItems.add();
                    var abNum = doc.artboards.getActiveArtboardIndex() + 1;
                    var orientLabel = (orientation === "pointy") ? "Vertical" : "Plana";
                    hexGroup.name = "BitGrid_Hexagonal_" + orientLabel + "_Mesa" + abNum + "_" + Math.round(radius) + "pt";
                    container = hexGroup;
                }

                // Helper para crear un hexágono cerrado con o sin radios internos
                var baseAngle = (orientation === "pointy") ? 90 : 0;
                /**
                 * Algoritmo Sutherland-Hodgman para recortar polígonos a los límites de la mesa
                 */
                function clipPolygonToRect(points, xmin, ymin, xmax, ymax) {
                    var out = points;

                    function clipEdge(list, insideFn, intersectFn) {
                        var res = [];
                        if (list.length === 0) return res;
                        var prev = list[list.length - 1];
                        var prevIn = insideFn(prev);
                        for (var i = 0; i < list.length; i++) {
                            var curr = list[i];
                            var currIn = insideFn(curr);
                            if (currIn) {
                                if (!prevIn) res.push(intersectFn(prev, curr));
                                res.push(curr);
                            } else if (prevIn) {
                                res.push(intersectFn(prev, curr));
                            }
                            prev = curr;
                            prevIn = currIn;
                        }
                        return res;
                    }

                    // 1. Izquierda (x >= xmin)
                    out = clipEdge(out, function(p) { return p[0] >= xmin; }, function(p1, p2) {
                        return [xmin, p1[1] + (p2[1] - p1[1]) * (xmin - p1[0]) / (p2[0] - p1[0])];
                    });
                    // 2. Derecha (x <= xmax)
                    out = clipEdge(out, function(p) { return p[0] <= xmax; }, function(p1, p2) {
                        return [xmax, p1[1] + (p2[1] - p1[1]) * (xmax - p1[0]) / (p2[0] - p1[0])];
                    });
                    // 3. Inferior (y >= ymin)
                    out = clipEdge(out, function(p) { return p[1] >= ymin; }, function(p1, p2) {
                        return [p1[0] + (p2[0] - p1[0]) * (ymin - p1[1]) / (p2[1] - p1[1]), ymin];
                    });
                    // 4. Superior (y <= ymax)
                    out = clipEdge(out, function(p) { return p[1] <= ymax; }, function(p1, p2) {
                        return [p1[0] + (p2[0] - p1[0]) * (ymax - p1[1]) / (p2[1] - p1[1]), ymax];
                    });

                    // Limpiar vértices duplicados consecutivos
                    if (out.length < 2) return out;
                    var clean = [out[0]];
                    for (var k = 1; k < out.length; k++) {
                        var pPrev = clean[clean.length - 1];
                        var pCurr = out[k];
                        if (Math.abs(pPrev[0] - pCurr[0]) > 0.01 || Math.abs(pPrev[1] - pCurr[1]) > 0.01) {
                            clean.push(pCurr);
                        }
                    }
                    if (clean.length > 2) {
                        if (Math.abs(clean[0][0] - clean[clean.length - 1][0]) < 0.01 &&
                            Math.abs(clean[0][1] - clean[clean.length - 1][1]) < 0.01) {
                            clean.pop();
                        }
                    }
                    return clean;
                }

                function createHexCell(parentGroup, hx, hy, r, withSpokes, clipBounds) {
                    var pts = [];
                    for (var i = 0; i < 6; i++) {
                        var rad = (baseAngle + i * 60) * Math.PI / 180;
                        pts.push([hx + r * Math.cos(rad), hy + r * Math.sin(rad)]);
                    }

                    var finalPts = pts;
                    if (clipBounds) {
                        finalPts = clipPolygonToRect(pts, clipBounds[0], clipBounds[1], clipBounds[2], clipBounds[3]);
                        if (finalPts.length < 3) return false;
                    }

                    var hexItem = parentGroup.pathItems.add();
                    hexItem.setEntirePath(finalPts);
                    hexItem.closed = true;
                    applyPathStyle(hexItem, isGuide, strokeW, strokeColor, opacity);

                    if (withSpokes) {
                        for (var s = 0; s < 3; s++) {
                            var pA = pts[s];
                            var pB = pts[s + 3];
                            var spokePts = [pA, pB];
                            if (clipBounds) {
                                spokePts = clipLineToRect(pA[0], pA[1], pB[0], pB[1], clipBounds[0], clipBounds[1], clipBounds[2], clipBounds[3]);
                            }
                            if (spokePts) {
                                var spoke = parentGroup.pathItems.add();
                                spoke.setEntirePath(spokePts);
                                applyPathStyle(spoke, isGuide, strokeW, strokeColor, opacity);
                            }
                        }
                    }
                    return true;
                }

                var hexCount = 0;

                if (targetScope === "custom") {
                    // Matriz Centrada (cols x rows)
                    var abIndex = doc.artboards.getActiveArtboardIndex();
                    var abRect = doc.artboards[abIndex].artboardRect;
                    var cx = abRect[0] + Math.abs(abRect[2] - abRect[0]) / 2;
                    var cy = abRect[1] - Math.abs(abRect[1] - abRect[3]) / 2;

                    if (orientation === "pointy") {
                        var dx = Math.sqrt(3) * radius;
                        var dy = 1.5 * radius;
                        var midXOffset = (rows > 1) ? (dx / 4) : 0;

                        for (var r = 0; r < rows; r++) {
                            var hy = cy + ((rows - 1) / 2 - r) * dy;
                            var rowOffset = (r % 2 === 1) ? (dx / 2) : 0;
                            for (var c = 0; c < cols; c++) {
                                var hx = cx + (c - (cols - 1) / 2) * dx + rowOffset - midXOffset;
                                createHexCell(container, hx, hy, radius, innerSpokes);
                                hexCount++;
                            }
                        }
                    } else {
                        // flat-topped
                        var dx = 1.5 * radius;
                        var dy = Math.sqrt(3) * radius;
                        var midYOffset = (cols > 1) ? (dy / 4) : 0;

                        for (var c = 0; c < cols; c++) {
                            var hx = cx + (c - (cols - 1) / 2) * dx;
                            var colOffset = (c % 2 === 1) ? (dy / 2) : 0;
                            for (var r = 0; r < rows; r++) {
                                var hy = cy + ((rows - 1) / 2 - r) * dy + colOffset - midYOffset;
                                createHexCell(container, hx, hy, radius, innerSpokes);
                                hexCount++;
                            }
                        }
                    }
                } else {
                    // Llenado de Mesa de Trabajo (artboard) o Selección activa (selection)
                    var bounds = getTargetBounds(doc, targetScope, cols, rows, radius);
                    var xMin = Math.min(bounds[0], bounds[2]);
                    var xMax = Math.max(bounds[0], bounds[2]);
                    var yMin = Math.min(bounds[1], bounds[3]);
                    var yMax = Math.max(bounds[1], bounds[3]);
                    var w = xMax - xMin;
                    var h = yMax - yMin;
                    var cx = (xMin + xMax) / 2;
                    var cy = (yMin + yMax) / 2;

                    if (orientation === "pointy") {
                        var dx = Math.sqrt(3) * radius;
                        var dy = 1.5 * radius;
                        var maxR = Math.ceil((h / 2) / dy) + 1;
                        var maxC = Math.ceil((w / 2) / dx) + 1;

                        for (var r = -maxR; r <= maxR; r++) {
                            var hy = cy + r * dy;
                            var xOffset = ((r % 2 + 2) % 2 === 1) ? (dx / 2) : 0;
                            for (var c = -maxC - 1; c <= maxC + 1; c++) {
                                var hx = cx + c * dx + xOffset;
                                if (hx + radius >= xMin && hx - radius <= xMax && hy + radius >= yMin && hy - radius <= yMax) {
                                    if (createHexCell(container, hx, hy, radius, innerSpokes, [xMin, yMin, xMax, yMax])) hexCount++;
                                }
                            }
                        }
                    } else {
                        // flat-topped
                        var dx = 1.5 * radius;
                        var dy = Math.sqrt(3) * radius;
                        var maxC = Math.ceil((w / 2) / dx) + 1;
                        var maxR = Math.ceil((h / 2) / dy) + 1;

                        for (var c = -maxC; c <= maxC; c++) {
                            var hx = cx + c * dx;
                            var yOffset = ((c % 2 + 2) % 2 === 1) ? (dy / 2) : 0;
                            for (var r = -maxR - 1; r <= maxR + 1; r++) {
                                var hy = cy + r * dy + yOffset;
                                if (hx + radius >= xMin && hx - radius <= xMax && hy + radius >= yMin && hy - radius <= yMax) {
                                    if (createHexCell(container, hx, hy, radius, innerSpokes, [xMin, yMin, xMax, yMax])) hexCount++;
                                }
                            }
                        }
                    }
                }

                app.redraw();

                var spokeMsg = innerSpokes ? " con radios internos" : "";
                return JSONHelper.stringify({
                    success: true,
                    type: "Hexagonal",
                    elementsCount: hexCount,
                    layerName: layerName,
                    message: "Malla hexagonal (" + (orientation === "pointy" ? "Vertice vertical" : "Cara plana") + spokeMsg + ") generada con exito (" + hexCount + " celdas cerradas)."
                });

            } catch (err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Excepcion al crear malla hexagonal: " + err.toString()
                });
            }
        },

/**
         * Muestrea el color del objeto seleccionado en Illustrator (Cuentagotas nativo)
         */
        pickColorFromSelection: function() {
            try {
                var doc = getActiveDocument();
                if (!doc) {
                    return JSONHelper.stringify({
                        success: false,
                        message: "Abre un documento en Illustrator."
                    });
                }
                if (!doc.selection || doc.selection.length === 0) {
                    return JSONHelper.stringify({
                        success: false,
                        message: "Selecciona un objeto en Illustrator para muestrear su color."
                    });
                }
                var item = doc.selection[0];
                var col = null;
                if (item.stroked && item.strokeColor) {
                    col = item.strokeColor;
                } else if (item.filled && item.fillColor) {
                    col = item.fillColor;
                }
                if (!col) {
                    return JSONHelper.stringify({
                        success: false,
                        message: "El objeto seleccionado no tiene color visible."
                    });
                }
                var r = 0, g = 0, b = 0;
                if (col.typename === "RGBColor") {
                    r = Math.round(col.red);
                    g = Math.round(col.green);
                    b = Math.round(col.blue);
                } else if (col.typename === "CMYKColor") {
                    var c = col.cyan / 100, m = col.magenta / 100, y = col.yellow / 100, k = col.black / 100;
                    r = Math.round(255 * (1 - c) * (1 - k));
                    g = Math.round(255 * (1 - m) * (1 - k));
                    b = Math.round(255 * (1 - y) * (1 - k));
                } else if (col.typename === "GrayColor") {
                    var val = Math.round(255 * (1 - col.gray / 100));
                    r = val; g = val; b = val;
                } else {
                    return JSONHelper.stringify({
                        success: false,
                        message: "Tipo de color no compatible: " + col.typename
                    });
                }
                var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
                return JSONHelper.stringify({
                    success: true,
                    hex: hex,
                    r: r,
                    g: g,
                    b: b,
                    message: "Color tomado de Illustrator: " + hex
                });
            } catch(err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Error al muestrear color: " + err.toString()
                });
            }
        },
        clearGridLayer: function (layerName) {
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    message: "No hay documento activo para limpiar."
                });
            }

            try {
                var targetName = layerName || "BitGrid_Custom_Layer";
                var layer = doc.layers.getByName(targetName);
                layer.remove();
                app.redraw();
                return JSONHelper.stringify({
                    success: true,
                    message: "Capa '" + targetName + "' eliminada correctamente."
                });
            } catch (e) {
                return JSONHelper.stringify({
                    success: false,
                    message: "La capa no existia o ya fue eliminada."
                });
            }
        }
    };
})();
