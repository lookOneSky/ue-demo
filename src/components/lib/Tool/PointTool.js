import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { ToolBase } from "./ToolBase.js";

/**
 * JavaScript wrapper for the PointTool UE component
 * Provides functionality for managing points in the Unreal Engine environment
 */
class PointToolClass extends ToolBase {
    className = "PointTool"; // UE类名

    /**
     * 设置PointTool为当前活动工具
     */
    async setToCurrent() {
        let param = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", param);
    }

    /**
     * 设置多个点的LLH坐标
     * @param {Array} points - Array of [longitude, latitude, height] arrays
     */
    async setPointsLLH(points) {
        const param = { points: points };
        await ExcuteUEFun.excuteUEFunction(this.className, "setPointsLLH", param);
    }

    /**
     * 获取所有点的LLH坐标
     * @returns {Promise<Array>} - Array of [longitude, latitude, height] arrays
     */
    async getPointsLLH() {
        let points = [];
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointsLLH", {}, (json) => {
            points = json.points;
        });
        return points;
    }

    /**
     * 设置单个点的位置
     * @param {Array<number>} posLLH - Position as [longitude, latitude, height]
     */
    async setPointPosition(posLLH) {
        const param = { posLLH: posLLH };
        await ExcuteUEFun.excuteUEFunction(this.className, "setPointPosition", param);
    }

    /**
     * 获取当前点的位置
     * @returns {Promise<Array<number>>} - Position as [longitude, latitude, height]
     */
    async getPointPosition() {
        let result = [0, 0, 0];
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointPosition", {}, (json) => {
            result = json.posLLH;
        });
        return result;
    }

    /**
     * 设置点的大小
     * @param {number} size - Point size
     */
    async setPointSize(size) {
        const param = { pointSize: size };
        await ExcuteUEFun.excuteUEFunction(this.className, "setPointSize", param);
    }

    /**
     * 获取点的大小
     * @returns {Promise<number>} - Point size
     */
    async getPointSize() {
        let result = 16;
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointSize", {}, (json) => {
            result = json.pointSize;
        });
        return result;
    }

    /**
     * 设置点的颜色
     * @param {Array<number>} color - Color as [r, g, b, a] where each value is 0-1
     */
    async setPointColor(color) {
        const param = { color: color };
        await ExcuteUEFun.excuteUEFunction(this.className, "setPointColor", param);
    }

    /**
     * 获取点的颜色
     * @returns {Promise<Array<number>>} - Color as [r, g, b, a]
     */
    async getPointColor() {
        let result = [1, 0, 0, 1];
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointColor", {}, (json) => {
            result = json.color;
        });
        return result;
    }

    /**
     * 设置新点的高度偏移
     * @param {number} offset - Height offset value
     */
    async setAddOffset(offset) {
        const param = { addOffset: offset };
        await ExcuteUEFun.excuteUEFunction(this.className, "setAddOffset", param);
    }

    /**
     * 获取当前高度偏移
     * @returns {Promise<number>} - Height offset value
     */
    async getAddOffset() {
        let result = 0;
        await ExcuteUEFun.excuteUEFunction(this.className, "getAddOffset", {}, (json) => {
            result = json.addOffset;
        });
        return result;
    }

    /**
     * 清除所有点
     */
    async clearPoints() {
        await ExcuteUEFun.excuteUEFunction(this.className, "clearPoints", {});
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
     * 设置辅助轴粗细缩放
     * @param {number} scale - Thickness scale factor (<1 thinner, >1 thicker)
     */
    async setAxisThicknessScale(scale) {
        const param = { axisThicknessScale: scale };
        await ExcuteUEFun.excuteUEFunction(this.className, "setAxisThicknessScale", param);
    }

    /**
     * 获取辅助轴粗细缩放
     * @returns {Promise<number>} - Current thickness scale
     */
    async getAxisThicknessScale() {
        let result = 0.8;
        await ExcuteUEFun.excuteUEFunction(this.className, "getAxisThicknessScale", {}, (json) => {
            result = json.axisThicknessScale;
        });
        return result;
    }

    /**
     * 一次性更新所有点属性
     * @param {Object} param - An object containing the properties to update
     * @param {Array} [param.points] - Array of [longitude, latitude, height] arrays
     * @param {number} [param.pointSize] - Point size
     * @param {Array<number>} [param.color] - Color as [r, g, b, a] where each value is 0-1
     * @param {number} [param.addOffset] - Height offset for new points
     */
    async updateAll(param) {
        await ExcuteUEFun.excuteUEFunction(this.className, "updateAll", param);
    }

    /**
     * 一次性获取所有点属性
     * @returns {Promise<Object>} - Object containing all point properties
     */
    async getAll() {
        let result = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "getAll", {}, (json) => {
            result = json;
        });
        return result;
    }
}

const PointTool = new PointToolClass(); // 全局实例，保持原有调用方式

export { PointTool, PointToolClass }; 