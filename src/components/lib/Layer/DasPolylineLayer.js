import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

class DasPolylineLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasPolylineLayer";
    }

    /**
     * 使用LLH坐标系（经度、纬度、高度）设置点位
     * @param {Array} points - [经度, 纬度, 高度]数组的集合
     * @returns {Promise<boolean>} - 成功结果
     */
    setPointsLLH = async function (points) {
        const param = { points: points };
        return await this.excuteUEClassFunction("setPointsLLH", param);
    }

    /**
     * 获取LLH格式（经度、纬度、高度）的点位
     * @returns {Promise<Array>} - [经度, 纬度, 高度]数组的集合
     */
    getPointsLLH = async function () {
        let points = [];
        await this.excuteUEClassFunction("getPointsLLH", {}, function (json) {
            points = json.points;
        });
        return points;
    }

    /**
     * 设置线条属性（颜色、粗细、屏幕空间）
     * @param {Object} lineProperties - 线条配置，可包含以下属性：
     * @param {Array<number>} [lineProperties.color] - 颜色 [r, g, b, a]，每个值范围0-1
     * @param {number} [lineProperties.thickness] - 线条粗细
     * @param {boolean} [lineProperties.fixScreen] - 是否固定到屏幕
     * @returns {Promise<boolean>} - 成功结果
     */
    setLineProperties = async function (lineProperties) {
        return await this.excuteUEClassFunction("setLineProperties", lineProperties);
    }

    /**
     * 启用或禁用折线的深度测试
     * @param {boolean} enableDepthTest - 是否启用深度测试
     * @returns {Promise<boolean>} - 成功结果
     */
    setDepthTest = async function (enableDepthTest) {
        const param = { enableDepthTest: enableDepthTest };
        return await this.excuteUEClassFunction("setDepthTest", param);
    }

    /**
     * 设置线条颜色
     * @param {Array<number>} color - 颜色 [r, g, b, a]，每个值范围0-1
     * @returns {Promise<boolean>} - 成功结果
     */
    setColor = async function (color) {
        const param = { color: color };
        return await this.excuteUEClassFunction("setColor", param);
    }

    /**
     * 设置线条粗细
     * @param {number} thickness - 线条粗细
     * @returns {Promise<boolean>} - 成功结果
     */
    setThickness = async function (thickness, screenSpace = true) {
        const param = { thickness: thickness};
        return await this.excuteUEClassFunction("setThickness", param);
    }

    /**
     * 设置折线的深度偏移
     * @param {number} depthOffset - 深度偏移值 (0-1)
     * @returns {Promise<boolean>} - 成功结果
     */
    setDepthOffset = async function (depthOffset) {
        const param = { depthOffset: depthOffset };
        return await this.excuteUEClassFunction("setDepthOffset", param);
    }

    /**
     * 设置折线的光晕效果
     * @param {Object} haloConfig - 光晕配置
     * @param {boolean} [haloConfig.enableHalo] - 是否启用光晕效果
     * @param {number} [haloConfig.haloWidth] - 光晕宽度
     * @param {number} [haloConfig.haloIntensity] - 光晕强度
     * @returns {Promise<boolean>} - 成功结果
     */
    setHalo = async function (haloConfig) {
        return await this.excuteUEClassFunction("setHalo", haloConfig);
    }

    /**
     * 设置折线的样条插值
     * @param {Object} splineConfig - 样条配置
     * @param {boolean} [splineConfig.enableSpline] - 是否启用样条插值
     * @param {number} [splineConfig.interpolateCount] - 插值点数量
     * @returns {Promise<boolean>} - 成功结果
     */
    setSplinePoint = async function (splineConfig) {
        return await this.excuteUEClassFunction("setSplinePoint", splineConfig);
    }

    /**
     * 设置折线的亮度
     * @param {number} brightness - 亮度值
     * @returns {Promise<boolean>} - 成功结果
     */
    setBrightness = async function (brightness) {
        const param = { brightness: brightness };
        return await this.excuteUEClassFunction("setBrightness", param);
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 组合配置对象，可包含以下属性：
     * @param {Array} [config.points] - [经度, 纬度, 高度]数组的集合
     * @param {Array<number>} [config.color] - 颜色 [r, g, b, a]，每个值范围0-1
     * @param {number} [config.thickness] - 线条粗细
     * @param {boolean} [config.enableDepthTest] - 是否启用深度测试
     * @param {number} [config.depthOffset] - 深度偏移值 (0-1)
     * @param {boolean} [config.enableHalo] - 是否启用光晕效果
     * @param {number} [config.haloWidth] - 光晕宽度
     * @param {number} [config.haloIntensity] - 光晕强度
     * @param {boolean} [config.enableSpline] - 是否启用样条插值
     * @param {number} [config.interpolateCount] - 插值点数量
     * @param {number} [config.brightness] - 线条亮度值
     * @returns {Promise<boolean>} - 成功结果
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 创建新的折线图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置
     * @param {Array} [param.param.points] - [经度, 纬度, 高度]数组的集合
     * @param {Array<number>} [param.param.color] - 颜色 [r, g, b, a]，每个值范围0-1
     * @param {number} [param.param.thickness] - 线条粗细
     * @param {Object} [param.param.halo] - 光晕配置
     * @param {Object} [param.param.spline] - 样条配置
     * @returns {Promise<DasPolylineLayer>} - 新的折线图层实例
     */
    static async createInstance(param) {
        let polylineLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasPolylineLayer", "createInstance", param,
            function (json) {
                polylineLayer = new DasPolylineLayer();
                polylineLayer.readObjectInfo(json.object);
            });

        return polylineLayer;
    }

    /**
    * 批量创建多个折线图层实例
    * @param {Object} param - 参数对象，应在'params'下包含数组
    * @returns {Promise<Array>} - 创建的图层对象数组
    */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasPolylineLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasPolylineLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasPolylineLayer as DasPolylineLayer }; 