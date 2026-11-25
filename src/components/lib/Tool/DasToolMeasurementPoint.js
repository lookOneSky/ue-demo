import { ExcuteUEFun, parseUEMessage } from "../ExcuteUEFun.js";
import { DasToolMeasurementBase } from "./DasToolMeasurementBase.js";

/**
 * 单点坐标拾取工具
 * setColors / getColors 专有颜色 key：labelBackgroundColor
 */
class DasToolMeasurementPoint extends DasToolMeasurementBase {
    className = "ToolMeasurementPoint";

    /**
     * 激活单点拾取工具
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setToCurrent(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {}, callback);
    }

    /**
     * 清空所有拾取点
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async clearAllPoints(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "clearAllPoints", {}, callback);
    }

    /**
     * 获取当前拾取点的 LLH 坐标数组
     * @param {function} [callback] - 回调，参数为 {measurementPointsLLH: [{longitude, latitude, height}]}
     */
    async getPointsLLH(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointsLLH", {}, callback);
    }

    /**
     * 监听点更新事件（鼠标左键抬起时触发）
     * @param {function} fun - 回调，参数为 {function: "onMeasurementPointUpdate", longitude, latitude, height}，无点时三值为 0
     */
    addCallBack(fun) {
        window.viewer.addResponseEventListener(this.className, (json) => {
            let obj = parseUEMessage(json);
            if (obj.class !== this.className) return;
            if (obj.function === "onMeasurementPointUpdate") fun?.(obj);
            if (obj.function === "emitMessage" && obj.messageName === "onMeasurementPointUpdate") {
                const point = parseUEMessage(obj.message);
                if ([point.longitude, point.latitude, point.height].every(Number.isFinite)) fun?.(point);
            }
        });
    }

    removeCallBack() {
        window.viewer.removeResponseEventListener(this.className);
    }
}

export { DasToolMeasurementPoint };
