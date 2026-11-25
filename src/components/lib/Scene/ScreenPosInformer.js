import { ExcuteUEFun, isUESuccess } from "../ExcuteUEFun.js";

/**
 * ScreenPosInformer 类
 * 用于在Web界面中管理和跟踪地理位置点在屏幕上的投影位置
 * 提供点位注册、移除、查询以及屏幕位置变化事件监听等功能
 */
class ScreenPosInformer {
    static className = "ScreenPosInformer";

    static listeners = new WeakMap();

    /**
     * 监听指定点位的 UE 视口像素坐标。用最新视频帧合并同一点位的更新。
     * @param {string} pointId
     * @param {(point: {pointId:string, screenPos:number[], isVisible?:boolean}) => void} callback
     * @returns {() => void} 取消此点位的监听
     */
    static addScreenPositionsChangedListener(pointId, callback) {
        const viewer = window.viewer;
        let state = ScreenPosInformer.listeners.get(viewer);
        if (!state) {
            state = { callbacks: new Map(), points: new Map(), scheduled: false };
            ScreenPosInformer.listeners.set(viewer, state);
            function deliver() {
                state.scheduled = false;
                for (const point of state.points.values()) {
                    state.callbacks.get(point.pointId)?.(point);
                }
                state.points.clear();
            }
            viewer.addResponseEventListener(ScreenPosInformer.className, raw => {
                let points;
                try {
                    const event = JSON.parse(raw);
                    if (event.class !== ScreenPosInformer.className || event.function !== "emitMessage" ||
                        event.messageName !== "screenPositionsChanged") return;
                    points = JSON.parse(event.message).points;
                } catch { return; }
                if (!Array.isArray(points)) return;
                for (const point of points) {
                    if (state.callbacks.has(point?.pointId) && Array.isArray(point.screenPos) &&
                        point.screenPos.length >= 2 && point.screenPos.every(Number.isFinite)) {
                        state.points.set(point.pointId, { ...point, isVisible: point.isVisible ?? true });
                    }
                }
                if (state.scheduled || !state.points.size) return;
                state.scheduled = true;
                const video = document.querySelector('#streamingVideo');
                if (video?.requestVideoFrameCallback) video.requestVideoFrameCallback(deliver);
                else requestAnimationFrame(deliver);
            });
        }
        state.callbacks.set(pointId, callback);
        return () => {
            if (state.callbacks.get(pointId) !== callback) return;
            state.callbacks.delete(pointId);
            state.points.delete(pointId);
            if (!state.callbacks.size) {
                viewer.removeResponseEventListener(ScreenPosInformer.className);
                ScreenPosInformer.listeners.delete(viewer);
            }
        };
    }

    /**
     * 注册一个经纬度点位
     * @param {number} longitude - 经度
     * @param {number} latitude - 纬度
     * @param {number} [height=0] - 高度，可选参数
     * @returns {Promise<string>} 返回点位ID
     */
    static async RegisterPoint(longitude, latitude, height = 0) {
        let param = {
            posLLH: [longitude, latitude, height]
        };

        const result = await ExcuteUEFun.excuteUEFunction(ScreenPosInformer.className, "RegisterPoint", param);
        return result.pointId;
    }

    /**
     * 移除点位
     * @param {string} pointId - 点位ID
     * @returns {Promise<boolean>} 返回是否成功
     */
    static async RemovePoint(pointId) {
        let param = { pointId: pointId };
        const result = await ExcuteUEFun.excuteUEFunction(ScreenPosInformer.className, "RemovePoint", param);
        return isUESuccess(result);
    }

    /**
     * 清除所有点位
     * @returns {Promise<boolean>} 返回是否成功
     */
    static async ClearAllPoints() {
        const result = await ExcuteUEFun.excuteUEFunction(ScreenPosInformer.className, "ClearAllPoints", {});
        return isUESuccess(result);
    }
}

export { ScreenPosInformer };
