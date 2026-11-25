import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

class DasPointsLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasPointsLayer";
    }

    /**
     * 使用LLH坐标系（经度、纬度、高度）设置点位
     * @param {Array} points - [经度, 纬度, 高度]数组的数组
     * @returns {Promise<boolean>} - 成功结果
     */
    setPointsLLH = async function (points) {
        const param = { points: points };
        return await this.excuteUEClassFunction("setPointsLLH", param);
    }

    /**
     * 获取LLH坐标系（经度、纬度、高度）格式的点位
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
     * 设置点位的纹理
     * @param {string} texturePath - 纹理路径
     * @returns {Promise<boolean>} - 成功结果
     */
    setTexture = async function (texturePath) {
        const param = { texturePath: texturePath };
        return await this.excuteUEClassFunction("setTexture", param);
    }

    /**
     * 设置点位外观信息（颜色、尺寸、偏移）
     * @param {Object} pointInfo - 点位外观配置对象，可包含以下属性：
     * @param {Array<number>} [pointInfo.color] - 颜色 [r, g, b, a]，每个值范围0-1
     * @param {Array<number>} [pointInfo.pointSize] - 尺寸 [宽度, 高度]
     * @param {Array<number>} [pointInfo.offset] - 偏移 [x, y]
     * @returns {Promise<boolean>} - 成功结果
     */
    setPointInfo = async function (pointInfo) {
        return await this.excuteUEClassFunction("setPointInfo", { pointInfo, ...pointInfo });
    }

    /**
     * 启用或禁用点位的深度测试
     * @param {boolean} enableDepthTest - 是否启用深度测试
     * @returns {Promise<boolean>} - 成功结果
     */
    setDepthTest = async function (enableDepthTest) {
        const param = { enableDepthTest: enableDepthTest };
        return await this.excuteUEClassFunction("setDepthTest", param);
    }

    /**
     * 设置点位是否使用遮罩材质
     * @param {boolean} useMask - 是否使用遮罩材质
     * @returns {Promise<boolean>} - 成功结果
     */
    setUseMaskTextureMaterial = async function (useMask) {
        const param = { useMaskTexture: useMask };
        return await this.excuteUEClassFunction("setUseMaskTextureMaterial", param);
    }

    /**
     * 获取当前遮罩材质状态
     * @returns {Promise<boolean>} - 当前遮罩材质状态
     */
    isUseMaskTextureMaterial = async function () {
        let useMask = false;
        await this.excuteUEClassFunction("isUseMaskTextureMaterial", {}, function (json) {
            useMask = json.useMaskTexture;
        });
        return useMask;
    }

    /**
     * 设置点位自动缩放
     * @param {boolean} autoScale - 是否启用自动缩放
     * @returns {Promise<boolean>} - 成功结果
     */
    setAutoScale = async function (autoScale) {
        const param = { autoScale: autoScale };
        return await this.excuteUEClassFunction("setAutoScale", param);
    }

    /**
     * 获取当前自动缩放状态
     * @returns {Promise<boolean>} - 当前自动缩放状态
     */
    isAutoScale = async function () {
        let autoScale = false;
        await this.excuteUEClassFunction("isAutoScale", {}, function (json) {
            autoScale = json.autoScale;
        });
        return autoScale;
    }

    /**
     * 设置点位扩散
     * @param {boolean} isSpread - 是否启用扩散
     * @returns {Promise<boolean>} - 成功结果
     */
    setSpread = async function (isSpread) {
        const param = { IsSpread: isSpread };
        return await this.excuteUEClassFunction("setSpread", param);
    }

    /**
     * 获取当前扩散状态
     * @returns {Promise<boolean>} - 当前扩散状态
     */
    isSpread = async function () {
        let isSpread = false;
        await this.excuteUEClassFunction("isSpread", {}, function (json) {
            isSpread = json.IsSpread;
        });
        return isSpread;
    }

    /**
     * 启用或禁用点位的屏幕碰撞检测
     * @param {boolean} enableScreenCollision - 是否启用屏幕碰撞检测
     * @returns {Promise<boolean>} - 成功结果
     */
    setEnableScreenCollision = async function (enableScreenCollision) {
        const param = { enableScreenCollision: enableScreenCollision };
        return await this.excuteUEClassFunction("setEnableScreenCollision", param);
    }

    /**
     * 获取当前屏幕碰撞检测状态
     * @returns {Promise<boolean>} - 当前屏幕碰撞检测状态
     */
    isEnableScreenCollision = async function () {
        let enableScreenCollision = false;
        await this.excuteUEClassFunction("isEnableScreenCollision", {}, function (json) {
            enableScreenCollision = json.enableScreenCollision;
        });
        return enableScreenCollision;
    }

    /**
     * 获取所有当前设置
     * @returns {Promise<Object>} - 包含所有当前设置的对象
     */
    getAll = async function () {
        let allSettings = {};
        await this.excuteUEClassFunction("getAll", {}, function (json) {
            allSettings = {
                points: json.points || [],
                autoScale: json.autoScale || false,
                isSpread: json.IsSpread || false,
                useMask: json.useMask || false,
                enableScreenCollision: json.enableScreenCollision || false
            };
        });
        return allSettings;
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 组合配置对象，可包含以下属性：
     * @param {Array} [config.points] - [经度, 纬度, 高度]数组的数组
     * @param {string} [config.texturePath] - 纹理路径
     * @param {Array<number>} [config.color] - 颜色 [r, g, b, a]，每个值范围0-1
     * @param {Array<number>} [config.pointSize] - 尺寸 [宽度, 高度]
     * @param {Array<number>} [config.offset] - 偏移 [x, y]
     * @param {boolean} [config.enableDepthTest] - 是否启用深度测试
     * @param {boolean} [config.useMask] - 是否使用遮罩材质
     * @param {boolean} [config.autoScale] - 是否启用自动缩放
     * @param {boolean} [config.IsSpread] - 是否启用扩散
     * @param {boolean} [config.enableScreenCollision] - 是否启用屏幕碰撞检测
     * @returns {Promise<boolean>} - 成功结果
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 创建新的点位图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 图层的初始配置
     * @param {Array} [param.param.points] - [经度, 纬度, 高度]数组的数组
     * @param {number[]} [param.param.posLLH] - 单个点的[经度, 纬度, 高度]
     * @param {string} [param.param.texturePath] - 纹理路径
     * @param {Object} [param.param.pointInfo] - 点位尺寸、颜色和偏移的组合配置
     * @param {number[]} [param.param.pointSize] - 点位宽度和高度
     * @param {number[]} [param.param.color] - RGBA 颜色
     * @param {number[]} [param.param.offset] - 点位显示偏移
     * @param {boolean} [param.param.enableDepthTest] - 是否启用深度测试
     * @param {boolean} [param.param.autoScale] - 是否启用自动缩放
     * @param {boolean} [param.param.IsSpread] - 是否启用扩散
     * @returns {Promise<DasPointsLayer>} - 新的点位图层实例
     */
    static async createInstance(param) {
        if (param?.param?.pointInfo) {
            param = { ...param, param: { ...param.param.pointInfo, ...param.param } };
        }
        let pointsLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasPointsLayer", "createInstance", param,
            function (json) {
                pointsLayer = new DasPointsLayer();
                pointsLayer.readObjectInfo(json.object);
            });

        return pointsLayer;
    }

    /**
    * 批量创建多个DasPointsLayer实例
    * @param {Object} param - 参数对象，应包含'params'数组
    * @returns {Promise<Array>} - 创建的图层对象数组
    */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasPointsLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasPointsLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasPointsLayer as DasPointsLayer };
