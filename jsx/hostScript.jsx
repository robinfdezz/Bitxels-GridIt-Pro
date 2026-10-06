/**
 * GridIt Pro - Motor Backend ExtendScript
 * Idioma: EspaÃ±ol
 * Destino: Adobe Illustrator (CC 2020 - 2026+)
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

    function getOrCreateLayer(doc, layerName, clearPrevious) {
        var layer = null;
        try {
            layer = doc.layers.getByName(layerName);
            if (clearPrevious) {
                var total = layer.pageItems.length;
                for (var i = total - 1; i >= 0; i--) {
                    layer.pageItems[i].remove();
                }
            }
        } catch (e) {
            layer = doc.layers.add();
            layer.name = layerName;
        }
        layer.locked = false;
        layer.visible = true;
        return layer;
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

    function applyPathStyle(pathItem, isGuide, colorType) {
        if (isGuide) {
            pathItem.guides = true;
            pathItem.filled = false;
        } else {
            pathItem.guides = false;
            pathItem.filled = false;
            pathItem.stroked = true;
            pathItem.strokeWidth = 0.5;

            var strokeColor = new RGBColor();
            if (colorType === "magenta") {
                strokeColor.red = 255; strokeColor.green = 0; strokeColor.blue = 128;
            } else if (colorType === "green") {
                strokeColor.red = 0; strokeColor.green = 255; strokeColor.blue = 100;
            } else if (colorType === "amber") {
                strokeColor.red = 255; strokeColor.green = 170; strokeColor.blue = 0;
            } else {
                strokeColor.red = 0; strokeColor.green = 200; strokeColor.blue = 255;
            }
            pathItem.strokeColor = strokeColor;
        }
    }

    return {
        ping: function () {
            var doc = getActiveDocument();
            if (!doc) {
                return JSONHelper.stringify({
                    success: false,
                    hasDocument: false,
                    message: "No hay ningÃºn documento abierto en Illustrator."
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
                    message: "Error: Abre o crea un documento antes de generar cuadrÃ­culas."
                });
            }

            try {
                var spacing = Number(params.spacing) || 40;
                var layerName = params.layerName || "GridIt_Custom_Layer";
                var isGuide = (params.makeGuides !== false);
                var clearPrev = (params.clearPrevious !== false);
                var diagonals = !!params.diagonals;
                var colorType = params.colorType || "cyan";

                var targetLayer = getOrCreateLayer(doc, layerName, clearPrev);
                var bounds = getTargetBounds(doc, params.targetScope, Number(params.cols) || 10, Number(params.rows) || 10, spacing);

                var left = bounds[0];
                var top = bounds[1];
                var right = bounds[2];
                var bottom = bounds[3];
                var lineCount = 0;

                for (var x = left; x <= right + 0.1; x += spacing) {
                    var vLine = targetLayer.pathItems.add();
                    vLine.setEntirePath([[x, top], [x, bottom]]);
                    applyPathStyle(vLine, isGuide, colorType);
                    lineCount++;
                }

                for (var y = top; y >= bottom - 0.1; y -= spacing) {
                    var hLine = targetLayer.pathItems.add();
                    hLine.setEntirePath([[left, y], [right, y]]);
                    applyPathStyle(hLine, isGuide, colorType);
                    lineCount++;
                }

                if (diagonals) {
                    var diag1 = targetLayer.pathItems.add();
                    diag1.setEntirePath([[left, top], [right, bottom]]);
                    applyPathStyle(diag1, isGuide, colorType);

                    var diag2 = targetLayer.pathItems.add();
                    diag2.setEntirePath([[left, bottom], [right, top]]);
                    applyPathStyle(diag2, isGuide, colorType);
                    lineCount += 2;
                }

                app.redraw();

                return JSONHelper.stringify({
                    success: true,
                    type: "Cuadrada",
                    elementsCount: lineCount,
                    layerName: layerName,
                    message: "Se generaron " + lineCount + " guÃ­as cuadradas con Ã©xito."
                });

            } catch (err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "ExcepciÃ³n al crear malla cuadrada: " + err.toString()
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
                var layerName = params.layerName || "GridIt_Custom_Layer";
                var isGuide = (params.makeGuides !== false);
                var clearPrev = (params.clearPrevious !== false);
                var colorType = params.colorType || "cyan";

                var targetLayer = getOrCreateLayer(doc, layerName, clearPrev);
                var bounds = getTargetBounds(doc, params.targetScope, Number(params.cols) || 12, Number(params.rows) || 12, spacing);

                var left = bounds[0];
                var top = bounds[1];
                var right = bounds[2];
                var bottom = bounds[3];

                var width = Math.abs(right - left);
                var height = Math.abs(top - bottom);
                var lineCount = 0;

                for (var x = left; x <= right + 0.1; x += spacing) {
                    var vLine = targetLayer.pathItems.add();
                    vLine.setEntirePath([[x, top], [x, bottom]]);
                    applyPathStyle(vLine, isGuide, colorType);
                    lineCount++;
                }

                var tan30 = Math.tan((30 * Math.PI) / 180);
                var deltaY = spacing * tan30 * 2;
                if (deltaY < 1) deltaY = spacing;

                for (var offset = -width * tan30; offset <= height + (width * tan30); offset += deltaY) {
                    var yStart = bottom + offset;
                    var yEnd = yStart + (width * tan30);

                    var isoUp = targetLayer.pathItems.add();
                    isoUp.setEntirePath([[left, yStart], [right, yEnd]]);
                    applyPathStyle(isoUp, isGuide, colorType);
                    lineCount++;
                }

                for (var offset2 = -width * tan30; offset2 <= height + (width * tan30); offset2 += deltaY) {
                    var yStart2 = top - offset2;
                    var yEnd2 = yStart2 - (width * tan30);

                    var isoDown = targetLayer.pathItems.add();
                    isoDown.setEntirePath([[left, yStart2], [right, yEnd2]]);
                    applyPathStyle(isoDown, isGuide, colorType);
                    lineCount++;
                }

                app.redraw();

                return JSONHelper.stringify({
                    success: true,
                    type: "IsomÃ©trica",
                    elementsCount: lineCount,
                    layerName: layerName,
                    message: "Malla isomÃ©trica generada con Ã©xito (" + lineCount + " ejes triaxiales)."
                });

            } catch (err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "ExcepciÃ³n al crear malla isomÃ©trica: " + err.toString()
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
                var layerName = params.layerName || "GridIt_Custom_Layer";
                var isGuide = (params.makeGuides !== false);
                var clearPrev = (params.clearPrevious !== false);
                var colorType = params.colorType || "cyan";
                var baseUnit = Number(params.spacing) || 30;

                var targetLayer = getOrCreateLayer(doc, layerName, clearPrev);
                var bounds = getTargetBounds(doc, params.targetScope, 10, 10, baseUnit);

                var centerX = bounds[0] + (Math.abs(bounds[2] - bounds[0]) / 2);
                var centerY = bounds[1] - (Math.abs(bounds[1] - bounds[3]) / 2);

                var fibSteps = [1, 2, 3, 5, 8, 13, 21, 34];
                var count = 0;

                for (var i = 0; i < fibSteps.length; i++) {
                    var radius = (fibSteps[i] * baseUnit) / 2;
                    var diameter = radius * 2;
                    var circle = targetLayer.pathItems.ellipse(
                        centerY + radius,
                        centerX - radius,
                        diameter,
                        diameter
                    );
                    applyPathStyle(circle, isGuide, colorType);
                    count++;
                }

                var crosshairSize = baseUnit * 2;
                var hCross = targetLayer.pathItems.add();
                hCross.setEntirePath([[centerX - crosshairSize, centerY], [centerX + crosshairSize, centerY]]);
                applyPathStyle(hCross, isGuide, colorType);

                var vCross = targetLayer.pathItems.add();
                vCross.setEntirePath([[centerX, centerY + crosshairSize], [centerX, centerY - crosshairSize]]);
                applyPathStyle(vCross, isGuide, colorType);
                count += 2;

                app.redraw();

                return JSONHelper.stringify({
                    success: true,
                    type: "RazÃ³n Ãurea",
                    elementsCount: count,
                    layerName: layerName,
                    message: "CÃ­rculos Ã¡ureos y cruz de construcciÃ³n generados (" + count + " elementos)."
                });

            } catch (err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "ExcepciÃ³n al crear cÃ­rculos Ã¡ureos: " + err.toString()
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
                var targetName = layerName || "GridIt_Custom_Layer";
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
                    message: "La capa no existÃ­a o ya fue eliminada."
                });
            }
        }
    };
})();