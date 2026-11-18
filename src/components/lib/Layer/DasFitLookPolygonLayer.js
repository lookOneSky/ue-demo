import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

/**
 * DasFitLookPolygonLayer - 立面多边形图层类
 *
 * 默认参数值：
 * @property {Array<Array<number>>} points - 点集合 (默认: [])
 *   每个点为 [经度, 纬度, 高度] 格式
 * @property {Array<number>} color - 颜色 [r, g, b, a] (默认: [1.0, 1.0, 1.0, 1.0])
 *   范围: 每个分量 0.0-1.0
 * @property {boolean} fitLook - 是否启用立面贴附 (默认: false)
 *   true: 多边形沿面法线方向扩展为立面体
 *   false: 不启用立面贴附
 * @property {number} lookHeight - 立面向前投影深度，单位米 (默认: 1.0)
 *   从投影中心平面沿+法线（投影方向、背离相机）延伸的深度
 * @property {number} backDistanceOnFitLook - 立面向后投影深度，单位米 (默认: 1.0)
 *   从投影中心平面沿-法线（朝相机）延伸的深度
 * @property {boolean} useCameraCalNormal - 是否通过相机校准面法线朝向 (默认: true)
 *   true: 用相机位置校准法线，确保法线背离相机侧，并同步反转保存的点绕向
 *   false: 法线朝向完全由点的绕向决定
 */
class DasFitLookPolygonLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasFitLookPolygonLayer";
    }

    /**
     * 使用LLH（经度、纬度、高度）坐标设置点位
     * @param {Array} points - [经度, 纬度, 高度]数组的数组
     * @returns {Promise<boolean>} - 成功结果
     */
    setPointsLLH = async function (points) {
        const param = { points: points };
        return await this.excuteUEClassFunction("setPointsLLH", param);
    }

    /**
     * 获取LLH（经度、纬度、高度）格式的点位
     * @returns {Promise<Array>} - [经度, 纬度, 高度]数组的数组
     */
    getPointsLLH = async function () {
        let points = [];
        await this.excuteUEClassFunction("getPointsLLH", {}, function (json) {
            points = json.points;
        });
        return points;
    }

    /**
     * 设置多边形颜色
     * @param {Array<number>} color - 颜色值 [r, g, b, a]，每个值范围0-1
     * @returns {Promise<boolean>} - 成功结果
     */
    setColor = async function (color) {
        const param = { color: color };
        return await this.excuteUEClassFunction("setColor", param);
    }

    /**
     * 获取多边形颜色
     * @returns {Promise<Array<number>>} - 颜色值 [r, g, b, a]，每个值范围0-1
     */
    getColor = async function () {
        let color = [];
        await this.excuteUEClassFunction("getColor", {}, function (json) {
            color = json.color;
        });
        return color;
    }

    /**
     * 设置是否启用立面贴附
     * @param {boolean} fitLook - 是否启用立面贴附 (默认: false)
     * @returns {Promise<boolean>} - 成功结果
     */
    setFitLook = async function (fitLook) {
        const param = { fitLook: fitLook };
        return await this.excuteUEClassFunction("setFitLook", param);
    }

    /**
     * 获取是否启用立面贴附
     * @returns {Promise<boolean>} - 是否启用立面贴附
     */
    isFitLook = async function () {
        let fitLook = false;
        await this.excuteUEClassFunction("isFitLook", {}, function (json) {
            fitLook = json.fitLook;
        });
        return fitLook;
    }

    /**
     * 设置立面向前投影深度，沿+法线（投影方向、背离相机）
     * @param {number} lookHeight - 向前投影深度，单位米 (默认: 1.0)
     * @returns {Promise<boolean>} - 成功结果
     */
    setLookHeight = async function (lookHeight) {
        const param = { lookHeight: lookHeight };
        return await this.excuteUEClassFunction("setLookHeight", param);
    }

    /**
     * 获取立面向前投影深度
     * @returns {Promise<number>} - 向前投影深度，单位米
     */
    getLookHeight = async function () {
        let lookHeight = 0.0;
        await this.excuteUEClassFunction("getLookHeight", {}, function (json) {
            lookHeight = json.lookHeight;
        });
        return lookHeight;
    }

    /**
     * 设置立面向后投影深度，沿-法线（朝相机）
     * @param {number} backDistanceOnFitLook - 向后投影深度，单位米 (默认: 1.0)
     * @returns {Promise<boolean>} - 成功结果
     */
    setBackDistanceOnFitLook = async function (backDistanceOnFitLook) {
        const param = { backDistanceOnFitLook: backDistanceOnFitLook };
        return await this.excuteUEClassFunction("setBackDistanceOnFitLook", param);
    }

    /**
     * 获取立面向后投影深度，单位米
     * @returns {Promise<number>} - 向后投影深度，单位米
     */
    getBackDistanceOnFitLook = async function () {
        let backDistanceOnFitLook = 1.0;
        await this.excuteUEClassFunction("getBackDistanceOnFitLook", {}, function (json) {
            backDistanceOnFitLook = json.backDistanceOnFitLook;
        });
        return backDistanceOnFitLook;
    }

    /**
     * 设置是否通过相机校准面法线朝向
     * @param {boolean} useCameraCalNormal - 是否通过相机校准面法线朝向 (默认: true)
     * @returns {Promise<boolean>} - 成功结果
     */
    setUseCameraCalNormal = async function (useCameraCalNormal) {
        const param = { useCameraCalNormal: useCameraCalNormal };
        return await this.excuteUEClassFunction("setUseCameraCalNormal", param);
    }

    /**
     * 获取是否通过相机校准面法线朝向
     * @returns {Promise<boolean>} - 是否通过相机校准面法线朝向
     */
    isUseCameraCalNormal = async function () {
        let useCameraCalNormal = true;
        await this.excuteUEClassFunction("isUseCameraCalNormal", {}, function (json) {
            useCameraCalNormal = json.useCameraCalNormal;
        });
        return useCameraCalNormal;
    }

    /**
     * 设置纹理
     * @param {string} texturePath - 纹理路径（本地路径或http(s)://URL）
     * @returns {Promise<boolean>} - 成功结果
     */
    setTexture = async function (texturePath) {
        const param = { texturePath: texturePath };
        return await this.excuteUEClassFunction("setTexture", param);
    }

    /**
     * 设置UV单位对应的世界长度(cm)，100cm映射UV 0~1
     * @param {number} unitUV2World - UV世界长度(cm)，默认100
     * @returns {Promise<boolean>} - 成功结果
     */
    setUnitUV2World = async function (unitUV2World) {
        const param = { unitUV2World: unitUV2World };
        return await this.excuteUEClassFunction("setUnitUV2World", param);
    }

    /**
     * 获取UV单位对应的世界长度(cm)
     * @returns {Promise<number>} - UV世界长度(cm)
     */
    getUnitUV2World = async function () {
        let unitUV2World = 100.0;
        await this.excuteUEClassFunction("getUnitUV2World", {}, function (json) {
            unitUV2World = json.unitUV2World;
        });
        return unitUV2World;
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 组合配置对象，可包含以下属性：
     * @param {Array} [config.points] - [经度, 纬度, 高度]数组的数组
     * @param {Array<number>} [config.color] - 颜色值 [r, g, b, a]，每个值范围0-1
     * @param {boolean} [config.fitLook] - 是否启用立面贴附
     * @param {boolean} [config.useCameraCalNormal] - 是否通过相机校准面法线朝向
     * @param {number} [config.lookHeight] - 立面厚度，单位米
     * @param {number} [config.backDistanceOnFitLook] - 立面后撤距离，单位cm
     * @param {string} [config.texturePath] - 纹理路径（本地路径或http(s)://URL）
     * @param {number} [config.unitUV2World] - UV单位对应世界长度(cm)，默认100
     * @returns {Promise<boolean>} - 成功结果
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 获取所有属性
     * @returns {Promise<Object>} - 包含所有属性的对象：
     * @returns {Array} points - [经度, 纬度, 高度]数组的数组
     * @returns {Array<number>} color - 颜色值 [r, g, b, a]，每个值范围0-1
     * @returns {boolean} fitLook - 是否启用立面贴附
     * @returns {boolean} useCameraCalNormal - 是否通过相机校准面法线朝向
     * @returns {number} lookHeight - 立面厚度，单位米
     * @returns {number} backDistanceOnFitLook - 立面后撤距离，单位cm
     * @returns {string} texturePath - 纹理路径（只读，通过setTexture设置）
     * @returns {number} unitUV2World - UV单位对应世界长度(cm)
     */
    getAll = async function () {
        let result = {};
        await this.excuteUEClassFunction("getAll", {}, function (json) {
            result = {
                points: json.points,
                color: json.color,
                fitLook: json.fitLook,
                useCameraCalNormal: json.useCameraCalNormal,
                lookHeight: json.lookHeight,
                backDistanceOnFitLook: json.backDistanceOnFitLook,
                texturePath: json.texturePath,
                unitUV2World: json.unitUV2World
            };
        });
        return result;
    }

    /**
     * 创建新的立面多边形图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置（同updateAll的所有参数）
     * @param {Array} [param.param.points] - [经度, 纬度, 高度]数组的数组
     * @param {Array<number>} [param.param.color] - 颜色值 [r, g, b, a]，每个值范围0-1
     * @param {boolean} [param.param.fitLook] - 是否启用立面贴附 (默认: false)
     * @param {boolean} [param.param.useCameraCalNormal] - 是否通过相机校准面法线朝向 (默认: true)
     * @param {number} [param.param.lookHeight] - 立面厚度，单位米 (默认: 20000.0)
     * @param {number} [param.param.backDistanceOnFitLook] - 立面后撤距离，单位cm (默认: 2.0)
     * @returns {Promise<DasFitLookPolygonLayer>} - 新的立面多边形图层实例
     */
    static async createInstance(param) {
        let fitLookPolygonLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasFitLookPolygonLayer", "createInstance", param,
            function (json) {
                fitLookPolygonLayer = new DasFitLookPolygonLayer();
                fitLookPolygonLayer.readObjectInfo(json.object);
            });

        return fitLookPolygonLayer;
    }

    /**
     * 批量创建多个DasFitLookPolygonLayer实例
     * @param {Object} param - 参数对象，应包含'params'数组
     * @returns {Promise<Array>} - 创建的图层对象数组
     */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasFitLookPolygonLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasFitLookPolygonLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasFitLookPolygonLayer as DasFitLookPolygonLayer };
