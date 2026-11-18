import { DasLayerBase } from "../DasLayerBase.js";
import { ExcuteUEFun } from "../../ExcuteUEFun.js";

/**
 * DasModelTilesetLayer - 模型瓦片集图层
 * 用于加载和管理 3D Tiles 模型数据（如城市建筑、BIM模型等）
 *
 * 支持通过 URL 加载 3D Tiles tileset.json，并提供高度偏移等功能
 */
class DasModelTilesetLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasModelTilesetLayer";
    }

    /**
     * 设置模型Tileset的URL
     * @param {string} url - tileset.json 的完整路径（支持 file:/// 和 http(s):// 协议）
     * @returns {Promise<boolean>} - 设置是否成功
     *
     * @example
     * // 从本地文件系统加载
     * await layer.setTilesetUrl("file:///D:/Data/Building/tileset.json");
     *
     * @example
     * // 从HTTP服务器加载
     * await layer.setTilesetUrl("https://example.com/tiles/tileset.json");
     */
    setTilesetUrl = async function (url) {
        const param = { url: url };
        return await this.excuteUEClassFunction("setTilesetUrl", param);
    }

    /**
     * 获取当前模型Tileset的URL
     * @returns {Promise<string>} - 当前的tileset URL
     *
     * @example
     * const url = await layer.getTilesetUrl();
     * console.log(`Current tileset URL: ${url}`);
     */
    getTilesetUrl = async function () {
        let url = "";
        await this.excuteUEClassFunction("getTilesetUrl", {}, function (json) {
            url = json.url;
        });
        return url;
    }

    /**
     * 设置模型的高度偏移量
     * @param {number} addHeight - 高度偏移量（单位：米），正值向上偏移，负值向下偏移
     * @returns {Promise<boolean>} - 设置是否成功
     *
     * @description
     * 使用 ECEF (Earth-Centered Earth-Fixed) 坐标系进行精确的垂直偏移。
     * 该方法可用于调整模型与地形的对齐，或修正数据的高程误差。
     *
     * @example
     * // 向上偏移 26 米
     * await layer.setAddHeight(26.0);
     *
     * @example
     * // 向下偏移 50 米（例如地下建筑）
     * await layer.setAddHeight(-50.0);
     *
     * @example
     * // 重置高度偏移
     * await layer.setAddHeight(0.0);
     */
    setAddHeight = async function (addHeight) {
        const param = { addHeight: addHeight };
        return await this.excuteUEClassFunction("setAddHeight", param);
    }

    /**
     * 获取当前的高度偏移量
     * @returns {Promise<number>} - 当前的高度偏移量（单位：米）
     *
     * @example
     * const height = await layer.getAddHeight();
     * console.log(`Current height offset: ${height} meters`);
     */
    getAddHeight = async function () {
        let addHeight = 0.0;
        await this.excuteUEClassFunction("getAddHeight", {}, function (json) {
            addHeight = json.addHeight;
        });
        return addHeight;
    }

    /**
     * 设置模型是否显示在卷帘左侧
     * @param {boolean} rollerBlindLeft - true 表示显示在左侧，false 表示显示在右侧
     * @returns {Promise<boolean>}
     */
    setRollerBlindLeft = async function (rollerBlindLeft) {
        return await this.excuteUEClassFunction("setRollerBlindLeft", { rollerBlindLeft: rollerBlindLeft });
    }

    /**
     * 获取模型是否显示在卷帘左侧
     * @returns {Promise<boolean>}
     */
    getRollerBlindLeft = async function () {
        let rollerBlindLeft = false;
        await this.excuteUEClassFunction("getRollerBlindLeft", {}, function (json) {
            rollerBlindLeft = json.rollerBlindLeft;
        });
        return rollerBlindLeft;
    }

    /**
     * 设置反向剔除
     * @param {boolean} cullReverse - 是否反向剔除
     * @returns {Promise<boolean>}
     */
    setCullReverse = async function (cullReverse) {
        return await this.excuteUEClassFunction("setCullReverse", { cullReverse: cullReverse });
    }

    /**
     * 获取反向剔除状态
     * @returns {Promise<boolean>}
     */
    getCullReverse = async function () {
        let cullReverse = false;
        await this.excuteUEClassFunction("getCullReverse", {}, function (json) {
            cullReverse = json.cullReverse;
        });
        return cullReverse;
    }

    /**
     * 设置Unlight材质开关
     * @param {boolean} isUnlight - 是否使用Unlight材质
     * @returns {Promise<boolean>}
     */
    setUnlight = async function (isUnlight) {
        return await this.excuteUEClassFunction("setUnlight", { isUnlight: isUnlight });
    }

    /**
     * 获取Unlight材质开关状态
     * @returns {Promise<boolean>}
     */
    getUnlight = async function () {
        let isUnlight = false;
        await this.excuteUEClassFunction("getUnlight", {}, function (json) {
            isUnlight = json.isUnlight;
        });
        return isUnlight;
    }

    /**
     * 设置双面材质开关
     * @param {boolean} isTwoSide - 是否使用双面材质
     * @returns {Promise<boolean>}
     */
    setTwoSide = async function (isTwoSide) {
        return await this.excuteUEClassFunction("setTwoSide", { isTwoSide: isTwoSide });
    }

    /**
     * 获取双面材质开关状态
     * @returns {Promise<boolean>}
     */
    getTwoSide = async function () {
        let isTwoSide = false;
        await this.excuteUEClassFunction("getTwoSide", {}, function (json) {
            isTwoSide = json.isTwoSide;
        });
        return isTwoSide;
    }

    /**
     * 设置ENU坐标偏移量
     * @param {{x: number, y: number, z: number}} offsetENU - 偏移量（单位米），x=东向, y=北向, z=天向
     * @returns {Promise<boolean>}
     */
    setOffsetENU = async function (offsetENU) {
        return await this.excuteUEClassFunction("setOffsetENU", { offsetENU: offsetENU });
    }

    /**
     * 获取ENU坐标偏移量
     * @returns {Promise<{x: number, y: number, z: number}>} - 偏移量（单位米），x=东向, y=北向, z=天向
     */
    getOffsetENU = async function () {
        let offsetENU = { x: 0, y: 0, z: 0 };
        await this.excuteUEClassFunction("getOffsetENU", {}, function (json) {
            offsetENU = json.offsetENU;
        });
        return offsetENU;
    }

    /**
     * 一次性更新所有属性（所有字段均可选）
     * @param {Object} config - 配置对象
     * @param {string}  [config.url]          - 模型Tileset的URL路径
     * @param {number}  [config.addHeight]    - 高度偏移量（米）
     * @param {boolean} [config.rollerBlindLeft] - 是否显示在卷帘左侧
     * @param {boolean} [config.cullReverse]  - 反向剔除
     * @param {boolean} [config.isUnlight]    - 是否使用Unlight材质
     * @param {boolean} [config.isTwoSide]    - 是否使用双面材质
     * @param {{x,y,z}} [config.offsetENU]    - ENU偏移量（米），x=东向, y=北向, z=天向
     * @returns {Promise<boolean>}
     *
     * @example
     * await layer.updateAll({
     *     url: "file:///D:/Data/Building/tileset.json",
     *     addHeight: 26.0,
     *     isUnlight: true,
     *     offsetENU: { x: 0, y: 0, z: 26 }
     * });
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 创建新的模型瓦片集图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置
     * @param {string} [param.param.url] - 模型Tileset的URL路径
     * @param {number} [param.param.addHeight] - 高度偏移量（米）
     * @param {boolean} [param.param.rollerBlindLeft] - 是否显示在卷帘左侧
     * @returns {Promise<DasModelTilesetLayer>} - 新的模型瓦片集图层实例
     *
     * @example
     * // 创建基本的模型图层
     * const modelLayer = await DasModelTilesetLayer.createInstance({
     *     param: {
     *         url: "file:///D:/Data/Building/tileset.json",
     *         addHeight: 0.0,
     *         rollerBlindLeft: true
     *     }
     * });
     *
     * // 飞行到图层位置
     * await modelLayer.flyToThis(true, 3.0, 89.9);
     *
     * @example
     * // 创建带高度偏移的模型图层
     * const elevatedLayer = await DasModelTilesetLayer.createInstance({
     *     param: {
     *         url: "file:///D:/Data/Bridge/tileset.json",
     *         addHeight: 26.0,
     *         rollerBlindLeft: false
     *     }
     * });
     */
    static async createInstance(param) {
        let layer = null;
        await ExcuteUEFun.excuteUEFunction("DasModelTilesetLayer", "createInstance", param,
            function (json) {
                layer = new DasModelTilesetLayer();
                layer.readObjectInfo(json.object);
            });

        return layer;
    }

    /**
     * 批量创建多个DasModelTilesetLayer实例
     * @param {Object} param - 参数对象，应包含'params'数组
     * @param {Array<Object>} param.params - 每个图层的配置对象数组
     * @param {string} [param.params[].url] - 模型Tileset的URL路径
     * @param {number} [param.params[].addHeight] - 高度偏移量（米）
     * @param {boolean} [param.params[].rollerBlindLeft] - 是否显示在卷帘左侧
     * @returns {Promise<Array<DasModelTilesetLayer>>} - 创建的图层对象数组
     *
     * @example
     * // 批量创建多个模型图层
     * const layers = await DasModelTilesetLayer.batchCreateInstance({
     *     params: [
     *         { url: "file:///D:/Data/Building1/tileset.json", addHeight: 0.0, rollerBlindLeft: true },
     *         { url: "file:///D:/Data/Building2/tileset.json", addHeight: 26.0, rollerBlindLeft: false },
     *         { url: "file:///D:/Data/Bridge/tileset.json", addHeight: -10.0, rollerBlindLeft: true }
     *     ]
     * });
     *
     * // 设置所有图层可见
     * for (const layer of layers) {
     *     await layer.setVisible(true);
     * }
     */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasModelTilesetLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasModelTilesetLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasModelTilesetLayer as DasModelTilesetLayer };
