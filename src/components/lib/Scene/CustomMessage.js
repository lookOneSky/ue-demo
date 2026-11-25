import { ExcuteUEFun, parseUEMessage } from "../ExcuteUEFun.js";

/**
 * JavaScript wrapper for UWebCustomMessage UE component
 * 提供Web与UE之间的双向自定义消息通道
 */
class CustomMessage {
    static className = "CustomMessage";
    static mapName2Callback = new Map(); // messageName -> callback
    static _listeningViewer = null;

    /**
     * 从Web端发送自定义消息到UE
     * @param {string} messageName - 消息名称
     * @param {string} message - 消息内容
     * @returns {Promise<boolean>} 是否成功发送
     */
    static async MessageFromWeb(messageName, message) {
        let result = false;
        let param = {
            messageName: messageName,
            message: message
        };
        await ExcuteUEFun.excuteUEFunction(CustomMessage.className, "MessageFromWeb", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 注册监听UE推送的自定义消息（MessageToWeb方向）
     * @param {string} messageName - 要监听的消息名称
     * @param {function} callback - 回调函数 (messageName: string, message: string) => void
     */
    static MessageToWeb(messageName, callback) {
        CustomMessage.mapName2Callback.set(messageName, callback);

        if (CustomMessage._listeningViewer !== window.viewer) {
            CustomMessage._listeningViewer = window.viewer;
            window.viewer.addResponseEventListener(CustomMessage.className, (json) => {
                let obj = parseUEMessage(json);
                if (obj.class != CustomMessage.className) return;
                if (obj.function != "emitMessage") return;

                const cb = CustomMessage.mapName2Callback.get(obj.messageName);
                if (cb) {
                    cb(obj.messageName, obj.message);
                }
            });
        }
    }
}

export { CustomMessage };
