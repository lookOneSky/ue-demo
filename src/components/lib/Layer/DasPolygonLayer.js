import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

/**
 * DasPolygonLayer - 多边形图层类
 *
 * 默认参数值：
 * @property {Array<Array<number>>} points - 点集合 (默认: [])
 *   每个点为 [经度, 纬度, 高度] 格式
 * @property {Array<number>} color - 颜色 [r, g, b, a] (默认: [1.0, 1.0, 1.0, 1.0])
 *   范围: 每个分量 0.0-1.0
 * @property {boolean} enableDepthTest - 是否启用深度测试 (默认: true)
 *   true: 多边形可能被其他物体遮挡
 *   false: 多边形始终显示在最前面
 * @property {string} texturePath - 纹理图片路径或HTTP URL (默认: null)
 *   支持本地文件路径（如 "C:/images/foo.png"）或 http(s):// URL
 * @property {number} lightIntensity - 光照强度 (默认: 1.5)
 *   影响多边形的明暗程度
 * @property {boolean} enableCustomMaterial - 是否启用自定义材质 (默认: true)
 *   true: 使用MaterialBand自定义材质
 *   false: 使用默认材质系统（支持颜色、纹理等参数）
 * @property {number} bandUVScale - 带状UV缩放值 (默认: 100)
 *   控制条纹纹理的密度，值越大条纹越密集
 * @property {number} bandRotateAngle - 旋转角度，单位弧度 (默认: 0.0)
 *   控制条纹纹理的旋转方向
 * @property {number} bandTextureStripWidthRatio - 纹理条带宽度比例 (默认: 0.1)
 *   范围: 0.0-1.0，控制条纹的宽度占比
 * @property {number} unitUV2World - UV单位对应的世界长度cm (默认: 100)
 *   100cm映射UV 0~1，中心为UV(0,0)
 */
class DasPolygonLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasPolygonLayer";
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
     * 启用或禁用多边形的深度测试
     * @param {boolean} enableDepthTest - 是否启用深度测试  (默认: true)
     * @returns {Promise<boolean>} - 成功结果
     */
    setDepthTest = async function (enableDepthTest) {
        const param = { enableDepthTest: enableDepthTest };
        return await this.excuteUEClassFunction("setDepthTest", param);
    }

    /**
     * 设置多边形纹理
     * @param {string} texturePath - 纹理图片路径或 http(s):// URL
     * @returns {Promise<boolean>} - 成功结果
     */
    setTexture = async function (texturePath) {
        const param = { texturePath: texturePath };
        return await this.excuteUEClassFunction("setTexture", param);
    }

    /**
     * 设置光照强度
     * @param {number} lightIntensity - 光照强度值 (默认: 1)
     * @returns {Promise<boolean>} - 成功结果
     */
    setLightIntensity = async function (lightIntensity) {
        const param = { lightIntensity: lightIntensity };
        return await this.excuteUEClassFunction("setLightIntensity", param);
    }

    /**
     * 设置UV单位对应的世界长度
     * @param {number} unitUV2World - UV单位对应的世界长度cm (默认: 100)，100cm映射UV 0~1
     * @returns {Promise<boolean>} - 成功结果
     */
    setUnitUV2World = async function (unitUV2World) {
        const param = { unitUV2World: unitUV2World };
        return await this.excuteUEClassFunction("setUnitUV2World", param);
    }

    /**
     * 更新带状材质参数
     * @param {Object} config - 带状配置对象，可包含以下属性：
     * @param {number} [config.bandUVScale] - 带状UV缩放值 (默认: 1)
     * @param {number} [config.bandRotateAngle] - 旋转角度（角度角） (默认: 0)
     * @param {number} [config.bandTextureStripWidthRatio] - 纹理条带宽度比例 (0.0-1.0) （默认: 0.05）
     * @returns {Promise<boolean>} - 成功结果
     */
    UpdateBandMaterial = async function (config) {
        return await this.excuteUEClassFunction("UpdateBandMaterial", config);
    }

    /**
     * 设置是否启用自定义材质
     * @param {boolean} enableCustomMaterial - 是否启用自定义材质 (默认: true)
     * @returns {Promise<boolean>} - 成功结果
     */
    setEnableCustomMaterial = async function (enableCustomMaterial) {
        const param = { enableCustomMaterial: enableCustomMaterial };
        return await this.excuteUEClassFunction("setEnableCustomMaterial", param);
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 组合配置对象，可包含以下属性：
     * @param {Array} [config.points] - [经度, 纬度, 高度]数组的数组
     * @param {Array<number>} [config.color] - 颜色值 [r, g, b, a]，每个值范围0-1
     * @param {boolean} [config.enableDepthTest] - 是否启用深度测试 
     * @param {string} [config.texturePath] - 纹理资产路径
     * @param {number} [config.lightIntensity] - 光照强度值 
     * @param {boolean} [config.enableCustomMaterial] - 是否启用自定义材质 
     * @param {number} [config.bandUVScale] - 带状UV缩放值 
     * @param {number} [config.bandRotateAngle] - 旋转角度（弧度） 
     * @param {number} [config.bandTextureStripWidthRatio] - 纹理条带宽度比例 (0.0-1.0)
     * @param {number} [config.unitUV2World] - UV单位对应的世界长度cm
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
     * @returns {number} lightIntensity - 光照强度值
     * @returns {boolean} enableCustomMaterial - 是否启用自定义材质
     * @returns {number} bandUVScale - 带状UV缩放值
     * @returns {number} bandRotateAngle - 旋转角度（弧度）
     * @returns {number} bandTextureStripWidthRatio - 纹理条带宽度比例 (0.0-1.0)
     * @returns {number} unitUV2World - UV单位对应的世界长度cm
     */
    getAll = async function () {
        let result = {};
        await this.excuteUEClassFunction("getAll", {}, function (json) {
            result = {
                points: json.points,
                color: json.color,
                lightIntensity: json.lightIntensity,
                enableCustomMaterial: json.enableCustomMaterial,
                bandUVScale: json.bandUVScale,
                bandRotateAngle: json.bandRotateAngle,
                bandTextureStripWidthRatio: json.bandTextureStripWidthRatio,
                unitUV2World: json.unitUV2World
            };
        });
        return result;
    }

    /**
     * 创建新的多边形图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置（同updateAll的所有参数）
     * @param {Array} [param.param.points] - [经度, 纬度, 高度]数组的数组
     * @param {Array<number>} [param.param.color] - 颜色值 [r, g, b, a]，每个值范围0-1
     * @param {boolean} [param.param.enableDepthTest] - 是否启用深度测试 (默认: true)
     * @param {string} [param.param.texturePath] - 纹理资产路径
     * @param {number} [param.param.lightIntensity] - 光照强度值 (默认: 1)
     * @param {boolean} [param.param.enableCustomMaterial] - 是否启用自定义材质 (默认: true)
     * @param {number} [param.param.bandUVScale] - 带状UV缩放值 (默认: 1)
     * @param {number} [param.param.bandRotateAngle] - 旋转角度（弧度） (默认: 0)
     * @param {number} [param.param.bandTextureStripWidthRatio] - 纹理条带宽度比例 (0.0-1.0)
     * @param {number} [param.param.unitUV2World] - UV单位对应的世界长度cm (默认: 100)
     * @returns {Promise<DasPolygonLayer>} - 新的多边形图层实例
     */
    static async createInstance(param) {
        let polygonLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasPolygonLayer", "createInstance", param,
            function (json) {
                polygonLayer = new DasPolygonLayer();
                polygonLayer.readObjectInfo(json.object);
            });

        return polygonLayer;
    }

    /**
     * 批量创建多个DasPolygonLayer实例
     * @param {Object} param - 参数对象，应包含'params'数组
     * @returns {Promise<Array>} - 创建的图层对象数组
     */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasPolygonLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasPolygonLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasPolygonLayer as DasPolygonLayer };
