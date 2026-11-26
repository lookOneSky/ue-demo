import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasToolMeasurementBase } from "./DasToolMeasurementBase.js";

/**
 * 角度测量工具
 * 取点顺序：第一点为边点、第二点为角点、第三点为另一边点
 * 第三点落下前随鼠标移动实时更新角度，第四次左键清空重新开始
 * setColors / getColors 专有颜色 key：sideLineColor、arcLineColor、labelBackgroundColor
 */
class DasToolMeasurementAngle extends DasToolMeasurementBase {
    className = "ToolMeasurementAngle";

    /**
     * 激活角度测量工具
     * @param {function} callback - 操作完成后的回调函数
     */
    async setToCurrent(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {}, callback);
    }

    /**
     * 清空所有测量点
     * @param {function} callback - 操作完成后的回调函数
     */
    async clearAllPoints(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "clearAllPoints", {}, callback);
    }

    /**
     * 获取当前测量点的 LLH 坐标数组，顺序为 边点、角点、另一边点
     * @param {function} callback - 回调，参数为 {pointsLLH: [{longitude, latitude, height}]}
     */
    async getPointsLLH(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointsLLH", {}, callback);
    }

    /**
     * 获取当前夹角，单位度，范围 0~180
     * 点数不足三个或有一条边退化成点时 valid 为 false
     * @param {function} callback - 回调，参数为 {angleDeg: number, valid: boolean}
     */
    async getAngle(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getAngle", {}, callback);
    }

    /**
     * 设置两条边的线颜色，同步刷新已创建的线与无深度测试线（默认红色）
     * 需先调用 setToCurrent
     * @param {number[]} sideLineColor - 颜色 [r,g,b,a]（0~1）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setSideLineColor(sideLineColor, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setSideLineColor", { sideLineColor: sideLineColor }, callback);
    }

    /**
     * 获取两条边的线颜色
     * @param {function} callback - 回调，参数为 {sideLineColor: [r,g,b,a]}
     */
    async getSideLineColor(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getSideLineColor", {}, callback);
    }

    /**
     * 设置夹角圆弧颜色，同步刷新已创建的线与无深度测试线（默认黄色）
     * 需先调用 setToCurrent
     * @param {number[]} arcLineColor - 颜色 [r,g,b,a]（0~1）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setArcLineColor(arcLineColor, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setArcLineColor", { arcLineColor: arcLineColor }, callback);
    }

    /**
     * 获取夹角圆弧颜色
     * @param {function} callback - 回调，参数为 {arcLineColor: [r,g,b,a]}
     */
    async getArcLineColor(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getArcLineColor", {}, callback);
    }

    /**
     * 设置线条粗细，同步刷新全部线组件（默认 2）
     * 需先调用 setToCurrent
     * @param {number} thickness - 线条粗细
     * @param {function} callback - 操作完成后的回调函数
     */
    async setLineThickness(thickness, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setLineThickness", { thickness: thickness }, callback);
    }

    /**
     * 获取线条粗细
     * @param {function} callback - 回调，参数为 {thickness: number}
     */
    async getLineThickness(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getLineThickness", {}, callback);
    }

    /**
     * 设置无深度测试线（被遮挡部分）的透明度（默认 1）
     * 需先调用 setToCurrent
     * @param {number} ghostAlpha - 透明度（0~1）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setGhostLineAlpha(ghostAlpha, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setGhostLineAlpha", { ghostAlpha: ghostAlpha }, callback);
    }

    /**
     * 获取无深度测试线的透明度
     * @param {function} callback - 回调，参数为 {ghostAlpha: number}
     */
    async getGhostLineAlpha(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getGhostLineAlpha", {}, callback);
    }

    /**
     * 设置无深度测试线是否绘制为虚线（默认 true）
     * 需先调用 setToCurrent
     * @param {boolean} ghostDashed - 是否虚线
     * @param {function} callback - 操作完成后的回调函数
     */
    async setGhostLineDashed(ghostDashed, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setGhostLineDashed", { ghostDashed: ghostDashed }, callback);
    }

    /**
     * 获取无深度测试线是否绘制为虚线
     * @param {function} callback - 回调，参数为 {ghostDashed: boolean}
     */
    async getGhostLineDashed(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getGhostLineDashed", {}, callback);
    }

    /**
     * 设置带深度测试线是否绘制为虚线（默认 false，即实线）
     * 需先调用 setToCurrent
     * @param {boolean} solidDashed - 是否虚线
     * @param {function} callback - 操作完成后的回调函数
     */
    async setSolidLineDashed(solidDashed, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setSolidLineDashed", { solidDashed: solidDashed }, callback);
    }

    /**
     * 获取带深度测试线是否绘制为虚线
     * @param {function} callback - 回调，参数为 {solidDashed: boolean}
     */
    async getSolidLineDashed(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getSolidLineDashed", {}, callback);
    }

    /**
     * 设置是否显示角度标签，只刷新可见性不重算角度（默认 true）
     * 需先调用 setToCurrent
     * @param {boolean} showLabels - 是否显示
     * @param {function} callback - 操作完成后的回调函数
     */
    async setShowLabels(showLabels, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setShowLabels", { showLabels: showLabels }, callback);
    }

    /**
     * 获取是否显示角度标签
     * @param {function} callback - 回调，参数为 {showLabels: boolean}
     */
    async getShowLabels(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getShowLabels", {}, callback);
    }

    /**
     * 设置是否显示夹角圆弧，会触发一次重绘（默认 true）
     * 需先调用 setToCurrent
     * @param {boolean} showArc - 是否显示
     * @param {function} callback - 操作完成后的回调函数
     */
    async setShowArc(showArc, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setShowArc", { showArc: showArc }, callback);
    }

    /**
     * 获取是否显示夹角圆弧
     * @param {function} callback - 回调，参数为 {showArc: boolean}
     */
    async getShowArc(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getShowArc", {}, callback);
    }

    /**
     * 设置圆弧半径占较短边长度的比例，会触发一次重绘（默认 0.25）
     * 需先调用 setToCurrent
     * @param {number} arcRadiusRatio - 比例（0~1）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setArcRadiusRatio(arcRadiusRatio, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setArcRadiusRatio", { arcRadiusRatio: arcRadiusRatio }, callback);
    }

    /**
     * 获取圆弧半径占较短边长度的比例
     * @param {function} callback - 回调，参数为 {arcRadiusRatio: number}
     */
    async getArcRadiusRatio(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getArcRadiusRatio", {}, callback);
    }

    /**
     * 设置圆弧的折线分段数，会触发一次重绘（默认 32），越大圆弧越平滑
     * 需先调用 setToCurrent
     * @param {number} arcSegmentCount - 分段数
     * @param {function} callback - 操作完成后的回调函数
     */
    async setArcSegmentCount(arcSegmentCount, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setArcSegmentCount", { arcSegmentCount: arcSegmentCount }, callback);
    }

    /**
     * 获取圆弧的折线分段数
     * @param {function} callback - 回调，参数为 {arcSegmentCount: number}
     */
    async getArcSegmentCount(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getArcSegmentCount", {}, callback);
    }

    /**
     * 设置标签沿角平分线延长线的额外像素偏移（默认 10），叠加在对齐偏移之上
     * 标签按延长线的屏幕方向自动居左/右/上/下
     * 需先调用 setToCurrent
     * @param {number} labelPixelOffset - 像素间距
     * @param {function} callback - 操作完成后的回调函数
     */
    async setLabelPixelOffset(labelPixelOffset, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setLabelPixelOffset", { labelPixelOffset: labelPixelOffset }, callback);
    }

    /**
     * 获取标签沿角平分线延长线的额外像素偏移
     * @param {function} callback - 回调，参数为 {labelPixelOffset: number}
     */
    async getLabelPixelOffset(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getLabelPixelOffset", {}, callback);
    }

    /**
     * 一次性设置全部参数，各 key 可选，只修改传入项
     * 可用 key：setColors 的全部颜色 key（normalPointColor、hoverPointColor、labelTextColor、sideLineColor、arcLineColor、labelBackgroundColor）、
     * thickness、ghostAlpha、ghostDashed、solidDashed、showLabels、showArc、arcRadiusRatio、arcSegmentCount、labelPixelOffset
     * 需先调用 setToCurrent
     * @param {Object} params - 例 {sideLineColor: [1,0,0,1], thickness: 3, showArc: true}
     * @param {function} callback - 操作完成后的回调函数
     */
    async updateAll(params, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "updateAll", params, callback);
    }
}

export { DasToolMeasurementAngle };
