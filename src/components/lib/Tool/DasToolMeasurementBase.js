import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { ToolBase } from "./ToolBase.js";

class DasToolMeasurementBase extends ToolBase {
    /**
     * 设置测量颜色，只修改传入的 key，颜色格式 [r,g,b,a]（0~1）
     * 通用 key：normalPointColor、hoverPointColor、labelTextColor；各工具专有 key 见子类说明
     * 需先调用 setToCurrent
     * @param {Object} colors - 例 {labelTextColor: [1,1,1,1]}
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setColors(colors, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setColors", colors, callback);
    }

    /**
     * 获取当前全部测量颜色
     * @param {function} [callback] - 回调，参数为 {通用key + 专有key: [r,g,b,a]}
     */
    async getColors(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getColors", {}, callback);
    }

    /**
     * 设置普通点颜色，同步刷新已创建的点（默认白色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetNormalPointColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetNormalPointColor", { normalPointColor: color }, callback);
    }

    /**
     * 设置悬停点颜色（默认白色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetHoverPointColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetHoverPointColor", { hoverPointColor: color }, callback);
    }

    /**
     * 设置标签文字颜色，同步刷新已创建的标签（默认白色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetLabelTextColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetLabelTextColor", { labelTextColor: color }, callback);
    }
}

export { DasToolMeasurementBase };
