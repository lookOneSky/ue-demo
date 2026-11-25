import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasToolMeasurementBase } from "./DasToolMeasurementBase.js";

/**
 * 距离测量工具
 * setColors / getColors 专有颜色 key：
 * pathLineColor、horizontalLineColor、verticalLineColor、
 * distanceLabelBackgroundColor、horizontalLabelBackgroundColor、heightDiffLabelBackgroundColor
 */
class DasToolMeasurementDistance extends DasToolMeasurementBase {
    className = "ToolMeasurementDistance";

    /**
     * 激活距离测量工具（多点折线，双击结束）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setToCurrent(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {}, callback);
    }

    /**
     * 清空所有测量点
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async clearAllPoints(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "clearAllPoints", {}, callback);
    }

    /**
     * 获取当前测量点的 LLH 坐标数组
     * @param {function} [callback] - 回调，参数为 {measurementPointsLLH: [{longitude, latitude, height}]}
     */
    async getPointsLLH(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointsLLH", {}, callback);
    }

    /**
     * 设置路径折线颜色，同步刷新已创建的线与无深度测试线（默认红色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetPathLineColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetPathLineColor", { pathLineColor: color }, callback);
    }

    /**
     * 设置平距线颜色，同步刷新已创建的线与无深度测试线（默认绿色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetHorizontalLineColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetHorizontalLineColor", { horizontalLineColor: color }, callback);
    }

    /**
     * 设置高差线颜色，同步刷新已创建的线与无深度测试线（默认蓝色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetVerticalLineColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetVerticalLineColor", { verticalLineColor: color }, callback);
    }

    /**
     * 设置距离标签背景色（默认红色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetDistanceLabelBackgroundColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetDistanceLabelBackgroundColor", { distanceLabelBackgroundColor: color }, callback);
    }

    /**
     * 设置平距标签背景色（默认绿色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetHorizontalLabelBackgroundColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetHorizontalLabelBackgroundColor", { horizontalLabelBackgroundColor: color }, callback);
    }

    /**
     * 设置高差标签背景色（默认蓝色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async SetHeightDiffLabelBackgroundColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "SetHeightDiffLabelBackgroundColor", { heightDiffLabelBackgroundColor: color }, callback);
    }

    /**
     * 更新全部颜色，依次调用各 Set 接口，只修改传入的 key，未传的保持原值
     * 需先调用 setToCurrent
     * @param {Object} colors - 颜色对象，值为 [r,g,b,a]（0~1），可选 key：
     * normalPointColor、hoverPointColor、labelTextColor、
     * pathLineColor、horizontalLineColor、verticalLineColor、
     * distanceLabelBackgroundColor、horizontalLabelBackgroundColor、heightDiffLabelBackgroundColor
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async UpdateAll(colors, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "UpdateAll", colors, callback);
    }
}

export { DasToolMeasurementDistance };
