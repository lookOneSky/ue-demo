import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

class DasCustomLayer extends DasLayerBase {
    constructor() {
        super();
        this.className = "DasCustomLayer";
    }

    /**
     * 设置资产名并切换资产
     * @param {string} assetName - 配置中的资产名
     * @returns {Promise<boolean>} - 成功结果
     */
    setAssetName = async function (assetName) {
        const param = { assetName: assetName };
        return await this.excuteUEClassFunction("setAssetName", param);
    }

    /**
     * 获取当前资产名
     * @returns {Promise<string>} - 当前资产名
     */
    getCurrentAssetName = async function () {
        let assetName = "";
        await this.excuteUEClassFunction("getCurrentAssetName", {}, function (json) {
            assetName = json.assetName;
        });
        return assetName;
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 配置对象，可包含以下属性：
     * @param {string} [config.assetName] - 要切换的资产名
     * @returns {Promise<boolean>} - 成功结果
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 创建新的自定义资产图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置
     * @param {string} [param.param.assetName] - 初始资产名
     * @returns {Promise<DasCustomLayer>} - 新的图层实例
     */
    static async createInstance(param) {
        let customLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasCustomLayer", "createInstance", param,
            function (json) {
                customLayer = new DasCustomLayer();
                customLayer.readObjectInfo(json.object);
            });

        return customLayer;
    }
}

export { DasCustomLayer };
