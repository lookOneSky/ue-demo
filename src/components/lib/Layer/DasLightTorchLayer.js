import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLightBaseLayer } from "./DasLightBaseLayer.js";

class DasLightTorchLayer extends DasLightBaseLayer {
    constructor() {
        super();
        this.id = "";
        this.className = "DasLightTorchLayer";
    }

    /**
     * 创建火把光源图层实例
     * @param {Object} param
     * @param {Object} [param.param] - 初始化参数
     * @param {number} [param.param.lightIntensity] - 灯光强度
     * @param {Object} [param.param.lightColor] - 灯光颜色 { r, g, b, a }
     * @returns {Promise<DasLightTorchLayer>}
     */
    static async createInstance(param) {
        let layer = null;
        await ExcuteUEFun.excuteUEFunction("DasLightTorchLayer", "createInstance", param,
            function (json) {
                layer = new DasLightTorchLayer();
                layer.readObjectInfo(json.object);
            });
        return layer;
    }
}

export { DasLightTorchLayer };
