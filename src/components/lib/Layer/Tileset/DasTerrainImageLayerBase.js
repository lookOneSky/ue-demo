import { DasLayerBase } from "../DasLayerBase.js";

/**
 * DasTerrainImageLayerBase - 地形影像图层基类
 * 用于在地形上叠加影像图层（如卫星图、地图等）
 *
 * 这是一个基类，提供附加/分离地形的基本功能
 */
class DasTerrainImageLayerBase extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasTerrainImageLayerBase";
    }

    /**
     * 附加或分离影像图层到地形Tileset
     * @param {boolean} attach - true: 附加到地形, false: 从地形分离
     * @returns {Promise<boolean>} - 操作是否成功
     *
     * @example
     * // 附加影像图层到地形
     * await layer.setAttach(true);
     *
     * // 从地形分离影像图层
     * await layer.setAttach(false);
     */
    setAttach = async function (attach) {
        const param = { attach: attach };
        return await this.excuteUEClassFunction("setAttach", param);
    }

    /**
     * 检查影像图层是否已附加到地形
     * @returns {Promise<boolean>} - 是否已附加
     *
     * @example
     * const attached = await layer.isAttached();
     * console.log(`Layer is ${attached ? 'attached' : 'detached'}`);
     */
    isAttached = async function () {
        let attached = false;
        await this.excuteUEClassFunction("isAttached", {}, function (json) {
            attached = json.attached;
        });
        return attached;
    }

    /**
     * 设置影像瓦片的基础URL路径
     * @param {string} baseUrl - URL模板字符串
     * @returns {Promise<boolean>} - 设置是否成功
     *
     * @example
     * await layer.setBaseUrl("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
     */
    setBaseUrl = async function (baseUrl) {
        const param = { baseUrl: baseUrl };
        return await this.excuteUEClassFunction("setBaseUrl", param);
    }

    /**
     * 设置材质层键值
     * @param {string} materialLayerKey - 材质层键值字符串
     * @returns {Promise<boolean>} - 设置是否成功
     *
     * @example
     * await layer.setMaterialLayerKey("Overlay1");
     */
    setMaterialLayerKey = async function (materialLayerKey) {
        const param = { materialLayerKey: materialLayerKey };
        return await this.excuteUEClassFunction("setMaterialLayerKey", param);
    }

    /**
     * 获取材质层键值
     * @returns {Promise<string>} - 材质层键值字符串
     *
     * @example
     * const key = await layer.getMaterialLayerKey();
     * console.log(`Material Layer Key: ${key}`);
     */
    getMaterialLayerKey = async function () {
        let materialLayerKey = "";
        await this.excuteUEClassFunction("getMaterialLayerKey", {}, function (json) {
            materialLayerKey = json.materialLayerKey;
        });
        return materialLayerKey;
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 配置对象，可包含以下属性：
     * @param {string} [config.baseUrl] - 影像瓦片的基础URL模板路径
     * @param {string} [config.materialLayerKey] - 材质层键值
     * @returns {Promise<boolean>} - 更新是否成功
     *
     * @example
     * // 一次性配置图层
     * await layer.updateAll({
     *     baseUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
     *     materialLayerKey: "Overlay1"
     * });
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }
}

export { DasTerrainImageLayerBase as DasTerrainImageLayerBase };
