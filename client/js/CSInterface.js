/**
 * CSInterface - v9.4.0 (Adobe CEP Client Library)
 * Con soporte para fallback y simulacion en navegadores estandar.
 */

var CSInterface = function () {
    if (typeof window.__adobe_cep__ === "undefined") {
        this.isCEP = false;
        console.warn("[CSInterface] Entorno Adobe CEP no detectado. Modo Mock activado.");
    } else {
        this.isCEP = true;
        console.log("[CSInterface] Conectado exitosamente al Host Adobe CEP.");
    }
};

CSInterface.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";

CSInterface.prototype.getHostEnvironment = function () {
    if (this.isCEP) {
        try {
            var str = window.__adobe_cep__.getHostEnvironment();
            return JSON.parse(str);
        } catch (e) {
            console.error("[CSInterface] Error parseando getHostEnvironment:", e);
        }
    }
    return {
        appName: "ILST",
        appVersion: "28.0.0",
        appLocale: "en_US",
        appUILocale: "en_US",
        appId: "ILST",
        isAppOnline: true,
        appSkinInfo: {
            baseFontFamily: "Adobe Clean",
            baseFontSize: 12,
            appBarBackgroundColor: { color: { red: 50, green: 50, blue: 50, alpha: 255 } },
            panelBackgroundColor: { color: { red: 38, green: 38, blue: 38, alpha: 255 } }
        }
    };
};

CSInterface.prototype.closeExtension = function () {
    if (this.isCEP) {
        window.__adobe_cep__.closeExtension();
    } else {
        console.log("[CSInterface Mock] closeExtension invocada.");
    }
};

CSInterface.prototype.getSystemPath = function (pathType) {
    if (this.isCEP) {
        return window.__adobe_cep__.getSystemPath(pathType);
    }
    return "/mock/system/path";
};

CSInterface.prototype.evalScript = function (script, callback) {
    if (this.isCEP) {
        if (callback === null || callback === undefined) {
            callback = function () {};
        }
        window.__adobe_cep__.evalScript(script, callback);
    } else {
        console.log("[CSInterface Mock] evalScript ejecutado:\n", script);
        if (typeof callback === "function") {
            setTimeout(function () {
                var mockResult = JSON.stringify({
                    success: true,
                    message: "Modo Mock: Guias simuladas con exito fuera de Illustrator",
                    data: { count: 32, type: "preview", layer: "GridIt_Custom_Layer" }
                });
                callback(mockResult);
            }, 300);
        }
    }
};

CSInterface.prototype.addEventListener = function (type, listener, obj) {
    if (this.isCEP) {
        window.__adobe_cep__.addEventListener(type, listener, obj);
    } else {
        console.log("[CSInterface Mock] addEventListener:", type);
    }
};

CSInterface.prototype.removeEventListener = function (type, listener, obj) {
    if (this.isCEP) {
        window.__adobe_cep__.removeEventListener(type, listener, obj);
    }
};

CSInterface.prototype.requestOpenExtension = function (extensionId, params) {
    if (this.isCEP) {
        window.__adobe_cep__.requestOpenExtension(extensionId, params);
    }
};

CSInterface.prototype.dispatchEvent = function (event) {
    if (this.isCEP) {
        window.__adobe_cep__.dispatchEvent(event);
    }
};