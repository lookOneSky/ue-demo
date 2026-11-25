import { ExcuteUEFun, parseUEMessage } from "../ExcuteUEFun.js";

class DasElectron {
    static className = "DasElectron";
    static _listeningViewer = null;

    /// 显示UE程序窗口
    static async showUEWindow() {
        let result = { success: false, message: "" };
        await ExcuteUEFun.excuteUEFunction(DasElectron.className, "showUEWindow", {}, function (json) {
            if (json) {
                result.success = json.success || false;
                result.message = json.message || "";
            }
        });
        return result;
    }

    /// 隐藏UE程序窗口
    static async hideUEWindow() {
        let result = { success: false, message: "" };
        await ExcuteUEFun.excuteUEFunction(DasElectron.className, "hideUEWindow", {}, function (json) {
            if (json) {
                result.success = json.success || false;
                result.message = json.message || "";
            }
        });
        return result;
    }

    /// 关闭UE程序
    static async closeUEApplication() {
        let result = { success: false, message: "" };
        await ExcuteUEFun.excuteUEFunction(DasElectron.className, "closeUEApplication", {}, function (json) {
            if (json) {
                result.success = json.success || false;
                result.message = json.message || "";
            }
        });
        return result;
    }

    /// 设置是否检查鼠标穿透。bCheck: true=检查 false=不检查
    static SetCheckMousePassThrough(bCheck) {
        if (window.electronAPI && window.electronAPI.bridge) {
            window.electronAPI.bridge.send('DasElectron', JSON.stringify({ checkPassThrough: bCheck }))
        }
        // 补充通知UE，UE侧广播OnCheckMousePassThrough
        ExcuteUEFun.excuteUEFunction(DasElectron.className, "setCheckMousePassThrough", { bCheckPassThrough: bCheck });
    }

    /// 设置是否命令控制鼠标穿透。bIsPassThroughByCommand: true=命令控制 false=恢复自动跟踪
    static SetElectronCheckMousePassThrough(bIsPassThroughByCommand) {
        if (window.electronAPI && window.electronAPI.bridge) {
            window.electronAPI.bridge.send('DasElectron', JSON.stringify({ IsPassThroughByCommand: bIsPassThroughByCommand }))
        }
    }

    /// 监听UE发来的DasElectron消息，转发IsPassThroughByCommand到Electron
    static initListener() {
        if (DasElectron._listeningViewer === window.viewer) return;
        DasElectron._listeningViewer = window.viewer;
        window.viewer.addResponseEventListener(DasElectron.className, (json) => {
            const obj = parseUEMessage(json);
            if (obj.class !== DasElectron.className || obj.function !== 'emitMessage') return;
            if (obj.messageName === 'IsPassThroughByCommand') {
                const data = parseUEMessage(obj.message);
                DasElectron.SetElectronCheckMousePassThrough(data.IsPassThroughByCommand);
            }
        });
    }

    /// 关闭Electron应用
    static closeElectronApp() {
        if (window.electronAPI && window.electronAPI.bridge) {
            window.electronAPI.bridge.send('DasElectron', JSON.stringify({ closeElectronApp: true }))
        }
    }

    /// 设置鼠标穿透。bMousePassThrough: true=穿透 false=不穿透
    static async setMousePassThrough(bMousePassThrough) {
        let result = { success: false, message: "" };
        await ExcuteUEFun.excuteUEFunction(DasElectron.className, "setMousePassThrough", { bMousePassThrough: bMousePassThrough }, function (json) {
            if (json) {
                result.success = json.success || false;
                result.message = json.message || "";
            }
        });
        return result;
    }
}

export default DasElectron;
