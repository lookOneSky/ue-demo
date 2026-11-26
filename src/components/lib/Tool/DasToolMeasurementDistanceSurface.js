import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasToolMeasurementDistance } from "./DasToolMeasurementDistance.js";

/**
 * 表面距离测量工具
 * 继承距离测量工具，取点交互与距离、平距、高差标签完全一致，额外多一条贴表面的描边折线与表面距离
 * setColors / getColors 专有颜色 key：距离工具的全部 key，外加 surfaceLineColor、surfaceLabelBackgroundColor
 */
class DasToolMeasurementDistanceSurface extends DasToolMeasurementDistance {
    className = "ToolMeasurementDistanceSurface";

    /**
     * 激活表面距离测量工具（多点折线，双击结束）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setToCurrent(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {}, callback);
    }

    /**
     * 表面测量：相邻两点按采样间距（默认 5cm）等分插值，每个插值点沿投影方向发物理射线取表面点，
     * 绘制贴表面的描边折线并刷新表面距离标签。只触发测量，结果用 getSurfaceResult 获取
     * 需先取够至少 2 个点；用碰撞不用深度图，被前景遮挡与出屏都不影响，但依赖场景有碰撞体
     * 投影方向：每次点击取点时缓存点击像素的世界法线，每段取两端法线平均值的反方向；
     * 读不到法线（如移动端）时该点取朝向相机的方向。主动调用会丢弃分段缓存并全量重算
     * @param {function} callback - 操作完成后的回调函数
     */
    async calcSurfaceDistance(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "calcSurfaceDistance", {}, callback);
    }

    /**
     * 获取上一次表面测量的结果，只读缓存不做计算
     * 未测量或点数不足时 surfaceDistanceM、sampleCount、sampleValidCount 均为 0
     * sampleCount 是插值采样点总数，sampleValidCount 是真正命中碰撞体的个数，
     * 两者不等说明路径上有空洞或无碰撞体，未命中的点回退成了直线插值点
     * @param {function} callback - 回调，参数为 {surfaceDistanceM: number, sampleCount: number, sampleValidCount: number}
     */
    async getSurfaceResult(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getSurfaceResult", {}, callback);
    }

    /**
     * 清空表面测量结果与描边折线，基类的距离、平距、高差不受影响
     * @param {function} callback - 操作完成后的回调函数
     */
    async clearSurfaceResult(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "clearSurfaceResult", {}, callback);
    }

    /**
     * 设置相邻采样点的间距，越小越贴合表面越慢（默认 0.05m 即 5cm，最小 0.001m）
     * 单段采样数超过上限（默认 2000）时自动放大间距；实时模式下立即重算，否则下一次 calcSurfaceDistance 生效
     * @param {number} sampleDistanceM - 采样间距，单位 m
     * @param {function} callback - 操作完成后的回调函数
     */
    async setSampleDistance(sampleDistanceM, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setSampleDistance", { sampleDistanceM: sampleDistanceM }, callback);
    }

    /**
     * 获取采样间距
     * @param {function} callback - 回调，参数为 {sampleDistanceM: number}
     */
    async getSampleDistance(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getSampleDistance", {}, callback);
    }

    /**
     * 设置表面描边折线颜色，同步刷新已创建的折线（默认 [1,0.85,0,1]）
     * 需先调用 setToCurrent
     * @param {number[]} surfaceLineColor - 颜色 [r,g,b,a]（0~1）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setSurfaceLineColor(surfaceLineColor, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setSurfaceLineColor", { surfaceLineColor: surfaceLineColor }, callback);
    }

    /**
     * 获取表面描边折线颜色
     * @param {function} callback - 回调，参数为 {surfaceLineColor: [r,g,b,a]}
     */
    async getSurfaceLineColor(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getSurfaceLineColor", {}, callback);
    }

    /**
     * 设置是否显示表面描边折线（默认 true），只改可见性不清空测量结果
     * 需先调用 setToCurrent
     * @param {boolean} showSurfaceLine - 是否显示
     * @param {function} callback - 操作完成后的回调函数
     */
    async setShowSurfaceLine(showSurfaceLine, callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setShowSurfaceLine", { showSurfaceLine: showSurfaceLine }, callback);
    }

    /**
     * 获取是否显示表面描边折线
     * @param {function} callback - 回调，参数为 {showSurfaceLine: boolean}
     */
    async getShowSurfaceLine(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getShowSurfaceLine", {}, callback);
    }
}

export { DasToolMeasurementDistanceSurface };
