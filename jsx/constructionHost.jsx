/**
 * BitGrid Pro - Motor Backend de Construcción (Construction Engine)
 * Target: Adobe Illustrator (CC 2022 - 2026+)
 */

var ConstructionHost = (function () {
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

    function getActiveDoc() {
        if (app.documents.length === 0) return null;
        try { return app.activeDocument; } catch(e) { return app.documents[0]; }
    }

    function getOrCreateLayer(doc, layerName) {
        try {
            return doc.layers.getByName(layerName);
        } catch(e) {
            var layer = doc.layers.add();
            layer.name = layerName;
            return layer;
        }
    }

    /**
     * Determina si un objeto pertenece a la capa técnica BitGrid_Construccion
     */
    function isFromConstructionLayer(item) {
        if (!item) return false;
        try {
            if (item.layer && item.layer.name === "BitGrid_Construccion") return true;
            var p = item.parent;
            while (p && p.typename !== "Document") {
                if (p.name === "BitGrid_Construccion" || p.name === "Construccion_Logotipo") return true;
                p = p.parent;
            }
        } catch(e) {}
        return false;
    }

    /**
     * Filtra la selección para obtener ÚNICAMENTE los objetos del logotipo original del usuario,
     * ignorando cualquier elemento generado en la capa técnica BitGrid_Construccion.
     */
    function getValidLogoSelection(doc) {
        var valid = [];
        if (!doc || !doc.selection || doc.selection.length === 0) return valid;
        for (var i = 0; i < doc.selection.length; i++) {
            var it = doc.selection[i];
            if (!isFromConstructionLayer(it)) {
                valid.push(it);
            }
        }
        return valid;
    }

    /**
     * Extrae recursivamente todos los PathItem de la selección
     */
    function extractPathsFromSelection(items) {
        var paths = [];
        if (!items || items.length === 0) return paths;

        function traverse(item) {
            if (!item) return;
            if (isFromConstructionLayer(item)) return; // Ignora cualquier elemento de la capa técnica
            var tn = item.typename;
            if (tn === "PathItem") {
                paths.push(item);
            } else if (tn === "CompoundPathItem") {
                for (var c = 0; c < item.pathItems.length; c++) {
                    paths.push(item.pathItems[c]);
                }
            } else if (tn === "GroupItem") {
                for (var g = 0; g < item.pageItems.length; g++) {
                    traverse(item.pageItems[g]);
                }
            }
        }

        for (var i = 0; i < items.length; i++) {
            traverse(items[i]);
        }
        return paths;
    }

    function parseColor(hexStr) {
        if (!hexStr) return { r: 16, g: 185, b: 129 };
        var clean = String(hexStr).replace("#", "");
        if (clean.length === 3) clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        var num = parseInt(clean, 16);
        if (isNaN(num)) return { r: 16, g: 185, b: 129 };
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function makeRgbColor(r, g, b) {
        var col = new RGBColor();
        col.red = r;
        col.green = g;
        col.blue = b;
        return col;
    }

    /**
     * Crea color de relleno fantasma compatible con RGB y CMYK
     */
    function makeGhostColor(doc, ghostOp, fillHex) {
        var hex = fillHex || "#FFFFFF";
        var isCmyk = (doc && doc.documentColorSpace === DocumentColorSpace.CMYK);
        var factor = Math.max(0, Math.min(100, ghostOp)) / 100;

        if (isCmyk) {
            var cmyk = new CMYKColor();
            var cleanHex = String(hex).replace("#", "");
            if (cleanHex.toUpperCase() === "FFFFFF" || cleanHex === "") {
                cmyk.cyan = 0; cmyk.magenta = 0; cmyk.yellow = 0;
                cmyk.black = Math.round(ghostOp);
                return cmyk;
            }
            var rgb = parseColor(hex);
            var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
            var k = 1 - Math.max(r, Math.max(g, b));
            var c = (1 - r - k) / (1 - k || 1);
            var m = (1 - g - k) / (1 - k || 1);
            var y = (1 - b - k) / (1 - k || 1);
            cmyk.cyan = Math.round(Math.max(0, Math.min(1, c * factor)) * 100);
            cmyk.magenta = Math.round(Math.max(0, Math.min(1, m * factor)) * 100);
            cmyk.yellow = Math.round(Math.max(0, Math.min(1, y * factor)) * 100);
            cmyk.black = Math.round(Math.max(0, Math.min(1, k * factor)) * 100);
            return cmyk;
        } else {
            var rgb = parseColor(hex);
            var r = Math.round(255 - (255 - rgb.r) * factor);
            var g = Math.round(255 - (255 - rgb.g) * factor);
            var b = Math.round(255 - (255 - rgb.b) * factor);
            return makeRgbColor(r, g, b);
        }
    }

    /**
     * Crea color oscuro técnico (grafito/charcoal) para contornos anatómicos
     */
    function makeDarkTechnicalColor(doc) {
        var isCmyk = (doc && doc.documentColorSpace === DocumentColorSpace.CMYK);
        if (isCmyk) {
            var cmyk = new CMYKColor();
            cmyk.cyan = 0;
            cmyk.magenta = 0;
            cmyk.yellow = 0;
            cmyk.black = 80;
            return cmyk;
        } else {
            return makeRgbColor(60, 60, 60);
        }
    }

    /**
     * Crea color de acento técnico compatible con RGB y CMYK
     */
    function makeAccentColor(doc, hexStr) {
        var rgb = parseColor(hexStr);
        var isCmyk = (doc && doc.documentColorSpace === DocumentColorSpace.CMYK);
        if (isCmyk) {
            var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
            var k = 1 - Math.max(r, Math.max(g, b));
            var c = (1 - r - k) / (1 - k || 1);
            var m = (1 - g - k) / (1 - k || 1);
            var y = (1 - b - k) / (1 - k || 1);
            var cmyk = new CMYKColor();
            cmyk.cyan = Math.round(Math.max(0, Math.min(1, c)) * 100);
            cmyk.magenta = Math.round(Math.max(0, Math.min(1, m)) * 100);
            cmyk.yellow = Math.round(Math.max(0, Math.min(1, y)) * 100);
            cmyk.black = Math.round(Math.max(0, Math.min(1, k)) * 100);
            return cmyk;
        } else {
            return makeRgbColor(rgb.r, rgb.g, rgb.b);
        }
    }

    function setGroupFill(group, fillCol) {
        if (!group) return;
        function walk(it) {
            if (!it) return;
            var tn = it.typename;
            if (tn === "GroupItem") {
                for (var g = 0; g < it.pageItems.length; g++) walk(it.pageItems[g]);
            } else if (tn === "CompoundPathItem" || tn === "PathItem") {
                try {
                    it.filled = true;
                    if (fillCol) it.fillColor = fillCol;
                    it.stroked = false;
                } catch(e) {}
                if (tn === "CompoundPathItem") {
                    for (var c = 0; c < it.pathItems.length; c++) {
                        try {
                            it.pathItems[c].filled = true;
                            if (fillCol) it.pathItems[c].fillColor = fillCol;
                            it.pathItems[c].stroked = false;
                        } catch(e) {}
                    }
                }
            }
        }
        walk(group);
    }

    function setGroupStroke(group, strokeW, strokeCol) {
        if (!group) return;
        function walk(it) {
            if (!it) return;
            var tn = it.typename;
            if (tn === "GroupItem") {
                for (var g = 0; g < it.pageItems.length; g++) walk(it.pageItems[g]);
            } else if (tn === "CompoundPathItem" || tn === "PathItem") {
                try {
                    it.stroked = true;
                    if (strokeW) it.strokeWidth = strokeW;
                    if (strokeCol) it.strokeColor = strokeCol;
                    it.filled = false;
                } catch(e) {}
                if (tn === "CompoundPathItem") {
                    for (var c = 0; c < it.pathItems.length; c++) {
                        try {
                            it.pathItems[c].stroked = true;
                            if (strokeW) it.pathItems[c].strokeWidth = strokeW;
                            if (strokeCol) it.pathItems[c].strokeColor = strokeCol;
                            it.pathItems[c].filled = false;
                        } catch(e) {}
                    }
                }
            }
        }
        walk(group);
    }

    /**
     * Aplica recursivamente el estilo técnico de contornos preservando CompoundPathItem y jerarquías íntegras
     */
    function applyOutlinesStyle(item, strokeW, strokeCol, ghostColor, ghostOp) {
        if (!item) return 0;
        var count = 0;
        var tn = item.typename;

        try { item.opacity = 100; } catch(e) {}
        try { item.guides = false; } catch(e) {}

        if (tn === "GroupItem") {
            for (var g = 0; g < item.pageItems.length; g++) {
                count += applyOutlinesStyle(item.pageItems[g], strokeW, strokeCol, ghostColor, ghostOp);
            }
        } else if (tn === "CompoundPathItem") {
            try {
                item.stroked = true;
                item.strokeWidth = strokeW;
                item.strokeColor = strokeCol;
            } catch(e) {}

            // En CompoundPathItem el relleno fantasma respeta los huecos y perforaciones
            if (ghostOp > 0) {
                try {
                    item.filled = true;
                    item.fillColor = ghostColor;
                } catch(e) {}
            } else {
                try {
                    item.filled = false;
                } catch(e) {}
            }

            // Aseguramos trazo técnico en cada sub-trazado para renderizado homogéneo
            for (var c = 0; c < item.pathItems.length; c++) {
                var sub = item.pathItems[c];
                try {
                    sub.stroked = true;
                    sub.strokeWidth = strokeW;
                    sub.strokeColor = strokeCol;
                    sub.guides = false;
                } catch(e) {}
            }
            count++;
        } else if (tn === "PathItem") {
            try {
                item.stroked = true;
                item.strokeWidth = strokeW;
                item.strokeColor = strokeCol;
                item.guides = false;

                // Relleno fantasma EXCLUSIVO para trazados cerrados
                if (item.closed && ghostOp > 0) {
                    item.filled = true;
                    item.fillColor = ghostColor;
                } else {
                    item.filled = false;
                }
            } catch(e) {}
            count++;
        }
        return count;
    }

    /**
     * Guarda la opacidad original en un Tag y atenúa el objeto para que no tape la lámina técnica
     */
    function tagAndDimOriginals(items) {
        if (!items || items.length === 0) return;
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            try {
                var tag = null;
                try { tag = it.tags.getByName("BitGrid_OrigOpacity"); } catch(e) {}
                if (!tag) {
                    tag = it.tags.add();
                    tag.name = "BitGrid_OrigOpacity";
                    tag.value = String(it.opacity);
                }
                it.opacity = 0;
            } catch(e) {}
        }
    }

    /**
     * Restaura la opacidad de los objetos seleccionados desde su Tag
     */
    function restoreOriginals(items) {
        if (!items || items.length === 0) return;
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            try {
                var tag = null;
                try { tag = it.tags.getByName("BitGrid_OrigOpacity"); } catch(e) {}
                if (tag) {
                    var op = parseFloat(tag.value);
                    if (!isNaN(op)) it.opacity = op;
                    tag.remove();
                }
            } catch(e) {}
        }
    }

    /**
     * Restaura la opacidad de todos los objetos en el documento que tengan el Tag
     */
    function restoreAllDocOriginals(doc) {
        if (!doc) return;
        try {
            for (var i = doc.pageItems.length - 1; i >= 0; i--) {
                try {
                    var it = doc.pageItems[i];
                    var tag = null;
                    try { tag = it.tags.getByName("BitGrid_OrigOpacity"); } catch(e) {}
                    if (tag) {
                        var op = parseFloat(tag.value);
                        if (!isNaN(op) && op > 0) {
                            it.opacity = op;
                        } else {
                            it.opacity = 100;
                        }
                        tag.remove();
                    } else if (it.opacity === 0) {
                        // Rescate de seguridad: si algún objeto quedó en 0% por ejecuciones previas
                        it.opacity = 100;
                    }
                } catch(e) {}
            }
        } catch(e) {}
    }

    /**
     * Busca recursivamente una subcapa o subgrupo por nombre dentro de BitGrid_Construccion
     */
    function findGroupOrSublayer(parent, name) {
        if (!parent) return null;
        try {
            if (parent.layers) {
                for (var l = 0; l < parent.layers.length; l++) {
                    if (parent.layers[l].name === name) return parent.layers[l];
                }
            }
        } catch(e) {}
        try {
            if (parent.groupItems) {
                for (var g = 0; g < parent.groupItems.length; g++) {
                    if (parent.groupItems[g].name === name) return parent.groupItems[g];
                }
            }
        } catch(e) {}
        try {
            if (parent.groupItems) {
                for (var g2 = 0; g2 < parent.groupItems.length; g2++) {
                    var found = findGroupOrSublayer(parent.groupItems[g2], name);
                    if (found) return found;
                }
            }
        } catch(e) {}
        return null;
    }

    var lastTargetedMap = null;
    var lastTargetTime = 0;

    /**
     * Detecta si el usuario tiene seleccionado en Illustrator uno o más grupos específicos de la construcción.
     * Incluye memoria de sesión activa para que el arrastre continuo de sliders no pierda el foco del grupo.
     */
    function getTargetedConstructionGroups(doc, layer) {
        var targets = {};
        var count = 0;

        if (doc && doc.selection && doc.selection.length > 0) {
            for (var i = 0; i < doc.selection.length; i++) {
                var it = doc.selection[i];
                var p = it;
                while (p && p.typename !== "Document") {
                    var n = p.name || "";
                    var matched = null;
                    if (n.indexOf("Contornos") !== -1) matched = "Contornos_Tecnicos";
                    else if (n.indexOf("Ancla") !== -1) matched = "Puntos_de_Ancla";
                    else if (n.indexOf("Manejador") !== -1) matched = "Manejadores_Bezier";
                    else if (n.indexOf("Horizontales") !== -1) matched = "Guias_Horizontales";
                    else if (n.indexOf("Verticales") !== -1) matched = "Guias_Verticales";
                    else if (n.indexOf("Diagonales") !== -1) matched = "Guias_Diagonales";
                    else if (n.indexOf("Circulos") !== -1) matched = "Circulos_de_Curvatura";
                    else if (n.indexOf("Espaciado") !== -1 || n.indexOf("Cotas") !== -1) matched = "Cotas_Espaciado";

                    if (matched) {
                        if (!targets[matched]) {
                            targets[matched] = true;
                            count++;
                        }
                        break;
                    }
                    p = p.parent;
                }
            }
        }

        var now = (new Date()).getTime();
        if (count > 0) {
            lastTargetedMap = targets;
            lastTargetTime = now;
            return { hasTarget: true, targets: targets };
        } else if (lastTargetedMap && (now - lastTargetTime < 5000)) {
            // Mantiene el objetivo seleccionado activo durante ajustes de sliders
            return { hasTarget: true, targets: lastTargetedMap };
        }

        return { hasTarget: false, targets: {} };
    }

    /**
     * Actualiza in-situ el tamaño, trazo y relleno de los puntos de ancla
     */
    function updateAnchorsGroupStyle(container, anchorSize, strokeW, strokeCol, fillCol) {
        if (!container) return;
        var halfA = (anchorSize && anchorSize > 0) ? (anchorSize / 2) : null;

        function walk(it) {
            if (!it) return;
            var tn = it.typename;
            if (tn === "GroupItem") {
                for (var g = 0; g < it.pageItems.length; g++) walk(it.pageItems[g]);
            } else if (tn === "PathItem") {
                try {
                    if (halfA) {
                        var cX = null, cY = null;
                        try {
                            var tagA = it.tags.getByName("BitGrid_Anc");
                            if (tagA && tagA.value) {
                                var partsA = tagA.value.split(",");
                                cX = parseFloat(partsA[0]);
                                cY = parseFloat(partsA[1]);
                            }
                        } catch(e) {}
                        if (cX === null || isNaN(cX)) {
                            var gb = it.geometricBounds;
                            cX = (gb[0] + gb[2]) / 2;
                            cY = (gb[1] + gb[3]) / 2;
                        }

                        it.setEntirePath([
                            [cX - halfA, cY + halfA],
                            [cX + halfA, cY + halfA],
                            [cX + halfA, cY - halfA],
                            [cX - halfA, cY - halfA]
                        ]);
                        it.closed = true;
                    }
                    if (strokeW) it.strokeWidth = strokeW;
                    if (strokeCol) it.strokeColor = strokeCol;
                    if (fillCol) { it.filled = true; it.fillColor = fillCol; }
                } catch(e) {}
            }
        }

        var pItems = container.pageItems || [];
        for (var i = 0; i < pItems.length; i++) walk(pItems[i]);
    }

    /**
     * Actualiza in-situ las líneas y circulitos de los manejadores Bézier
     */
    function updateHandlesGroupStyle(container, dotSize, handleScale, strokeW, strokeCol, fillCol) {
        if (!container) return;
        var halfDot = (dotSize && dotSize > 0) ? (dotSize / 2) : null;
        var scale = (handleScale && handleScale > 0) ? handleScale : null;

        var allLines = [];
        var allDots = [];

        function collect(it) {
            if (!it) return;
            var tn = it.typename;
            if (tn === "GroupItem") {
                for (var g = 0; g < it.pageItems.length; g++) collect(it.pageItems[g]);
            } else if (tn === "PathItem") {
                if (it.pathPoints && it.pathPoints.length === 4) {
                    allDots.push(it);
                } else if (it.pathPoints && it.pathPoints.length === 2) {
                    allLines.push(it);
                }
            }
        }

        var pItems = container.pageItems || [];
        for (var p = 0; p < pItems.length; p++) collect(pItems[p]);

        // 1. Actualizar líneas de manejadores (y su extensión si handleScale cambia)
        for (var l = 0; l < allLines.length; l++) {
            var line = allLines[l];
            try {
                if (scale !== null) {
                    try {
                        var tagDir = line.tags.getByName("BitGrid_OrigDir");
                        var tagAnc = line.tags.getByName("BitGrid_Anchor");
                        if (tagDir && tagAnc) {
                            var pDir = tagDir.value.split(",");
                            var pAnc = tagAnc.value.split(",");
                            var origLx = parseFloat(pDir[0]);
                            var origLy = parseFloat(pDir[1]);
                            var ax = parseFloat(pAnc[0]);
                            var ay = parseFloat(pAnc[1]);
                            var newTipX = ax + (origLx - ax) * scale;
                            var newTipY = ay + (origLy - ay) * scale;
                            line.setEntirePath([[ax, ay], [newTipX, newTipY]]);
                        }
                    } catch(e) {}
                }
                if (strokeW) line.strokeWidth = strokeW;
                if (strokeCol) line.strokeColor = strokeCol;
            } catch(e) {}
        }

        // 2. Actualizar circulitos con centrado matemático puro (translate) sobre la punta de la línea
        // Evita cualquier desvío por ancho de trazo (visibleBounds vs geometricBounds)
        for (var d = 0; d < allDots.length; d++) {
            var dot = allDots[d];
            try {
                var gb = dot.geometricBounds;
                var cX = (gb[0] + gb[2]) / 2;
                var cY = (gb[1] + gb[3]) / 2;
                var tipX = null, tipY = null;
                var minDist = Infinity;

                for (var li = 0; li < allLines.length; li++) {
                    var lPts = allLines[li].pathPoints;
                    if (lPts && lPts.length === 2) {
                        var ptTip = lPts[1].anchor;
                        var dx = cX - ptTip[0];
                        var dy = cY - ptTip[1];
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            minDist = dist;
                            tipX = ptTip[0];
                            tipY = ptTip[1];
                        }
                    }
                }

                if (tipX !== null && !isNaN(tipX)) {
                    // A. Reescalar el circulito si dotSize cambió (usando Transformation.CENTER para no desplazar)
                    if (dotSize && dotSize > 0) {
                        var currDiam = dot.geometricBounds[2] - dot.geometricBounds[0];
                        if (currDiam > 0 && Math.abs(currDiam - dotSize) > 0.05) {
                            var scalePct = (dotSize / currDiam) * 100;
                            dot.resize(scalePct, scalePct, true, true, true, true, 100, Transformation.CENTER);
                        }
                    }

                    // B. Traslación geométrica pura para hacer coincidir el centro del trazado con la punta de la línea
                    var gbFinal = dot.geometricBounds;
                    var finalX = (gbFinal[0] + gbFinal[2]) / 2;
                    var finalY = (gbFinal[1] + gbFinal[3]) / 2;
                    var dX = tipX - finalX;
                    var dY = tipY - finalY;
                    if (Math.abs(dX) > 0.0001 || Math.abs(dY) > 0.0001) {
                        dot.translate(dX, dY);
                    }
                }

                if (strokeW) dot.strokeWidth = strokeW;
                if (strokeCol) dot.strokeColor = strokeCol;
                if (fillCol) { dot.filled = true; dot.fillColor = fillCol; }
            } catch(e) {}
        }
    }

    /**
     * Actualiza in-situ el trazo y relleno de los contornos técnicos
     */
    function updateOutlinesGroupStyle(container, strokeW, strokeCol, fillCol, ghostOp) {
        if (!container) return;

        var ghostSub = findGroupOrSublayer(container, "Relleno_Fantasma");
        var wireSub = findGroupOrSublayer(container, "Trazado_Contorno");

        // 1. Estructura con subgrupos dedicados
        if (ghostSub || wireSub) {
            if (ghostSub) {
                if (!isNaN(ghostOp)) {
                    if (ghostOp > 0) {
                        try { ghostSub.hidden = false; } catch(e) {}
                        try { ghostSub.opacity = ghostOp; } catch(e) {}
                    } else {
                        try { ghostSub.opacity = 0; } catch(e) {}
                        try { ghostSub.hidden = true; } catch(e) {}
                    }
                }
                if (fillCol) {
                    setGroupFill(ghostSub, fillCol);
                }
            }
            if (wireSub) {
                setGroupStroke(wireSub, strokeW, strokeCol);
            }
            return;
        }

        // 2. Fallback para estructuras existentes planas
        function walk(it) {
            if (!it) return;
            var tn = it.typename;
            if (tn === "GroupItem") {
                for (var g = 0; g < it.pageItems.length; g++) walk(it.pageItems[g]);
            } else if (tn === "CompoundPathItem") {
                try {
                    if (strokeW) it.strokeWidth = strokeW;
                    if (strokeCol) it.strokeColor = strokeCol;
                    if (!isNaN(ghostOp) && ghostOp > 0) {
                        it.filled = true;
                        if (fillCol) it.fillColor = fillCol;
                        it.opacity = ghostOp;
                    } else if (ghostOp === 0) {
                        it.filled = false;
                        it.opacity = 100;
                    }
                } catch(e) {}
                for (var c = 0; c < it.pathItems.length; c++) {
                    try {
                        if (strokeW) it.pathItems[c].strokeWidth = strokeW;
                        if (strokeCol) it.pathItems[c].strokeColor = strokeCol;
                    } catch(e) {}
                }
            } else if (tn === "PathItem") {
                try {
                    if (strokeW) it.strokeWidth = strokeW;
                    if (strokeCol) it.strokeColor = strokeCol;
                    if (it.closed && !isNaN(ghostOp) && ghostOp > 0) {
                        it.filled = true;
                        if (fillCol) it.fillColor = fillCol;
                        it.opacity = ghostOp;
                    } else if (ghostOp === 0) {
                        it.filled = false;
                        it.opacity = 100;
                    }
                } catch(e) {}
            }
        }
        var pItems = container.pageItems || [];
        for (var p = 0; p < pItems.length; p++) walk(pItems[p]);
    }

    /**
     * Actualiza in-situ el trazo de líneas guía auxiliares (diagonales, horizontales, cotas, círculos)
     */
    function updateAuxiliaryGroupStyle(container, strokeW, strokeCol) {
        if (!container) return;
        function walk(it) {
            if (!it) return;
            var tn = it.typename;
            if (tn === "GroupItem") {
                for (var g = 0; g < it.pageItems.length; g++) walk(it.pageItems[g]);
            } else if (tn === "PathItem") {
                try {
                    if (strokeW) it.strokeWidth = strokeW;
                    if (strokeCol) it.strokeColor = strokeCol;
                } catch(e) {}
            }
        }
        var pItems = container.pageItems || [];
        for (var i = 0; i < pItems.length; i++) walk(pItems[i]);
    }

    /**
     * Modifica las propiedades visuales de la construcción existente en el lienzo sin necesidad de volver a seleccionar el logo
     */
    function updateExistingConstruction(doc, params) {
        var layer = null;
        try { layer = doc.layers.getByName("BitGrid_Construccion"); } catch(e) {}
        if (!layer) return false;

        var config = params.config || {};
        var strokeW = Number(config.strokeWidth);
        var anchorSize = Number(config.anchorSize);
        var handleDotSize = Number(config.handleDotSize);
        var ghostOp = Number(config.ghostOpacity);
        var strokeColorHex = config.strokeColor;
        var fillColorHex = config.fillColor;
        var strokeOp = Number(config.strokeOpacity);

        var accentCol = strokeColorHex ? makeAccentColor(doc, strokeColorHex) : null;
        var fillCol = fillColorHex ? makeAccentColor(doc, fillColorHex) : null;
        var ghostCol = makeGhostColor(doc, isNaN(ghostOp) ? 0 : ghostOp, fillColorHex);

        var changedProp = params.changedProperty || null;
        var targetedInfo = getTargetedConstructionGroups(doc, layer);
        var hasTarget = targetedInfo.hasTarget;
        var targets = targetedInfo.targets;
        var updatedCount = 0;

        var gOutlines = findGroupOrSublayer(layer, "Contornos_Tecnicos") || findGroupOrSublayer(layer, "01_Contornos");
        var gAnchors = findGroupOrSublayer(layer, "Puntos_de_Ancla") || findGroupOrSublayer(layer, "03_Puntos_de_Ancla");
        var gHandles = findGroupOrSublayer(layer, "Manejadores_Bezier") || findGroupOrSublayer(layer, "02_Manejadores");

        var auxList = [
            { id: "Guias_Horizontales", alt: "05_Guias_Horizontales" },
            { id: "Guias_Verticales", alt: "06_Guias_Verticales" },
            { id: "Guias_Diagonales", alt: "07_Guias_Diagonales" },
            { id: "Circulos_de_Curvatura", alt: "04_Circulos_Curvatura" },
            { id: "Cotas_Espaciado", alt: "08_Cotas_Espaciado" }
        ];

        // 1. AJUSTES EXCLUSIVOS POR PROPIEDAD
        // Si el usuario mueve un slider específico (ej: anclas), se actualiza ÚNICAMENTE esa familia
        if (changedProp === "anchorSize") {
            if (gAnchors) {
                updateAnchorsGroupStyle(gAnchors, anchorSize, strokeW, accentCol, fillCol);
                updatedCount++;
            }
        } else if (changedProp === "handleDotSize" || changedProp === "handleScale") {
            if (gHandles) {
                var handleScaleVal = Number(config.handleScale) || 1.0;
                updateHandlesGroupStyle(gHandles, handleDotSize, handleScaleVal, strokeW, accentCol, fillCol);
                updatedCount++;
            }
        } else if (changedProp === "ghostOpacity") {
            if (gOutlines) {
                updateOutlinesGroupStyle(gOutlines, strokeW, accentCol, fillCol, ghostOp);
                updatedCount++;
            }
        } else if (changedProp === "strokeOpacity") {
            // Actualización de opacidad general o por grupo seleccionado
            if (!isNaN(strokeOp) && strokeOp >= 0 && strokeOp <= 100) {
                if (hasTarget) {
                    if (targets["Contornos_Tecnicos"] && gOutlines) try { gOutlines.opacity = strokeOp; } catch(e) {}
                    if (targets["Puntos_de_Ancla"] && gAnchors) try { gAnchors.opacity = strokeOp; } catch(e) {}
                    if (targets["Manejadores_Bezier"] && gHandles) try { gHandles.opacity = strokeOp; } catch(e) {}
                    for (var s2 = 0; s2 < auxList.length; s2++) {
                        if (targets[auxList[s2].id]) {
                            var gAuxT = findGroupOrSublayer(layer, auxList[s2].id);
                            if (gAuxT) try { gAuxT.opacity = strokeOp; } catch(e) {}
                        }
                    }
                } else {
                    for (var gi = 0; gi < layer.groupItems.length; gi++) {
                        try { layer.groupItems[gi].opacity = strokeOp; } catch(e) {}
                    }
                }
                updatedCount++;
            }
        } else {
            // 2. AJUSTES COMPARTIDOS (Grosor de trazo, Color de trazo, Color de relleno)
            // Si hay un grupo seleccionado en Illustrator, afecta SOLAMENTE a ese grupo.
            // Si no hay ningún grupo seleccionado, actualiza toda la lámina de construcción.

            // A. Contornos
            if ((!hasTarget || targets["Contornos_Tecnicos"]) && gOutlines) {
                updateOutlinesGroupStyle(gOutlines, strokeW, accentCol, fillCol, ghostOp);
                updatedCount++;
            }

            // B. Anclas
            if ((!hasTarget || targets["Puntos_de_Ancla"]) && gAnchors) {
                updateAnchorsGroupStyle(gAnchors, anchorSize, strokeW, accentCol, fillCol);
                updatedCount++;
            }

            // C. Manejadores
            if ((!hasTarget || targets["Manejadores_Bezier"]) && gHandles) {
                var hScale = Number(config.handleScale) || 1.0;
                updateHandlesGroupStyle(gHandles, handleDotSize, hScale, strokeW, accentCol, fillCol);
                updatedCount++;
            }

            // D. Guías Auxiliares y Cotas
            for (var a = 0; a < auxList.length; a++) {
                var aId = auxList[a].id;
                if (!hasTarget || targets[aId]) {
                    var gAux = findGroupOrSublayer(layer, aId) || findGroupOrSublayer(layer, auxList[a].alt);
                    if (gAux) {
                        updateAuxiliaryGroupStyle(gAux, strokeW, accentCol);
                        updatedCount++;
                    }
                }
            }
        }

        // PRESERVACIÓN ACTIVA DE SELECCIÓN EN ILLUSTRATOR:
        // Evita que Illustrator deseleccione el grupo al editar o mover sliders
        if (hasTarget) {
            try {
                if (targets["Puntos_de_Ancla"] && gAnchors) gAnchors.selected = true;
                if (targets["Manejadores_Bezier"] && gHandles) gHandles.selected = true;
                if (targets["Contornos_Tecnicos"] && gOutlines) gOutlines.selected = true;
                for (var s = 0; s < auxList.length; s++) {
                    if (targets[auxList[s].id]) {
                        var gS = findGroupOrSublayer(layer, auxList[s].id);
                        if (gS) gS.selected = true;
                    }
                }
            } catch(e) {}
        }

        app.redraw();
        return updatedCount > 0;
    }

    /**
     * Obtiene el contenedor de un elemento anatómico:
     * Si separateLayers es true, crea un grupo independiente directamente en la capa (layer)
     * para que cada familia (Anclas, Manejadores, Círculos, etc.) quede agrupada por separado
     * y pueda ser seleccionada y manipulada independientemente con la herramienta Selección (V).
     */
    function getElementContainer(layer, conGroup, separateLayers, sublayerName, groupName) {
        if (separateLayers) {
            var topGroup = layer.groupItems.add();
            topGroup.name = groupName;
            return topGroup;
        } else {
            var subGroup = conGroup.groupItems.add();
            subGroup.name = groupName;
            return subGroup;
        }
    }

    return {
        finalize: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDoc();
            if (!doc) return JSONHelper.stringify({ success: false, message: "No hay documento abierto." });

            var existingLayer = null;
            try { existingLayer = doc.layers.getByName("BitGrid_Construccion"); } catch(e) {}

            var validItems = getValidLogoSelection(doc);

            // Si ya existe la lámina técnica generada y el usuario NO tiene seleccionado el logo original:
            // Aplicamos cualquier ajuste pendiente in-situ y consolidamos SIN deseleccionar
            if (existingLayer && validItems.length === 0) {
                updateExistingConstruction(doc, params);
                if (params && params.config && params.config.lockLayer) {
                    try { existingLayer.locked = true; } catch(e) {}
                }
                app.redraw();
                return JSONHelper.stringify({
                    success: true,
                    elementsCount: existingLayer.pageItems.length,
                    message: "Lámina de construcción finalizada y consolidada con éxito."
                });
            }

            // Si hay una selección válida del logotipo original, generamos/consolidamos con los parámetros actuales
            return this.generateConstruction(paramsJson);
        },

        updateConstruction: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDoc();
            if (!doc) return JSONHelper.stringify({ success: false, message: "No hay documento abierto." });

            var existingLayer = null;
            try { existingLayer = doc.layers.getByName("BitGrid_Construccion"); } catch(e) {}

            // Si existe la capa de construcción, actualizamos in-situ (sea un grupo seleccionado o toda la lámina)
            if (existingLayer) {
                var didUpdate = updateExistingConstruction(doc, params);
                return JSONHelper.stringify({
                    success: didUpdate,
                    elementsCount: existingLayer.pageItems.length,
                    message: didUpdate ? "Ajuste aplicado in-situ a la construcción." : "Sin cambios requeridos."
                });
            }

            // Si no existe la capa pero hay logotipo original seleccionado, generamos:
            var validItems = getValidLogoSelection(doc);
            if (validItems.length > 0) {
                return this.generateConstruction(paramsJson);
            }

            return JSONHelper.stringify({
                success: false,
                message: "No hay elementos de construcción ni logotipo seleccionado."
            });
        },

        clearAll: function () {
            var doc = getActiveDoc();
            if (!doc) return JSONHelper.stringify({ success: false, message: "No hay documento abierto." });

            var layerName = "BitGrid_Construccion";
            try {
                var layer = doc.layers.getByName(layerName);
                layer.locked = false;
                layer.remove();
            } catch (e) {}

            // Restauramos cualquier objeto del logotipo atenuado a su opacidad original
            restoreAllDocOriginals(doc);
            app.redraw();

            return JSONHelper.stringify({ success: true, message: "Capas de construcción eliminadas y apariencia original restaurada." });
        },

        clean: function () {
            var doc = getActiveDoc();
            if (!doc) return JSONHelper.stringify({ success: false, message: "No hay documento abierto." });

            var layerName = "BitGrid_Construccion";
            try {
                var layer = doc.layers.getByName(layerName);
                layer.locked = false; // Desbloquear para permitir borrado seguro
                var auxNames = ["Guias_Horizontales", "Guias_Verticales", "Guias_Diagonales", "Circulos_de_Curvatura", "Cotas_Espaciado"];
                var removedCount = 0;

                for (var i = layer.groupItems.length - 1; i >= 0; i--) {
                    var g = layer.groupItems[i];
                    for (var a = 0; a < auxNames.length; a++) {
                        if (g.name === auxNames[a]) {
                            g.remove();
                            removedCount++;
                            break;
                        }
                    }
                    if (g.name === "Construccion_Logotipo") {
                        for (var sub = g.groupItems.length - 1; sub >= 0; sub--) {
                            var sg = g.groupItems[sub];
                            for (var a2 = 0; a2 < auxNames.length; a2++) {
                                if (sg.name === auxNames[a2]) {
                                    sg.remove();
                                    removedCount++;
                                    break;
                                }
                            }
                        }
                    }
                }
                app.redraw();
                return JSONHelper.stringify({
                    success: true,
                    message: "Lienzo limpio: guías auxiliares eliminadas, preservando contornos, anclas y manejadores."
                });
            } catch (e) {
                return JSONHelper.stringify({ success: true, message: "No se encontraron guías que limpiar." });
            }
        },

        generateConstruction: function (paramsJson) {
            var params = (typeof paramsJson === "string") ? JSONHelper.parse(paramsJson) : paramsJson;
            var doc = getActiveDoc();
            if (!doc) {
                return JSONHelper.stringify({ success: false, message: "Error: No hay documento activo." });
            }

            var targetItems = getValidLogoSelection(doc);
            if (targetItems.length === 0) {
                // Si el usuario está ajustando propiedades sobre una lámina ya generada (in-situ):
                var existingL = null;
                try { existingL = doc.layers.getByName("BitGrid_Construccion"); } catch(e) {}
                if (existingL) {
                    var didUpdate = updateExistingConstruction(doc, params);
                    if (didUpdate) {
                        return JSONHelper.stringify({
                            success: true,
                            elementsCount: existingL.pageItems.length,
                            message: "Ajuste aplicado in-situ a los elementos de construcción."
                        });
                    }
                    return JSONHelper.stringify({
                        success: true,
                        elementsCount: existingL.pageItems.length,
                        message: "La construcción ya está presente en el lienzo."
                    });
                }
                return JSONHelper.stringify({
                    success: false,
                    message: "Selecciona primero tu logotipo o trazado en Illustrator."
                });
            }

            try {
                var elements = params.elements || {};
                var config = params.config || {};
                var anchorSize = Number(config.anchorSize) || 4.0;
                var strokeW = Number(config.strokeWidth) || 0.5;
                var handleDotSize = Number(config.handleDotSize) || 3.0;
                var handleScale = Number(config.handleScale) || 1.0;
                var ghostOp = Number(config.ghostOpacity) || 0;
                var strokeColorHex = config.strokeColor || "#10B981";
                var fillColorHex = config.fillColor || "#FFFFFF";

                var targetPaths = extractPathsFromSelection(targetItems);
                if (targetPaths.length === 0) {
                    return JSONHelper.stringify({
                        success: false,
                        message: "Los objetos seleccionados no contienen trazados vectoriales editables."
                    });
                }

                // Obtener límites globales del logotipo original seleccionado
                var selBounds = [Infinity, -Infinity, -Infinity, Infinity]; // [L, T, R, B]
                for (var s = 0; s < targetItems.length; s++) {
                    var b = targetItems[s].visibleBounds;
                    if (b[0] < selBounds[0]) selBounds[0] = b[0];
                    if (b[1] > selBounds[1]) selBounds[1] = b[1];
                    if (b[2] > selBounds[2]) selBounds[2] = b[2];
                    if (b[3] < selBounds[3]) selBounds[3] = b[3];
                }
                var selL = selBounds[0];
                var selT = selBounds[1];
                var selR = selBounds[2];
                var selB = selBounds[3];
                var selW = selR - selL;
                var selH = selT - selB;
                var marginX = selW * 0.25;
                var marginY = selH * 0.25;

                // Aseguramos que ningún objeto del usuario permanezca oculto o atenuado
                restoreAllDocOriginals(doc);

                // Limpiar previa si está configurado
                if (config.clearPrev !== false) {
                    try {
                        var prevL = doc.layers.getByName("BitGrid_Construccion");
                        prevL.locked = false;
                        prevL.remove();
                    } catch(e) {}
                }

                // Crear capa de construcción
                var layer = getOrCreateLayer(doc, "BitGrid_Construccion");
                var separateLayers = (config.separateLayers !== false);
                var conGroup = null;
                if (!separateLayers) {
                    conGroup = layer.groupItems.add();
                    conGroup.name = "Construccion_Logotipo";
                }

                // Aplicar opacidad general configurada a la construcción
                var strokeOp = Number(config.strokeOpacity);
                if (conGroup && !isNaN(strokeOp) && strokeOp >= 0 && strokeOp <= 100) {
                    try { conGroup.opacity = strokeOp; } catch(e) {}
                }

                var guideCol = makeRgbColor(180, 180, 180);
                var darkCol = makeDarkTechnicalColor(doc);
                var whiteCol = makeRgbColor(255, 255, 255);
                var accentCol = makeAccentColor(doc, strokeColorHex); // Color de Trazo Técnico
                var fillCol = makeAccentColor(doc, fillColorHex);     // Color de Relleno Técnico
                var countItems = 0;

                // separateLayers ya declarado en la cabecera

                // 1. OUTLINES (Contorno Técnico y Relleno Fantasma)
                if (elements.outlines) {
                    var outlinesGroup = getElementContainer(layer, conGroup, separateLayers, "01_Contornos", "Contornos_Tecnicos");

                    // a. Subgrupo de Relleno Fantasma (silueta semitransparente real)
                    var ghostGroup = outlinesGroup.groupItems.add();
                    ghostGroup.name = "Relleno_Fantasma";
                    ghostGroup.opacity = (!isNaN(ghostOp) && ghostOp > 0) ? ghostOp : 0;
                    if (ghostOp === 0) {
                        try { ghostGroup.hidden = true; } catch(e) {}
                    }

                    // b. Subgrupo de Trazado de Contorno Técnico (alambre vector nítido)
                    var wireGroup = outlinesGroup.groupItems.add();
                    wireGroup.name = "Trazado_Contorno";

                    for (var s = 0; s < targetItems.length; s++) {
                        var origItem = targetItems[s];

                        // Duplicado para silueta fantasma
                        var dupGhost = null;
                        try {
                            dupGhost = origItem.duplicate(ghostGroup, ElementPlacement.PLACEATEND);
                            if (origItem.typename === "TextFrameItem") dupGhost = dupGhost.createOutline();
                        } catch(e) { dupGhost = null; }
                        if (dupGhost) {
                            setGroupFill(dupGhost, fillCol);
                        }

                        // Duplicado para trazo técnico
                        var dupWire = null;
                        try {
                            dupWire = origItem.duplicate(wireGroup, ElementPlacement.PLACEATEND);
                            if (origItem.typename === "TextFrameItem") dupWire = dupWire.createOutline();
                        } catch(e) { dupWire = null; }
                        if (dupWire) {
                            setGroupStroke(dupWire, strokeW, accentCol);
                        }

                        countItems++;
                    }
                }

                // 2. HORIZONTALS (Líneas Guía Horizontales Técnicas)
                if (elements.horizontals) {
                    var horizGroup = getElementContainer(layer, conGroup, separateLayers, "05_Guias_Horizontales", "Guias_Horizontales");
                    var yCoords = [selT, selB];

                    for (var p2 = 0; p2 < targetPaths.length; p2++) {
                        var ptsH = targetPaths[p2].pathPoints;
                        for (var pt = 0; pt < ptsH.length; pt++) {
                            yCoords.push(ptsH[pt].anchor[1]);
                        }
                    }

                    // Eliminar duplicados cercanos (tolerancia 1 pt)
                    yCoords.sort(function(a, b) { return a - b; });
                    var uniqueY = [];
                    for (var y = 0; y < yCoords.length; y++) {
                        if (uniqueY.length === 0 || Math.abs(yCoords[y] - uniqueY[uniqueY.length - 1]) > 1.0) {
                            uniqueY.push(yCoords[y]);
                        }
                    }

                    for (var uy = 0; uy < uniqueY.length; uy++) {
                        var lineH = horizGroup.pathItems.add();
                        lineH.setEntirePath([[selL - marginX, uniqueY[uy]], [selR + marginX, uniqueY[uy]]]);
                        lineH.stroked = true;
                        lineH.filled = false;
                        lineH.strokeWidth = strokeW;
                        if (config.asGuides) {
                            lineH.guides = true;
                        } else {
                            lineH.strokeColor = accentCol;
                        }
                        countItems++;
                    }
                }

                // 3. VERTICALS (Líneas Guía Verticales Técnicas)
                if (elements.verticals) {
                    var vertGroup = getElementContainer(layer, conGroup, separateLayers, "06_Guias_Verticales", "Guias_Verticales");
                    var xCoords = [selL, selR];

                    for (var p3 = 0; p3 < targetPaths.length; p3++) {
                        var ptsV = targetPaths[p3].pathPoints;
                        for (var ptV = 0; ptV < ptsV.length; ptV++) {
                            xCoords.push(ptsV[ptV].anchor[0]);
                        }
                    }

                    xCoords.sort(function(a, b) { return a - b; });
                    var uniqueX = [];
                    for (var x = 0; x < xCoords.length; x++) {
                        if (uniqueX.length === 0 || Math.abs(xCoords[x] - uniqueX[uniqueX.length - 1]) > 1.0) {
                            uniqueX.push(xCoords[x]);
                        }
                    }

                    for (var ux = 0; ux < uniqueX.length; ux++) {
                        var lineV = vertGroup.pathItems.add();
                        lineV.setEntirePath([[uniqueX[ux], selT + marginY], [uniqueX[ux], selB - marginY]]);
                        lineV.stroked = true;
                        lineV.filled = false;
                        lineV.strokeWidth = strokeW;
                        if (config.asGuides) {
                            lineV.guides = true;
                        } else {
                            lineV.strokeColor = accentCol;
                        }
                        countItems++;
                    }
                }

                // DIAGONALS (Líneas Guía Diagonales Matemáticas: Ejes Centrales, Tangentes Extremas y Caja)
                if (elements.diagonals) {
                    var diagGroup = getElementContainer(layer, conGroup, separateLayers, "07_Guias_Diagonales", "Guias_Diagonales");
                    var cX = (selL + selR) / 2;
                    var cY = (selT + selB) / 2;

                    // Extensión generosa para cruzar toda la caja de límites con margen equilibrado
                    var halfDiag = Math.sqrt(selW * selW + selH * selH) * 0.75 + Math.max(marginX, marginY) * 1.5;
                    var diagSegments = [];

                    function addDiagLine(px, py, isSlopePositive) {
                        if (isSlopePositive) {
                            // 45° (pendiente +1)
                            diagSegments.push([
                                [px - halfDiag, py - halfDiag],
                                [px + halfDiag, py + halfDiag]
                            ]);
                        } else {
                            // -45° / 135° (pendiente -1)
                            diagSegments.push([
                                [px - halfDiag, py + halfDiag],
                                [px + halfDiag, py - halfDiag]
                            ]);
                        }
                    }

                    // 1. Ejes Centrales Maestros (45° y -45°) cruzando el centro del isotipo
                    addDiagLine(cX, cY, true);
                    addDiagLine(cX, cY, false);

                    // 2. Diagonales de la Caja Contenedora (Vértice a Vértice)
                    diagSegments.push([
                        [selL - marginX, selT + marginY],
                        [selR + marginX, selB - marginY]
                    ]);
                    diagSegments.push([
                        [selL - marginX, selB - marginY],
                        [selR + marginX, selT + marginY]
                    ]);

                    // 3. Tangentes Extremas a 45° y -45° (Envolvente Rotada que enmarca la figura)
                    var allAnchorsList = [];
                    for (var pd = 0; pd < targetPaths.length; pd++) {
                        var pPoints = targetPaths[pd].pathPoints;
                        for (var pp = 0; pp < pPoints.length; pp++) {
                            allAnchorsList.push(pPoints[pp].anchor);
                        }
                    }

                    if (allAnchorsList.length > 0) {
                        var minC45 = Infinity, maxC45 = -Infinity;
                        var minK135 = Infinity, maxK135 = -Infinity;
                        var ptMin45 = null, ptMax45 = null;
                        var ptMin135 = null, ptMax135 = null;

                        for (var ai = 0; ai < allAnchorsList.length; ai++) {
                            var ancPt = allAnchorsList[ai];
                            var valC45 = ancPt[1] - ancPt[0];   // y - x
                            var valK135 = ancPt[1] + ancPt[0];  // y + x

                            if (valC45 < minC45) { minC45 = valC45; ptMin45 = ancPt; }
                            if (valC45 > maxC45) { maxC45 = valC45; ptMax45 = ancPt; }
                            if (valK135 < minK135) { minK135 = valK135; ptMin135 = ancPt; }
                            if (valK135 > maxK135) { maxK135 = valK135; ptMax135 = ancPt; }
                        }

                        var centerC45 = cY - cX;
                        var centerK135 = cY + cX;
                        var tol = Math.max(6.0, selW * 0.05);

                        // Tangente exterior inferior a 45°
                        if (ptMin45 && Math.abs(minC45 - centerC45) > tol) {
                            addDiagLine(ptMin45[0], ptMin45[1], true);
                        }
                        // Tangente exterior superior a 45°
                        if (ptMax45 && Math.abs(maxC45 - centerC45) > tol) {
                            addDiagLine(ptMax45[0], ptMax45[1], true);
                        }
                        // Tangente exterior izquierda a -45°
                        if (ptMin135 && Math.abs(minK135 - centerK135) > tol) {
                            addDiagLine(ptMin135[0], ptMin135[1], false);
                        }
                        // Tangente exterior derecha a -45°
                        if (ptMax135 && Math.abs(maxK135 - centerK135) > tol) {
                            addDiagLine(ptMax135[0], ptMax135[1], false);
                        }
                    }

                    // 4. Proyección de aristas rectas inclinadas si existen en el logo
                    for (var pr = 0; pr < targetPaths.length; pr++) {
                        var pItem = targetPaths[pr];
                        var pathPts = pItem.pathPoints;
                        if (!pathPts || pathPts.length < 2) continue;
                        var maxPi = pItem.closed ? pathPts.length : (pathPts.length - 1);
                        for (var pi = 0; pi < maxPi; pi++) {
                            var nextPi = (pi + 1) % pathPts.length;
                            var pt1 = pathPts[pi];
                            var pt2 = pathPts[nextPi];
                            var isLinear = (Math.abs(pt1.rightDirection[0] - pt1.anchor[0]) < 0.2 &&
                                            Math.abs(pt1.rightDirection[1] - pt1.anchor[1]) < 0.2 &&
                                            Math.abs(pt2.leftDirection[0] - pt2.anchor[0]) < 0.2 &&
                                            Math.abs(pt2.leftDirection[1] - pt2.anchor[1]) < 0.2);
                            if (isLinear) {
                                var deltaX = pt2.anchor[0] - pt1.anchor[0];
                                var deltaY = pt2.anchor[1] - pt1.anchor[1];
                                var len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                                if (len > 12 && Math.abs(deltaX) > 2 && Math.abs(deltaY) > 2) {
                                    var dirX = deltaX / len;
                                    var dirY = deltaY / len;
                                    var extra = halfDiag * 0.8;
                                    diagSegments.push([
                                        [pt1.anchor[0] - dirX * extra, pt1.anchor[1] - dirY * extra],
                                        [pt2.anchor[0] + dirX * extra, pt2.anchor[1] + dirY * extra]
                                    ]);
                                }
                            }
                        }
                    }

                    // Trazar todas las líneas en el grupo de construcción
                    for (var ds = 0; ds < diagSegments.length; ds++) {
                        var lineDiag = diagGroup.pathItems.add();
                        lineDiag.setEntirePath(diagSegments[ds]);
                        lineDiag.stroked = true;
                        lineDiag.filled = false;
                        lineDiag.strokeWidth = strokeW;
                        if (config.asGuides) {
                            lineDiag.guides = true;
                        } else {
                            lineDiag.strokeColor = accentCol;
                        }
                        countItems++;
                    }
                }

                // 4. HANDLES (Manejadores Bézier de Puntos Curvos)
                if (elements.handles) {
                    var handlesGroup = getElementContainer(layer, conGroup, separateLayers, "02_Manejadores", "Manejadores_Bezier");
                    var halfDot = handleDotSize / 2;

                    for (var p4 = 0; p4 < targetPaths.length; p4++) {
                        var ptsM = targetPaths[p4].pathPoints;
                        for (var ptM = 0; ptM < ptsM.length; ptM++) {
                            var pItem = ptsM[ptM];
                            var ax = pItem.anchor[0];
                            var ay = pItem.anchor[1];

                            // Left Handle
                            var lx = pItem.leftDirection[0];
                            var ly = pItem.leftDirection[1];
                            if (Math.abs(lx - ax) > 0.1 || Math.abs(ly - ay) > 0.1) {
                                var targetLx = ax + (lx - ax) * handleScale;
                                var targetLy = ay + (ly - ay) * handleScale;

                                var handleLineL = handlesGroup.pathItems.add();
                                handleLineL.setEntirePath([[ax, ay], [targetLx, targetLy]]);
                                handleLineL.stroked = true;
                                handleLineL.filled = false;
                                handleLineL.strokeWidth = strokeW;
                                handleLineL.strokeColor = accentCol; // hereda el color del trazo seleccionado

                                try {
                                    var tagDirL = handleLineL.tags.add(); tagDirL.name = "BitGrid_OrigDir"; tagDirL.value = lx + "," + ly;
                                    var tagAncL = handleLineL.tags.add(); tagAncL.name = "BitGrid_Anchor"; tagAncL.value = ax + "," + ay;
                                } catch(e) {}

                                var dotL = handlesGroup.pathItems.ellipse(targetLy + halfDot, targetLx - halfDot, handleDotSize, handleDotSize);
                                dotL.stroked = true;
                                dotL.filled = true;
                                dotL.fillColor = fillCol;
                                dotL.strokeWidth = strokeW;
                                dotL.strokeColor = accentCol;
                                try {
                                    var tagTipL = dotL.tags.add(); tagTipL.name = "BitGrid_Tip"; tagTipL.value = targetLx + "," + targetLy;
                                } catch(e) {}
                                countItems += 2;
                            }

                            // Right Handle
                            var rx = pItem.rightDirection[0];
                            var ry = pItem.rightDirection[1];
                            if (Math.abs(rx - ax) > 0.1 || Math.abs(ry - ay) > 0.1) {
                                var targetRx = ax + (rx - ax) * handleScale;
                                var targetRy = ay + (ry - ay) * handleScale;

                                var handleLineR = handlesGroup.pathItems.add();
                                handleLineR.setEntirePath([[ax, ay], [targetRx, targetRy]]);
                                handleLineR.stroked = true;
                                handleLineR.filled = false;
                                handleLineR.strokeWidth = strokeW;
                                handleLineR.strokeColor = accentCol; // hereda el color del trazo seleccionado

                                try {
                                    var tagDirR = handleLineR.tags.add(); tagDirR.name = "BitGrid_OrigDir"; tagDirR.value = rx + "," + ry;
                                    var tagAncR = handleLineR.tags.add(); tagAncR.name = "BitGrid_Anchor"; tagAncR.value = ax + "," + ay;
                                } catch(e) {}

                                var dotR = handlesGroup.pathItems.ellipse(targetRy + halfDot, targetRx - halfDot, handleDotSize, handleDotSize);
                                dotR.stroked = true;
                                dotR.filled = true;
                                dotR.fillColor = fillCol;
                                dotR.strokeWidth = strokeW;
                                dotR.strokeColor = accentCol;
                                try {
                                    var tagTipR = dotR.tags.add(); tagTipR.name = "BitGrid_Tip"; tagTipR.value = targetRx + "," + targetRy;
                                } catch(e) {}
                                countItems += 2;
                            }
                        }
                    }
                }

                // 5. ANCHORS (Marcadores Cuadrados de Puntos de Ancla)
                if (elements.anchors) {
                    var anchorsGroup = getElementContainer(layer, conGroup, separateLayers, "03_Puntos_de_Ancla", "Puntos_de_Ancla");
                    var halfA = anchorSize / 2;

                    for (var p5 = 0; p5 < targetPaths.length; p5++) {
                        var ptsA = targetPaths[p5].pathPoints;
                        for (var ptA = 0; ptA < ptsA.length; ptA++) {
                            var anc = ptsA[ptA].anchor;
                            var square = anchorsGroup.pathItems.rectangle(anc[1] + halfA, anc[0] - halfA, anchorSize, anchorSize);
                            square.stroked = true;
                            square.filled = true;
                            square.fillColor = fillCol;
                            square.strokeWidth = strokeW;
                            square.strokeColor = accentCol;
                            try {
                                var tagAncPt = square.tags.add(); tagAncPt.name = "BitGrid_Anc"; tagAncPt.value = anc[0] + "," + anc[1];
                            } catch(e) {}
                            countItems++;
                        }
                    }
                }

                // 6. CIRCLES (Círculos Constructores y Tangentes de Curvatura Reales)
                if (elements.circles) {
                    var circlesGroup = getElementContainer(layer, conGroup, separateLayers, "04_Circulos_Curvatura", "Circulos_de_Curvatura");

                    function circumcircle3Pt(A, B, C) {
                        var d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
                        if (Math.abs(d) < 1e-5) return null;
                        var a2 = A[0]*A[0] + A[1]*A[1];
                        var b2 = B[0]*B[0] + B[1]*B[1];
                        var c2 = C[0]*C[0] + C[1]*C[1];
                        var ux = (a2 * (B[1] - C[1]) + b2 * (C[1] - A[1]) + c2 * (A[1] - B[1])) / d;
                        var uy = (a2 * (C[0] - B[0]) + b2 * (A[0] - C[0]) + c2 * (B[0] - A[0])) / d;
                        var r = Math.sqrt((A[0] - ux)*(A[0] - ux) + (A[1] - uy)*(A[1] - uy));
                        return { cx: ux, cy: uy, r: r };
                    }

                    var rawCircles = [];
                    var maxRadiusLimit = Math.max(selW, selH) * 3.5;

                    for (var p6 = 0; p6 < targetPaths.length; p6++) {
                        var pathItemC = targetPaths[p6];
                        var ptsC = pathItemC.pathPoints;
                        if (!ptsC || ptsC.length < 2) continue;
                        var countPts = pathItemC.closed ? ptsC.length : (ptsC.length - 1);

                        for (var i6 = 0; i6 < countPts; i6++) {
                            var nextI6 = (i6 + 1) % ptsC.length;
                            var ptStart = ptsC[i6];
                            var ptEnd = ptsC[nextI6];

                            var P0 = ptStart.anchor;
                            var P1 = ptStart.rightDirection;
                            var P2 = ptEnd.leftDirection;
                            var P3 = ptEnd.anchor;

                            // Longitud de la cuerda entre anclas
                            var cDx = P3[0] - P0[0];
                            var cDy = P3[1] - P0[1];
                            var chordLen = Math.sqrt(cDx * cDx + cDy * cDy);
                            if (chordLen < 1.0) continue;

                            // Punto medio paramétrico del segmento Bézier (t = 0.5)
                            var Bmid = [
                                0.125 * P0[0] + 0.375 * P1[0] + 0.375 * P2[0] + 0.125 * P3[0],
                                0.125 * P0[1] + 0.375 * P1[1] + 0.375 * P2[1] + 0.125 * P3[1]
                            ];

                            // Flecha (deflexión) de la curva respecto a la cuerda recta
                            var sagitta = Math.abs(cDy * Bmid[0] - cDx * Bmid[1] + P3[0] * P0[1] - P3[1] * P0[0]) / chordLen;

                            // Si es un segmento recto (sin curva apreciable), no genera círculo de curvatura
                            if (sagitta < 0.6) continue;

                            // Cálculo del círculo circunscrito exacto que contiene el arco
                            var circObj = circumcircle3Pt(P0, Bmid, P3);
                            if (!circObj) continue;

                            // Filtros de escala técnica
                            if (circObj.r >= 3.5 && circObj.r <= maxRadiusLimit) {
                                rawCircles.push(circObj);
                            }
                        }
                    }

                    // Deduplicación inteligente (ej: 4 cuadrantes del mismo círculo o esquinas idénticas)
                    var uniqueCurvCircles = [];
                    for (var rc = 0; rc < rawCircles.length; rc++) {
                        var cand = rawCircles[rc];
                        var isDup = false;
                        for (var uc = 0; uc < uniqueCurvCircles.length; uc++) {
                            var uCir = uniqueCurvCircles[uc];
                            var dDist = Math.sqrt((cand.cx - uCir.cx) * (cand.cx - uCir.cx) + (cand.cy - uCir.cy) * (cand.cy - uCir.cy));
                            var dRad = Math.abs(cand.r - uCir.r);
                            if (dDist < 3.0 && dRad < 3.0) {
                                isDup = true;
                                break;
                            }
                        }
                        if (!isDup) {
                            uniqueCurvCircles.push(cand);
                        }
                    }

                    // Trazar los círculos constructores tangentes reales
                    for (var fc = 0; fc < uniqueCurvCircles.length; fc++) {
                        var realC = uniqueCurvCircles[fc];
                        var diamC = realC.r * 2;
                        var cPath = circlesGroup.pathItems.ellipse(realC.cy + realC.r, realC.cx - realC.r, diamC, diamC);
                        cPath.stroked = true;
                        cPath.filled = false;
                        cPath.strokeWidth = strokeW;
                        if (config.asGuides) {
                            cPath.guides = true;
                        } else {
                            cPath.strokeColor = accentCol;
                        }
                        countItems++;
                    }
                }

                // SPACING (Cotas y Marcadores de Espaciado)
                if (elements.spacing) {
                    var spaceGroup = getElementContainer(layer, conGroup, separateLayers, "08_Cotas_Espaciado", "Cotas_Espaciado");
                    var offset = Math.max(16, Math.min(50, selH * 0.14));
                    var tickLen = Math.max(4, Math.min(10, offset * 0.3));

                    // Cota Horizontal Superior (Ancho Total)
                    var topY = selT + offset;
                    var dimH = spaceGroup.pathItems.add();
                    dimH.setEntirePath([[selL, topY], [selR, topY]]);
                    dimH.stroked = true; dimH.filled = false;
                    dimH.strokeWidth = strokeW; dimH.strokeColor = accentCol;

                    var tickH1 = spaceGroup.pathItems.add();
                    tickH1.setEntirePath([[selL, topY - tickLen], [selL, topY + tickLen]]);
                    tickH1.stroked = true; tickH1.filled = false;
                    tickH1.strokeWidth = strokeW; tickH1.strokeColor = accentCol;

                    var tickH2 = spaceGroup.pathItems.add();
                    tickH2.setEntirePath([[selR, topY - tickLen], [selR, topY + tickLen]]);
                    tickH2.stroked = true; tickH2.filled = false;
                    tickH2.strokeWidth = strokeW; tickH2.strokeColor = accentCol;

                    // Cota Vertical Derecha (Alto Total)
                    var rightX = selR + offset;
                    var dimV = spaceGroup.pathItems.add();
                    dimV.setEntirePath([[rightX, selT], [rightX, selB]]);
                    dimV.stroked = true; dimV.filled = false;
                    dimV.strokeWidth = strokeW; dimV.strokeColor = accentCol;

                    var tickV1 = spaceGroup.pathItems.add();
                    tickV1.setEntirePath([[rightX - tickLen, selT], [rightX + tickLen, selT]]);
                    tickV1.stroked = true; tickV1.filled = false;
                    tickV1.strokeWidth = strokeW; tickV1.strokeColor = accentCol;

                    var tickV2 = spaceGroup.pathItems.add();
                    tickV2.setEntirePath([[rightX - tickLen, selB], [rightX + tickLen, selB]]);
                    tickV2.stroked = true; tickV2.filled = false;
                    tickV2.strokeWidth = strokeW; tickV2.strokeColor = accentCol;

                    countItems += 6;
                }


                // Aplicar opacidad general configurada a todos los grupos creados
                if (!isNaN(strokeOp) && strokeOp >= 0 && strokeOp <= 100) {
                    for (var gEnd = 0; gEnd < layer.groupItems.length; gEnd++) {
                        try { layer.groupItems[gEnd].opacity = strokeOp; } catch(e) {}
                    }
                }

                if (config.lockLayer) {
                    try { layer.locked = true; } catch(e) {}
                }

                app.redraw();

                return JSONHelper.stringify({
                    success: true,
                    elementsCount: countItems,
                    message: "Construcción generada con éxito (" + countItems + " elementos anatómicos creados)."
                });

            } catch(err) {
                return JSONHelper.stringify({
                    success: false,
                    message: "Excepción al generar construcción: " + err.toString()
                });
            }
        }
    };
})();
