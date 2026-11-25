import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasToolMeasurementBase } from "./DasToolMeasurementBase.js";

/**
 * 面积测量工具
 * setColors / getColors 专有颜色 key：lineColor、labelBackgroundColor、clipMeshColor
 */
class DasToolMeasurementArea extends DasToolMeasurementBase {
    className = "ToolMeasurementArea";

    /**
     * 激活面积测量工具（多点封闭多边形，双击结束）
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
     * @param {function} [callback] - 回调，参数为 {pointsLLH: [{longitude, latitude, height}]}
     */
    async getPointsLLH(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointsLLH", {}, callback);
    }

    /**
     * 精确测量：裁剪当前多边形内的3DTiles三角形并统计三维表面积，同时渲染三角面、把标签的面积一行替换为表面积
     * 只触发测量，不返回结果，面积与三角形数量用 getAccurateResult 获取
     * 需先取点形成至少3个点的多边形；点再变动（取点、拖拽）后精确结果自动失效，三角面隐藏、面积回落为平面面积
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async calcAreaAccurate(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "calcAreaAccurate", {}, callback);
    }

    /**
     * 获取上一次精确测量的结果，只读缓存不做计算
     * 未测量、点数不足或裁剪失败时 areaM2 与 triangleCount 均为 0
     * @param {function} [callback] - 回调，参数为 {areaM2: number, triangleCount: number}
     */
    async getAccurateResult(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getAccurateResult", {}, callback);
    }

    /**
     * 清空精确测量结果与三角面渲染，标签的面积回落为平面面积
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async clearAccurateResult(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "clearAccurateResult", {}, callback);
    }

    /**
     * 设置多边形线颜色，同步刷新已创建的线与无深度测试线（默认红色）
     * 需先调用 setToCurrent
     * @param {number[]} color - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setLineColor(color, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setLineColor", { color: color }, callback);
    }

    /**
     * 获取多边形线颜色
     * @param {function} [callback] - 回调，参数为 {color: [r,g,b,a]}
     */
    async getLineColor(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getLineColor", {}, callback);
    }

    /**
     * 设置线条粗细，同步刷新已创建的线与无深度测试线（默认 2）
     * 需先调用 setToCurrent
     * @param {number} thickness - 线条粗细
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setLineThickness(thickness, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setLineThickness", { thickness: thickness }, callback);
    }

    /**
     * 获取线条粗细
     * @param {function} [callback] - 回调，参数为 {thickness: number}
     */
    async getLineThickness(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getLineThickness", {}, callback);
    }

    /**
     * 设置无深度测试线（被遮挡部分）的透明度（默认 1）
     * 需先调用 setToCurrent
     * @param {number} ghostAlpha - 透明度（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setGhostLineAlpha(ghostAlpha, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setGhostLineAlpha", { ghostAlpha: ghostAlpha }, callback);
    }

    /**
     * 获取无深度测试线的透明度
     * @param {function} [callback] - 回调，参数为 {ghostAlpha: number}
     */
    async getGhostLineAlpha(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getGhostLineAlpha", {}, callback);
    }

    /**
     * 设置是否显示标签，只刷新可见性，不重算面积、不清空精确测量结果
     * 需先调用 setToCurrent
     * @param {boolean} showLabels - 是否显示
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setShowLabels(showLabels, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setShowLabels", { showLabels: showLabels }, callback);
    }

    /**
     * 获取是否显示标签
     * @param {function} [callback] - 回调，参数为 {showLabels: boolean}
     */
    async getShowLabels(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getShowLabels", {}, callback);
    }

    /**
     * 设置精确测量裁剪三角面颜色，同步刷新已创建的三角面（默认 [1,0.35,0,0.6]）
     * 需先调用 setToCurrent
     * @param {number[]} clipMeshColor - 颜色 [r,g,b,a]（0~1）
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setClipMeshColor(clipMeshColor, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setClipMeshColor", { clipMeshColor: clipMeshColor }, callback);
    }

    /**
     * 获取精确测量裁剪三角面颜色
     * @param {function} [callback] - 回调，参数为 {clipMeshColor: [r,g,b,a]}
     */
    async getClipMeshColor(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getClipMeshColor", {}, callback);
    }

    /**
     * 设置是否显示精确测量裁剪出的三角面（默认 true）
     * 需先调用 setToCurrent
     * @param {boolean} showClipMesh - 是否显示
     * @param {function} [callback] - 操作完成后的回调函数
     */
    async setShowClipMesh(showClipMesh, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setShowClipMesh", { showClipMesh: showClipMesh }, callback);
    }

    /**
     * 获取是否显示精确测量裁剪出的三角面
     * @param {function} [callback] - 回调，参数为 {showClipMesh: boolean}
     */
    async getShowClipMesh(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getShowClipMesh", {}, callback);
    }
}

export { DasToolMeasurementArea };
