import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

/**
 * DasDecalLayer - 全球贴花图层类
 *
 * 默认参数值：
 * @property {Array<number>} point1 - 第一个对角点 [经度, 纬度, 高度] (默认: [116.3, 39.8, 0.0])
 * @property {Array<number>} point2 - 第二个对角点 [经度, 纬度, 高度] (默认: [116.5, 40.0, 0.0])
 * @property {number} distance - 投影距离，单位米 (默认: 8000.0)
 *   向下投影的距离
 * @property {string} texturePath - 贴花纹理路径 (可选)
 *   UE纹理资源路径
 * @property {string} base64Data - Base64编码的图片数据 (可选)
 *   可用于动态设置纹理
 */
class DasDecalLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasDecalLayer";
    }

    /**
     * 设置贴花矩形的两个对角点(经度、纬度、高度)
     * @param {Array<number>} point1 - 第一个对角点 [经度, 纬度, 高度]
     * @param {Array<number>} point2 - 第二个对角点 [经度, 纬度, 高度]
     * @returns {Promise<boolean>} - 成功结果
     */
    setCornerPointsLLH = async function (point1, point2) {
        const param = { point1: point1, point2: point2 };
        return await this.excuteUEClassFunction("setCornerPointsLLH", param);
    }

    /**
     * 获取贴花矩形的两个对角点(经度、纬度、高度)
     * @returns {Promise<Object>} - 包含point1和point2的对象
     * @returns {Array<number>} point1 - 第一个对角点 [经度, 纬度, 高度]
     * @returns {Array<number>} point2 - 第二个对角点 [经度, 纬度, 高度]
     */
    getCornerPointsLLH = async function () {
        let result = {};
        await this.excuteUEClassFunction("getCornerPointsLLH", {}, function (json) {
            result = {
                point1: json.point1,
                point2: json.point2
            };
        });
        return result;
    }

    /**
     * 设置贴花投影距离(米)
     * @param {number} distance - 向下投影距离，单位米
     * @returns {Promise<boolean>} - 成功结果
     */
    setProjectionDistance = async function (distance) {
        const param = { distance: distance };
        return await this.excuteUEClassFunction("setProjectionDistance", param);
    }

    /**
     * 获取贴花投影距离(米)
     * @returns {Promise<number>} - 投影距离，单位米
     */
    getProjectionDistance = async function () {
        let distance = 0.0;
        await this.excuteUEClassFunction("getProjectionDistance", {}, function (json) {
            distance = json.distance;
        });
        return distance;
    }

    /**
     * 设置贴花纹理
     * @param {string} texturePath - UE纹理资源路径
     * @returns {Promise<boolean>} - 成功结果
     */
    setTexture = async function (texturePath) {
        const param = { texturePath: texturePath };
        return await this.excuteUEClassFunction("setTexture", param);
    }

    /**
     * 通过Base64数据设置贴花纹理
     * @param {string} base64Data - Base64编码的图片数据
     * @returns {Promise<boolean>} - 成功结果
     */
    setTextureFromBase64 = async function (base64Data) {
        const param = { base64Data: base64Data };
        return await this.excuteUEClassFunction("setTextureFromBase64", param);
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 组合配置对象，可包含以下属性：
     * @param {Array<number>} [config.point1] - 第一个对角点 [经度, 纬度, 高度]
     * @param {Array<number>} [config.point2] - 第二个对角点 [经度, 纬度, 高度]
     * @param {number} [config.distance] - 投影距离，单位米
     * @param {string} [config.texturePath] - 纹理路径
     * @param {string} [config.base64Data] - Base64编码的图片数据
     * @returns {Promise<boolean>} - 成功结果
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 获取所有属性
     * @returns {Promise<Object>} - 包含所有属性的对象：
     * @returns {Array<number>} point1 - 第一个对角点 [经度, 纬度, 高度]
     * @returns {Array<number>} point2 - 第二个对角点 [经度, 纬度, 高度]
     * @returns {number} distance - 投影距离，单位米
     */
    getAll = async function () {
        let result = {};
        await this.excuteUEClassFunction("getAll", {}, function (json) {
            result = {
                point1: json.point1,
                point2: json.point2,
                distance: json.distance
            };
        });
        return result;
    }

    /**
     * 创建新的全球贴花图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置（同updateAll的所有参数）
     * @param {Array<number>} [param.param.point1] - 第一个对角点 [经度, 纬度, 高度]
     * @param {Array<number>} [param.param.point2] - 第二个对角点 [经度, 纬度, 高度]
     * @param {number} [param.param.distance] - 投影距离，单位米 (默认: 8000.0)
     * @param {string} [param.param.texturePath] - 纹理路径 (可选)
     * @param {string} [param.param.base64Data] - Base64编码的图片数据 (可选)
     * @returns {Promise<DasDecalLayer>} - 新的全球贴花图层实例
     */
    static async createInstance(param) {
        let decalLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasDecalLayer", "createInstance", param,
            function (json) {
                decalLayer = new DasDecalLayer();
                decalLayer.readObjectInfo(json.object);
            });

        return decalLayer;
    }

    /**
     * 批量创建多个DasDecalLayer实例
     * @param {Object} param - 参数对象，应包含'params'数组
     * @param {Array<Object>} param.params - 实例参数数组
     * @returns {Promise<Array>} - 创建的图层对象数组
     */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasDecalLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasDecalLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasDecalLayer as DasDecalLayer };
