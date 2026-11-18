import { DasLayerBase } from "./DasLayerBase.js";

class DasLightBaseLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasLightBaseLayer";
    }

    // 设置灯光强度
    setIntensity = async function (lightIntensity) {
        return await this.excuteUEClassFunction("setIntensity", { lightIntensity });
    }

    // 获取灯光强度
    getIntensity = async function () {
        let lightIntensity = 0;
        await this.excuteUEClassFunction("getIntensity", {}, function (json) {
            lightIntensity = json.lightIntensity;
        });
        return lightIntensity;
    }

    // 设置灯光颜色，lightColor: { r, g, b, a }，每个值范围 0-1
    setColor = async function (lightColor) {
        return await this.excuteUEClassFunction("setColor", { lightColor });
    }

    // 获取灯光颜色，返回 { r, g, b, a }
    getColor = async function () {
        let lightColor = { r: 1, g: 1, b: 1, a: 1 };
        await this.excuteUEClassFunction("getColor", {}, function (json) {
            lightColor = json.lightColor;
        });
        return lightColor;
    }

    /**
     * 批量设置灯光属性
     * @param {Object} config
     * @param {number} [config.lightIntensity] - 灯光强度
     * @param {Object} [config.lightColor] - 灯光颜色 { r, g, b, a }
     * @returns {Promise<boolean>}
     */
    setAll = async function (config) {
        return await this.excuteUEClassFunction("setAll", config);
    }

    /**
     * 批量获取灯光属性
     * @returns {Promise<{lightIntensity: number, lightColor: {r,g,b,a}}>}
     */
    getAll = async function () {
        let result = {};
        await this.excuteUEClassFunction("getAll", {}, function (json) {
            result = {
                lightIntensity: json.lightIntensity,
                lightColor: json.lightColor
            };
        });
        return result;
    }
}

export { DasLightBaseLayer };
