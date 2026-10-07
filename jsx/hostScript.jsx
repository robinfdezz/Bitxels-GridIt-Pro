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

    function applyPathStyle(pathItem, isGuide, strokeW, strokeColorHex) {
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
                    applyPathStyle(vLine, isGuide, strokeW, strokeColor);
                    lineCount++;
                }

                // Líneas Horizontales
                for (var y = top; y >= bottom - 0.1; y -= spacing) {
                    var hLine = container.pathItems.add();
                    hLine.setEntirePath([[left, y], [right, y]]);
                    applyPathStyle(hLine, isGuide, strokeW, strokeColor);
                    lineCount++;
                }

                // Diagonales opcionales
                if (diagonals) {
                    var diag1 = container.pathItems.add();
                    diag1.setEntirePath([[left, top], [right, bottom]]);
                    applyPathStyle(diag1, isGuide, strokeW, strokeColor);

                    var diag2 = container.pathItems.add();
                    diag2.setEntirePath([[left, bottom], [right, top]]);
                    applyPathStyle(diag2, isGuide, strokeW, strokeColor);
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
                    applyPathStyle(vLine, isGuide, strokeW, strokeColor);
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
                        applyPathStyle(isoUp, isGuide, strokeW, strokeColor);
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
                        applyPathStyle(isoDown, isGuide, strokeW, strokeColor);
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
                    applyPathStyle(circle, isGuide, strokeW, strokeColor);
                    count++;
                }

                var crosshairSize = baseUnit * 2;
                var hCross = container.pathItems.add();
                hCross.setEntirePath([[centerX - crosshairSize, centerY], [centerX + crosshairSize, centerY]]);
                applyPathStyle(hCross, isGuide, strokeW, strokeColor);

                var vCross = container.pathItems.add();
                vCross.setEntirePath([[centerX, centerY + crosshairSize], [centerX, centerY - crosshairSize]]);
                applyPathStyle(vCross, isGuide, strokeW, strokeColor);
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
