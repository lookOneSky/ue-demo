import createGuid from "./guid.js";

const requestsByViewer = new WeakMap();

// The response channel also carries plain text and messages from other features.
export function parseUEMessage(raw) {
    try { return JSON.parse(raw) ?? {}; } catch { return {}; }
}

export function isUEFailure(reply) {
    return reply?.result === "Fail" || reply?.result === false || reply?.success === false;
}

export function isUESuccess(reply) {
    if (isUEFailure(reply)) return false;
    return reply?.result === "Success" || reply?.result === true || reply?.success === true;
}

function getRequests(viewer) {
    let requests = requestsByViewer.get(viewer);
    if (requests) return requests;

    requests = new Map();
    requestsByViewer.set(viewer, requests);
    viewer.addResponseEventListener("DasExcuteReturn", raw => {
        const reply = parseUEMessage(raw);
        const request = requests.get(reply?.commandID);
        if (request && request.className === reply.class) request.resolve(reply);
    });
    const disconnect = () => {
        for (const request of requests.values()) request.reject(new Error("UE 连接已断开"));
    };
    viewer.stream?.addEventListener("dataChannelClose", disconnect);
    viewer.stream?.addEventListener("webRtcDisconnected", disconnect);
    viewer.stream?.addEventListener("webRtcFailed", disconnect);
    viewer.addEventListener?.("dispose", disconnect);
    return requests;
}

class ExcuteUEFun {
    /**
     * @param {string} strclass
     * @param {string} strFun
     * @param {object} param
     * @param {(reply: Record<string, any>) => void} [callback]
     * @returns {Promise<Record<string, any>>}
     */
    static async excuteUEFunction(strclass, strFun, param, callback) {
        const viewer = window.viewer;
        if (!viewer) throw new Error("UE 视口尚未初始化");

        const requests = getRequests(viewer);
        const commandID = createGuid();
        const message = { class: strclass, function: strFun, commandID, param };
        let timer;
        try {
            const reply = await new Promise((resolve, reject) => {
                requests.set(commandID, { className: strclass, resolve, reject });
                timer = setTimeout(() => reject(new Error("等待 UE 回包超时，执行结果未知")), 60000);
                if (viewer.sendMessage(message) === false) reject(new Error("UE 数据通道未就绪，调用未发送"));
            });
            callback?.(reply);
            return reply;
        } catch (error) {
            viewer.dispatchEvent?.(new CustomEvent("ueCommandError", { detail: { commandID, message: String(error) } }));
            throw error;
        } finally {
            clearTimeout(timer);
            requests.delete(commandID);
        }
    }
}
export { ExcuteUEFun };
