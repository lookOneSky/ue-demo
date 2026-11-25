import { ExcuteUEFun, parseUEMessage } from "../ExcuteUEFun.js";

class DasEmbedViewer {
    static className = "DasEmbedViewer";
    static _listeningViewer = null;
    static _setUrlChangeCallback = new Set();

    /// 获取当前内嵌WebView Url。返回 { success, embedViewerUrl }
    static async getEmbedViewerUrl() {
        let result = { success: false, embedViewerUrl: "" };
        await ExcuteUEFun.excuteUEFunction(DasEmbedViewer.className, "getEmbedViewerUrl", {}, function (json) {
            if (json) {
                result.success = json.success || false;
                result.embedViewerUrl = json.embedViewerUrl || "";
            }
        });
        return result;
    }

    /// 监听UE内嵌WebView Url变化。callback(embedViewerUrl)
    static onUrlChange(callback) {
        DasEmbedViewer._setUrlChangeCallback.add(callback);
        if (DasEmbedViewer._listeningViewer === window.viewer) return;
        DasEmbedViewer._listeningViewer = window.viewer;
        window.viewer.addResponseEventListener(DasEmbedViewer.className, (json) => {
            const obj = parseUEMessage(json);
            if (obj.class !== DasEmbedViewer.className || obj.function !== 'emitMessage') return;
            if (obj.messageName !== 'EmbedViewerUrlChange') return;
            const data = parseUEMessage(obj.message);
            DasEmbedViewer._setUrlChangeCallback.forEach(cb => cb(data.embedViewerUrl));
        });
    }
}

export default DasEmbedViewer;
