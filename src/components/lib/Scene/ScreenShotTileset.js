import { ExcuteUEFun } from "../ExcuteUEFun.js";

/**
 * JavaScript wrapper for the UWebScreenShotTileset UE component
 * 3DTiles分块高清出图：跨多帧逐块渲染，每块等3DTiles加载到位再截，
 * 整幅分辨率不受最大纹理尺寸限制，出图期间相机会被冻结，耗时可达数分钟
 */
class ScreenShotTileset {
    static className = "ScreenShotTileset";
    static _messageCallbacks = new Map();
    static _bListenerCreated = false;

    /**
     * 触发3DTiles分块高清出图
     * 出图期间每秒通过 onScreenshotProgress 推送进度，
     * 结束（含成功、失败、取消）后通过 onScreenshotCompleted 通知
     * @param {string} savePath - 出图保存路径，相对路径基于项目目录，为空则保存到 ScreenShot/TilesetShot/tile_shot.png
     * @param {number} resolutionMultiplier - 截图缩放系数，默认1.0；每边分块个数也由它推导
     * @param {number} tilesetMaxSSE - 出图期间3DTiles最大屏幕空间误差，越小越精细（默认0表示不改，保持UE侧配置）
     * @param {number} minTileCount - 每边最少分块个数（默认0表示不改，保持UE侧配置）
     * @returns {Promise<{bStarted: boolean, bCapturing: boolean}>} bStarted为false表示已有出图在进行或启动失败
     */
    static async takeScreenshot(savePath = "", resolutionMultiplier = 1.0, tilesetMaxSSE = 0, minTileCount = 0) {
        let result = { bStarted: false, bCapturing: false };
        let param = {
            savePath: savePath,
            resolutionMultiplier: resolutionMultiplier,
            tilesetMaxSSE: tilesetMaxSSE,
            minTileCount: minTileCount
        };
        await ExcuteUEFun.excuteUEFunction(ScreenShotTileset.className, "takeScreenshot", param, function (json) {
            if (json) {
                result.bStarted = json.bStarted === true;
                result.bCapturing = json.bCapturing === true;
            }
        });
        return result;
    }

    /**
     * 中止正在进行的分块出图，已落盘的分块保留
     * 中止后同样会收到 screenshotCompleted 通知
     * @returns {Promise<boolean>} 是否有正在进行的出图被中止
     */
    static async cancelScreenshot() {
        let bCancelled = false;
        await ExcuteUEFun.excuteUEFunction(ScreenShotTileset.className, "cancelScreenshot", {}, function (json) {
            if (json) {
                bCancelled = json.bCancelled === true;
            }
        });
        return bCancelled;
    }

    /**
     * 查询分块出图的当前状态
     * @returns {Promise<{bCapturing:boolean, progress:number, finishedTileCount:number, totalTileCount:number, currentTileLoadProgress:number}>}
     *          progress 取值 0~1；currentTileLoadProgress 是当前块的3DTiles加载进度，取值 0~100
     */
    static async isCapturing() {
        let result = {
            bCapturing: false,
            progress: 0,
            finishedTileCount: 0,
            totalTileCount: 0,
            currentTileLoadProgress: 0
        };
        await ExcuteUEFun.excuteUEFunction(ScreenShotTileset.className, "isCapturing", {}, function (json) {
            if (json) {
                result.bCapturing = json.bCapturing === true;
                result.progress = json.progress || 0;
                result.finishedTileCount = json.finishedTileCount || 0;
                result.totalTileCount = json.totalTileCount || 0;
                result.currentTileLoadProgress = json.currentTileLoadProgress || 0;
            }
        });
        return result;
    }

    /**
     * 监听 UE 通过 emitMessage 推送的分块出图消息
     * @param {string} message - 要监听的消息名
     * @param {function} callback - 回调函数，带数据的消息会收到已解析的对象
     * @returns {function} 取消监听函数
     */
    static onMessage(message, callback) {
        if (!ScreenShotTileset._messageCallbacks.has(message)) {
            ScreenShotTileset._messageCallbacks.set(message, new Set());
        }
        ScreenShotTileset._messageCallbacks.get(message).add(callback);

        if (!ScreenShotTileset._bListenerCreated) {
            ScreenShotTileset._bListenerCreated = true;
            window.viewer.addResponseEventListener(ScreenShotTileset.className, (json) => {
                const obj = JSON.parse(json);
                if (obj.class !== ScreenShotTileset.className) return;
                if (obj.function !== "emitMessage") return;
                if (obj.messageName === "message") {
                    // 旧模式：messageName="message"，用 obj.message 做 key，无数据
                    const cbs = ScreenShotTileset._messageCallbacks.get(obj.message);
                    if (cbs) cbs.forEach(cb => cb());
                } else {
                    // 新模式：messageName 即事件名，obj.message 是 JSON 数据
                    const cbs = ScreenShotTileset._messageCallbacks.get(obj.messageName);
                    let data = null;
                    try { data = JSON.parse(obj.message); } catch (e) { data = obj.message; }
                    if (cbs) cbs.forEach(cb => cb(data));
                }
            });
        }

        return () => {
            const set = ScreenShotTileset._messageCallbacks.get(message);
            if (set) set.delete(callback);
        };
    }

    /**
     * 监听分块出图进度，出图期间每秒推送一次
     * @param {function} callback - (data: {progress, percent, finishedTileCount, totalTileCount, currentTileLoadProgress}) => void
     *                              progress 取值 0~1，percent 取值 0~100，currentTileLoadProgress 是当前块加载进度 0~100
     * @returns {function} 取消监听函数
     */
    static onScreenshotProgress(callback) {
        return ScreenShotTileset.onMessage("screenshotProgress", callback);
    }

    /**
     * 监听分块出图结束通知，成功、失败与取消都会收到
     * @param {function} callback - 出图结束时调用，无参数
     * @returns {function} 取消监听函数
     */
    static onScreenshotCompleted(callback) {
        return ScreenShotTileset.onMessage("screenshotCompleted", callback);
    }
}

export { ScreenShotTileset };
