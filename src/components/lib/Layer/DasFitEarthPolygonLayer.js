import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

/**
 * DasFitEarthPolygonLayer - 贴地多边形图层类
 *
 * 默认参数值：
 * @property {Array<Array<number>>} points - 点集合 (默认: [])
 *   每个点为 [经度, 纬度, 高度] 格式
 * @property {Array<number>} color - 颜色 [r, g, b, a] (默认: [1.0, 1.0, 1.0, 1.0])
 *   范围: 每个分量 0.0-1.0
 * @property {boolean} fitEarth - 是否贴地 (默认: false)
 *   true: 多边形贴合地形
 *   false: 多边形不贴地
 * @property {number} fitEarthHeight - 贴地高度，单位米 (默认: 20000.0)
 *   向下贴地的最大距离
 * @property {boolean} breathGlow - 是否呼吸发光 (默认: false)
 * @property {number} glowMin - 呼吸最暗强度 (默认: 1.0)，1.0为不发光
 * @property {number} glowMax - 呼吸最亮强度 (默认: 4.0)，大于1才有Bloom辉光
 * @property {number} breathSpeed - 呼吸频率，单位Hz (默认: 0.5)
 */
class DasFitEarthPolygonLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasFitEarthPolygonLayer";
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
     * 设置是否贴地
     * @param {boolean} fitEarth - 是否贴地 (默认: false)
     * @returns {Promise<boolean>} - 成功结果
     */
    setFitEarth = async function (fitEarth) {
        const param = { fitEarth: fitEarth };
        return await this.excuteUEClassFunction("setFitEarth", param);
    }

    /**
     * 获取是否贴地
     * @returns {Promise<boolean>} - 是否贴地
     */
    isFitEarth = async function () {
        let fitEarth = false;
        await this.excuteUEClassFunction("isFitEarth", {}, function (json) {
            fitEarth = json.fitEarth;
        });
        return fitEarth;
    }

    /**
     * 设置贴地高度
     * @param {number} fitEarthHeight - 贴地高度，单位米 (默认: 20000.0)
     * @returns {Promise<boolean>} - 成功结果
     */
    setFitEarthHeight = async function (fitEarthHeight) {
        const param = { fitEarthHeight: fitEarthHeight };
        return await this.excuteUEClassFunction("setFitEarthHeight", param);
    }

    /**
     * 获取贴地高度
     * @returns {Promise<number>} - 贴地高度，单位米
     */
    getFitEarthHeight = async function () {
        let fitEarthHeight = 0.0;
        await this.excuteUEClassFunction("getFitEarthHeight", {}, function (json) {
            fitEarthHeight = json.fitEarthHeight;
        });
        return fitEarthHeight;
    }

    /**
     * 设置呼吸发光
     * 辉光由引擎Bloom产生，场景后处理体积必须开启Bloom才可见
     * @param {boolean} breathGlow - 是否呼吸发光
     * @param {number} glowMin - 呼吸最暗强度 (默认: 1.0)，1.0为不发光
     * @param {number} glowMax - 呼吸最亮强度 (默认: 4.0)
     * @param {number} breathSpeed - 呼吸频率，单位Hz (默认: 0.5)
     * @returns {Promise<boolean>} - 成功结果
     */
    setBreathGlow = async function (breathGlow, glowMin = 1.0, glowMax = 4.0, breathSpeed = 0.5) {
        const param = { breathGlow: breathGlow, glowMin: glowMin, glowMax: glowMax, breathSpeed: breathSpeed };
        return await this.excuteUEClassFunction("setBreathGlow", param);
    }

    /**
     * 获取呼吸发光参数
     * @returns {Promise<Object>} - { breathGlow, glowMin, glowMax, breathSpeed }
     */
    getBreathGlow = async function () {
        let result = {};
        await this.excuteUEClassFunction("getBreathGlow", {}, function (json) {
            result = {
                breathGlow: json.breathGlow,
                glowMin: json.glowMin,
                glowMax: json.glowMax,
                breathSpeed: json.breathSpeed
            };
        });
        return result;
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 组合配置对象，可包含以下属性：
     * @param {Array} [config.points] - [经度, 纬度, 高度]数组的数组
     * @param {Array<number>} [config.color] - 颜色值 [r, g, b, a]，每个值范围0-1
     * @param {boolean} [config.fitEarth] - 是否贴地
     * @param {number} [config.fitEarthHeight] - 贴地高度，单位米
     * @param {boolean} [config.breathGlow] - 是否呼吸发光
     * @param {number} [config.glowMin] - 呼吸最暗强度
     * @param {number} [config.glowMax] - 呼吸最亮强度
     * @param {number} [config.breathSpeed] - 呼吸频率，单位Hz
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
     * @returns {boolean} fitEarth - 是否贴地
     * @returns {number} fitEarthHeight - 贴地高度，单位米
     * @returns {boolean} breathGlow - 是否呼吸发光
     * @returns {number} glowMin - 呼吸最暗强度
     * @returns {number} glowMax - 呼吸最亮强度
     * @returns {number} breathSpeed - 呼吸频率，单位Hz
     */
    getAll = async function () {
        let result = {};
        await this.excuteUEClassFunction("getAll", {}, function (json) {
            result = {
                points: json.points,
                color: json.color,
                fitEarth: json.fitEarth,
                fitEarthHeight: json.fitEarthHeight,
                breathGlow: json.breathGlow,
                glowMin: json.glowMin,
                glowMax: json.glowMax,
                breathSpeed: json.breathSpeed
            };
        });
        return result;
    }

    /**
     * 创建新的贴地多边形图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置（同updateAll的所有参数）
     * @param {Array} [param.param.points] - [经度, 纬度, 高度]数组的数组
     * @param {Array<number>} [param.param.color] - 颜色值 [r, g, b, a]，每个值范围0-1
     * @param {boolean} [param.param.fitEarth] - 是否贴地 (默认: false)
     * @param {number} [param.param.fitEarthHeight] - 贴地高度，单位米 (默认: 20000.0)
     * @param {boolean} [param.param.breathGlow] - 是否呼吸发光 (默认: false)
     * @param {number} [param.param.glowMin] - 呼吸最暗强度 (默认: 1.0)
     * @param {number} [param.param.glowMax] - 呼吸最亮强度 (默认: 4.0)
     * @param {number} [param.param.breathSpeed] - 呼吸频率，单位Hz (默认: 0.5)
     * @returns {Promise<DasFitEarthPolygonLayer>} - 新的贴地多边形图层实例
     */
    static async createInstance(param) {
        let fitEarthPolygonLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasFitEarthPolygonLayer", "createInstance", param,
            function (json) {
                fitEarthPolygonLayer = new DasFitEarthPolygonLayer();
                fitEarthPolygonLayer.readObjectInfo(json.object);
            });

        return fitEarthPolygonLayer;
    }

    /**
     * 批量创建多个DasFitEarthPolygonLayer实例
     * @param {Object} param - 参数对象，应包含'params'数组
     * @returns {Promise<Array>} - 创建的图层对象数组
     */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasFitEarthPolygonLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasFitEarthPolygonLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasFitEarthPolygonLayer as DasFitEarthPolygonLayer };
