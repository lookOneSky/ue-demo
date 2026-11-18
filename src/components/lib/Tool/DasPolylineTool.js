import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { PointToolClass } from "./PointTool.js";

/**
 * JavaScript wrapper for the DasPolylineTool UE component
 * Provides functionality for managing polylines in the Unreal Engine environment
 */
class DasPolylineToolClass extends PointToolClass {
    className = "DasPolylineTool"; // UE类名

    /**
     * 设置DasPolylineTool为当前活动工具
     */
    async setToCurrent() {
        let param = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", param);
    }

    /**
     * 设置线条颜色
     * @param {Array<number>} color - Color as [r, g, b, a] where each value is 0-1
     */
    async setLineColor(color) {
        const param = { color: color };
        await ExcuteUEFun.excuteUEFunction(this.className, "setLineColor", param);
    }

    /**
     * 获取线条颜色
     * @returns {Promise<Array<number>>} - Color as [r, g, b, a]
     */
    async getLineColor() {
        let result = [1, 1, 1, 1];
        await ExcuteUEFun.excuteUEFunction(this.className, "getLineColor", {}, (json) => {
            result = json.color;
        });
        return result;
    }

    /**
     * 设置线条粗细
     * @param {number} thickness - Line thickness
     * @param {boolean} [screenSpace=true] - Whether thickness is screen space fixed
     */
    async setLineThickness(thickness, screenSpace = true) {
        const param = { thickness: thickness, screenSpace: screenSpace };
        await ExcuteUEFun.excuteUEFunction(this.className, "setLineThickness", param);
    }

    /**
     * 获取线条粗细
     * @returns {Promise<number>} - Line thickness
     */
    async getLineThickness() {
        let result = 1.0;
        await ExcuteUEFun.excuteUEFunction(this.className, "getLineThickness", {}, (json) => {
            result = json.thickness;
        });
        return result;
    }

    /**
     * 设置深度测试
     * @param {boolean} enableDepthTest - Whether to enable depth testing
     */
    async setDepthTest(enableDepthTest) {
        const param = { enableDepthTest: enableDepthTest };
        await ExcuteUEFun.excuteUEFunction(this.className, "setDepthTest", param);
    }

    /**
     * 获取深度测试设置
     * @returns {Promise<boolean>} - Whether depth testing is enabled
     */
    async getDepthTest() {
        let enabled = true;
        await ExcuteUEFun.excuteUEFunction(this.className, "getDepthTest", {}, (json) => {
            enabled = json.enableDepthTest;
        });
        return enabled;
    }

    /**
     * 设置线条可见性
     * @param {boolean} visible - Whether the line should be visible
     */
    async setLineVisible(visible) {
        const param = { visible: visible };
        await ExcuteUEFun.excuteUEFunction(this.className, "setLineVisible", param);
    }

    /**
     * 获取线条可见性
     * @returns {Promise<boolean>} - Whether the line is visible
     */
    async getLineVisible() {
        let visible = true;
        await ExcuteUEFun.excuteUEFunction(this.className, "getLineVisible", {}, (json) => {
            visible = json.visible;
        });
        return visible;
    }

    /**
     * 设置样条插值设置
     * @param {Object} splineConfig - Spline configuration
     * @param {boolean} [splineConfig.enableSpline] - Whether to enable spline interpolation
     * @param {number} [splineConfig.interpolateCount] - Number of interpolation points
     */
    async setSplinePoint(splineConfig) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setSplinePoint", splineConfig);
    }

    /**
     * 获取样条插值设置
     * @returns {Promise<Object>} - Object containing enableSpline and interpolateCount
     */
    async getSplinePoint() {
        let result = { enableSpline: false, interpolateCount: 10 };
        await ExcuteUEFun.excuteUEFunction(this.className, "getSplinePoint", {}, (json) => {
            result.enableSpline = json.enableSpline;
            result.interpolateCount = json.interpolateCount;
        });
        return result;
    }

    /**
     * 检查是否有点
     * @returns {Promise<boolean>} - Whether points exist
     */
    async hasPoints() {
        let hasPoints = false;
        await ExcuteUEFun.excuteUEFunction(this.className, "hasPoints", {}, (json) => {
            hasPoints = json.hasPoints;
        });
        return hasPoints;
    }

    /**
     * 一次性更新所有折线属性
     * @param {Object} param - An object containing the properties to update
     * @param {Array<number>} [param.color] - Color as [r, g, b, a] where each value is 0-1
     * @param {number} [param.thickness] - Line thickness
     * @param {boolean} [param.screenSpace] - Whether thickness is screen space fixed
     * @param {boolean} [param.enableDepthTest] - Whether to enable depth testing
     * @param {boolean} [param.visible] - Whether the line should be visible
     * @param {boolean} [param.enableSpline] - Whether to enable spline interpolation
     * @param {number} [param.interpolateCount] - Number of interpolation points
     */
    async updateAll(param) {
        await ExcuteUEFun.excuteUEFunction(this.className, "updateAll", param);
    }

    /**
     * 一次性获取所有折线属性
     * @returns {Promise<Object>} - Object containing all polyline properties
     */
    async getAll() {
        let result = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "getAll", {}, (json) => {
            result = json;
        });
        return result;
    }
}

const DasPolylineTool = new DasPolylineToolClass(); // 全局实例，保持原有调用方式

export { DasPolylineTool, DasPolylineToolClass }; 