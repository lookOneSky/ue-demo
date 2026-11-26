import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { ToolBase } from "./ToolBase.js";

class DasToolSpotLight extends ToolBase {
    className = "ToolSpotLight";

    /**
     * 激活手电筒工具
     * @param {function} callback - 操作完成后的回调函数
     */
    async setToCurrent(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {}, callback);
    }

    /**
     * 设置手电筒亮度
     * @param {number} lightIntensity - 亮度（Lumen），范围: 0-无穷大
     * @param {function} callback - 操作完成后的回调函数
     */
    async setLightIntensity(lightIntensity, callback) {
        let param = { lightIntensity: lightIntensity };
        await ExcuteUEFun.excuteUEFunction(this.className, "setLightIntensity", param, callback);
    }

    /**
     * 设置手电筒颜色
     * @param {Object} lightColor - 颜色对象 {r: 1.0, g: 1.0, b: 1.0, a: 1.0}，范围: 0-1
     * @param {function} callback - 操作完成后的回调函数
     */
    async setLightColor(lightColor, callback) {
        let param = { lightColor: lightColor };
        await ExcuteUEFun.excuteUEFunction(this.className, "setLightColor", param, callback);
    }

    /**
     * 设置探照距离（衰减半径）
     * @param {number} lightDistance - 距离（cm）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setLightDistance(lightDistance, callback) {
        let param = { lightDistance: lightDistance };
        await ExcuteUEFun.excuteUEFunction(this.className, "setLightDistance", param, callback);
    }

    /**
     * 设置探照半径（外锥角）
     * @param {number} lightRadius - 半径（度）
     * @param {function} callback - 操作完成后的回调函数
     */
    async setLightRadius(lightRadius, callback) {
        let param = { lightRadius: lightRadius };
        await ExcuteUEFun.excuteUEFunction(this.className, "setLightRadius", param, callback);
    }
}

export { DasToolSpotLight }
