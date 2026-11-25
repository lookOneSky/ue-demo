import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { PointToolClass } from "./PointTool.js";

/**
 * JavaScript wrapper for the DasPointsTool UE component
 * Provides functionality for managing points in the Unreal Engine environment
 */
class DasPointsToolClass extends PointToolClass {
    className = "DasPointsTool"; // UE类名

    /**
     * 设置DasPointsTool为当前活动工具
     */
    async setToCurrent() {
        let param = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", param);
    }

    /**
     * 设置点的位置
     * @param {object} param - Parameters including position data
     */
    async setPointPosition(param) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setPointPosition", param);
    }

    /**
     * 设置点的纹理
     * @param {object} param - Parameters including texture path
     */
    async setPointTexture(param) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setPointTexture", param);
    }

    /**
     * 获取点的纹理
     */
    async getPointTexture() {
        let result = "";
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointTexture", {}, (json) => {
            result = json.texturePath;
        });
        return result;
    }

    /**
     * 获取点的位置
     */
    async getPointPosition() {
        let result = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointPosition", {}, (json) => {
            result = json.posLLH;
        });
        return result;
    }

    /**
     * 设置点的大小
     * @param {object} param - Parameters including size data
     */
    async setPointSize(param) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setPointSize", param);
    }

    /**
     * 获取点的大小
     */
    async getPointSize() {
        let result = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "getPointSize", {}, (json) => {
            result = json.pointSize;
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
     * @returns {Promise<boolean>} Whether depth testing is enabled
     */
    async getDepthTest() {
        let enabled = true;
        await ExcuteUEFun.excuteUEFunction(this.className, "getDepthTest", {}, (json) => {
            enabled = json.enableDepthTest;
        });
        return enabled;
    }

    /**
     * 设置辅助轴显示状态
     * @param {boolean} axisIsShown - Whether to show the axis gizmo
     */
    async setAxisIsShown(axisIsShown) {
        const param = { axisIsShown: axisIsShown };
        await ExcuteUEFun.excuteUEFunction(this.className, "setAxisIsShown", param);
    }

    /**
     * 获取辅助轴显示状态
     * @returns {Promise<boolean>} Whether the axis gizmo is shown
     */
    async getAxisIsShown() {
        let result = true;
        await ExcuteUEFun.excuteUEFunction(this.className, "getAxisIsShown", {}, (json) => {
            result = json.axisIsShown;
        });
        return result;
    }

    /**
     * 设置Gizmos显示隐藏
     * @param {boolean} gizmosVisible - Whether to show the gizmos
     */
    async setGizmosVisibility(gizmosVisible) {
        const param = { gizmosVisible: gizmosVisible };
        await ExcuteUEFun.excuteUEFunction(this.className, "setGizmosVisibility", param);
    }

    /**
     * 获取Gizmos显示状态
     * @returns {Promise<boolean>} Whether the gizmos is visible
     */
    async getGizmosVisibility() {
        let result = true;
        await ExcuteUEFun.excuteUEFunction(this.className, "getGizmosVisibility", {}, (json) => {
            result = json.gizmosVisible;
        });
        return result;
    }

    /**
     * 一次性更新所有点属性
     * @param {object} param - An object containing the properties to update (e.g., { posLLH: [x, y, z], texturePath: "path", pointSize: [w, h], enableDepthTest: true }).
     */
    async updateAll(param) {
        await ExcuteUEFun.excuteUEFunction(this.className, "updateAll", param);
    }

    /**
     * 一次性获取所有点属性
     * @returns {Promise<{posLLH?: number[], texturePath?: string, pointSize?: number[], enableDepthTest?: boolean}>} 当前点的位置及样式
     */
    async getAll() {
        let result = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "getAll", {}, (json) => {
            result = json;
        });
        return result;
    }
}

const DasPointsTool = new DasPointsToolClass(); // 全局实例，保持原有调用方式

export { DasPointsTool, DasPointsToolClass }; 