import { ExcuteUEFun, isUESuccess, parseUEMessage } from "../ExcuteUEFun.js";

/**
 * JavaScript wrapper for the UWebScene UE component
 * Provides scene-related utility functions
 */
class Scene {
    static className = "Scene";
    static _sceneMessageCallbacks = new Map();
    static _listeningViewer = null;

    static async screenToWorld(screenX, screenY) {
        let result = {};
        let param = {
            screenX: screenX,
            screenY: screenY
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "screenToWorld", param, function (json) {
            result = json.posLLH;
        });
        return result;
    }

    /**
     * 加载指定的关卡
     * @param {string} levelName - 关卡名称
     * @param {boolean} makeVisible - 是否使关卡可见，默认为true
     * @returns {Promise<boolean>} 是否成功发起加载请求
     */
    static async loadLevel(levelName, makeVisible = true) {
        let result = false;
        let param = {
            levelName: levelName,
            makeVisible: makeVisible
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "loadLevel", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 卸载指定的关卡
     * @param {string} levelName - 关卡名称
     * @returns {Promise<boolean>} 是否成功发起卸载请求
     */
    static async unloadLevel(levelName) {
        let result = false;
        let param = {
            levelName: levelName
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "unloadLevel", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 切换操作器类型
     * @param {string} pawnType - 操作器类型 ("Pawn_Universal", "Pawn_ThirdPerson" 或 "Pawn_FreeFlight")
     * @returns {Promise<boolean>} 是否成功切换
     */
    static async switchPawnType(pawnType) {
        let success = false;
        let param = {
            pawnType: pawnType
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "switchPawnType", param, function (json) {
            success = isUESuccess(json);
        });
        return success;
    }

    /**
     * 获取当前操作器类型
     * @returns {Promise<string>} 当前操作器类型 ("Pawn_Universal", "Pawn_ThirdPerson", 或 "Unknown")
     */
    static async getCurrentPawnType() {
        let currentType = 'Unknown';
        await ExcuteUEFun.excuteUEFunction(Scene.className, "getCurrentPawnType", {}, function (json) {
            // C++ getCurrentPawnType 写出 "pawnType": "..." 到 writer
            if (json && json.pawnType) {
                currentType = json.pawnType;
            }
        });
        return currentType;
    }

    /**
     * 设置投影模式
     * @param {boolean} bPerspective - true为透视投影，false为正交投影
     * @returns {Promise<boolean>} 是否成功设置
     */
    static async setPerspectiveProjection(bPerspective) {
        let result = false;
        let param = {
            bPerspective: bPerspective
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "setPerspectiveProjection", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 获取当前投影模式
     * @returns {Promise<boolean>} 当前是否为透视投影
     */
    static async getPerspectiveProjection() {
        let bPerspective = true;
        await ExcuteUEFun.excuteUEFunction(Scene.className, "getPerspectiveProjection", {}, function (json) {
            if (json && json.bPerspective !== undefined) {
                bPerspective = json.bPerspective;
            }
        });
        return bPerspective;
    }

    /**
     * 获取指定经纬度的高度
     * @param {number} longitude - 经度
     * @param {number} latitude - 纬度
     * @returns {Promise<{height: number, success: boolean}>} 高度信息和成功状态
     */
    static async getHeightAtLongLat(longitude, latitude) {
        let result = { height: 0.0, success: false };
        let param = {
            longitude: longitude,
            latitude: latitude
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "getHeightAtLongLat", param, function (json) {
            if (json) {
                result.height = json.height || 0.0;
                result.success = json.success || false;
            }
        });
        return result;
    }

    /**
     * 设置屏幕碰撞开关
     * @param {boolean} enable 是否启用屏幕碰撞
     * @returns {Promise<boolean>} 是否设置成功
     */
    static async setScreenCollisionEnable(enable) {
        let result = false;
        let param = {
            enableScreenCollision: enable
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "SetSceneScreenCollisionEnable", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 截图
     * 截图完成后 UE 会通过 message 事件发送 "screenshotCompleted" 通知
     * @param {string} savePath - 截图保存路径，为空则保存到默认目录
     * @param {number} resolutionMultiplier - 缩放系数，默认1.0
     * @param {number} tilesScreenSpaceError - 截图期间3DTiles屏幕空间误差，越小越精细（默认0表示不调整）；
     *                                         调小后会强制加载高精度瓦片，大场景可能有明显卡顿
     * @returns {Promise<boolean>} 是否成功触发截图
     */
    static async takeScreenshot(savePath = "", resolutionMultiplier = 1.0, tilesScreenSpaceError = 0) {
        let result = false;
        let param = {
            savePath: savePath,
            resolutionMultiplier: resolutionMultiplier,
            "3DtilesScreenSpaceError": tilesScreenSpaceError
        };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "takeScreenshot", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 设置场景地理原点（经纬度高度）
     * @param {number} longitude - 经度
     * @param {number} latitude - 纬度
     * @param {number} height - 高度（米）
     * @returns {Promise<boolean>} 是否成功
     */
    static async SetOriginLLH(longitude, latitude, height) {
        let result = false;
        let param = { longitude, latitude, height };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "SetOriginLLH", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 获取正交投影宽度
     * 透视模式下根据 FOV 与整屏深度中位数计算，正交模式下返回相机当前值
     * @returns {Promise<number>} orthoWidth
     */
    static async getOrthoWidth() {
        let orthoWidth = 0;
        await ExcuteUEFun.excuteUEFunction(Scene.className, "getOrthoWidth", {}, function (json) {
            if (json && json.orthoWidth !== undefined) {
                orthoWidth = json.orthoWidth;
            }
        });
        return orthoWidth;
    }

    /**
     * 设置正交投影宽度，仅正交模式生效
     * @param {number} orthoWidth - 正交宽度（厘米），需大于0
     * @returns {Promise<boolean>} 是否设置成功（透视模式下为 false）
     */
    static async setOrthoWidth(orthoWidth) {
        let result = false;
        let param = { orthoWidth: orthoWidth };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "setOrthoWidth", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 切换到指定顺序关卡（ADasSequenceLevelControl）
     * @param {string} levelName - 要加载的关卡名称
     * @returns {Promise<boolean>} 是否成功触发
     */
    static async loadNextLevel(levelName) {
        let result = false;
        let param = { levelName: levelName };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "loadNextLevel", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 多点异步高度查询，结果通过 onPointsHeightResult 回调返回
     * @param {Array<{longitude:number, latitude:number, height?:number}>} points
     * @returns {Promise<boolean>} 是否成功触发
     */
    static async getPointsHeightAsync(points) {
        let result = false;
        let param = { points };
        await ExcuteUEFun.excuteUEFunction(Scene.className, "getPointsHeightAsync", param, function (json) {
            result = isUESuccess(json);
        });
        return result;
    }

    /**
     * 监听多点高度查询结果
     * @param {function} callback - (data: {points: [{longitude, latitude, height, success}]}) => void
     * @returns {() => void} 取消监听函数
     */
    static onPointsHeightResult(callback) {
        return Scene.onSceneMessage("pointsHeightResult", callback);
    }

    /**
     * 监听 UE 通过 emitMessage 推送的 Scene 消息
     * @param {string} message - 要监听的消息内容（对应 emitMessage 第二个参数）
     * @param {function} callback - 回调函数 () => void
     * @returns {() => void} 取消监听函数
     */
    static onSceneMessage(message, callback) {
        if (!Scene._sceneMessageCallbacks.has(message)) {
            Scene._sceneMessageCallbacks.set(message, new Set());
        }
        Scene._sceneMessageCallbacks.get(message).add(callback);

        if (Scene._listeningViewer !== window.viewer) {
            Scene._listeningViewer = window.viewer;
            window.viewer.addResponseEventListener(Scene.className, (json) => {
                const obj = parseUEMessage(json);
                if (obj.class !== Scene.className) return;
                if (obj.function !== "emitMessage") return;
                if (obj.messageName === "message") {
                    // 旧模式：messageName="message"，用 obj.message 做 key，无数据
                    const cbs = Scene._sceneMessageCallbacks.get(obj.message);
                    if (cbs) cbs.forEach(cb => cb());
                } else {
                    // 新模式：messageName 即事件名，obj.message 是 JSON 数据
                    const cbs = Scene._sceneMessageCallbacks.get(obj.messageName);
                    let data = null;
                    try { data = JSON.parse(obj.message); } catch(e) { data = obj.message; }
                    if (cbs) cbs.forEach(cb => cb(data));
                }
            });
        }

        return () => {
            const set = Scene._sceneMessageCallbacks.get(message);
            if (set) set.delete(callback);
        };
    }

    /**
     * 监听截图完成通知
     * @param {function} callback - 截图完成时调用
     * @returns {() => void} 取消监听函数
     */
    static onScreenshotCompleted(callback) {
        return Scene.onSceneMessage("screenshotCompleted", callback);
    }
}

export default Scene;
