import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

class DasWidgetBillboardLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasWidgetBillboardLayer";
    }

    /**
     * 设置网页URL
     * @param {string} url - 网页URL
     * @returns {Promise<boolean>} - 成功结果
     */
    setURL = async function (url) {
        const param = { url: url };
        return await this.excuteUEClassFunction("setURL", param);
    }

    /**
     * 获取当前URL
     * @returns {Promise<string>} - 当前URL
     */
    getURL = async function () {
        let url = "";
        await this.excuteUEClassFunction("getURL", {}, function (json) {
            url = json.url;
        });
        return url;
    }

    /**
     * 设置HTML内容
     * @param {string} fileData - HTML内容
     * @returns {Promise<boolean>} - 成功结果
     */
    setFileData = async function (fileData) {
        const param = { fileData: fileData };
        return await this.excuteUEClassFunction("setFileData", param);
    }

    /**
     * 设置标牌大小
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {Promise<boolean>} - 成功结果
     */
    setBillboardSize = async function (width, height) {
        const param = { width: width, height: height };
        return await this.excuteUEClassFunction("setBillboardSize", param);
    }

    /**
     * 设置自动缩放
     * @param {boolean} autoScale - 是否启用自动缩放
     * @returns {Promise<boolean>} - 成功结果
     */
    setAutoScale = async function (autoScale) {
        const param = { autoScale: autoScale };
        return await this.excuteUEClassFunction("setAutoScale", param);
    }

    /**
     * 设置深度偏移系数
     * @param {number} rate - 深度偏移系数
     * @returns {Promise<boolean>} - 成功结果
     */
    setDepthOffsetRate = async function (rate) {
        const param = { rate: rate };
        return await this.excuteUEClassFunction("setDepthOffsetRate", param);
    }

    /**
     * 设置混合模式
     * @param {number|string} blendMode - 混合模式，支持数字(0=Opaque, 1=Masked, 2=Transparent)或字符串("Opaque", "Masked", "Transparent")
     * @returns {Promise<boolean>} - 成功结果
     */
    setBlendMode = async function (blendMode) {
        const param = { blendMode: blendMode };
        return await this.excuteUEClassFunction("setBlendMode", param);
    }

    /**
     * 设置标牌位置
     * @param {Array<number>} posLLH - 经纬度高程坐标数组 [longitude, latitude, height]
     * @returns {Promise<boolean>} - 成功结果
     */
    setPosition = async function (posLLH) {
        if (!Array.isArray(posLLH) || posLLH.length < 3) {
            return false;
        }
        const param = { posLLH: posLLH };
        return await this.excuteUEClassFunction("setPosition", param);
    }

    /**
     * 获取标牌位置
     * @returns {Promise<Array<number>>} - 经纬度高程坐标数组 [longitude, latitude, height]
     */
    getPosition = async function () {
        let result = null;
        await this.excuteUEClassFunction("getPosition", {}, function (json) {
            if (json.posLLH) {
                result = json.posLLH;
            }
        });
        return result || [0, 0, 0];
    }

    /**
     * 设置屏幕偏移量
     * @param {number} offsetX - X轴偏移量
     * @param {number} offsetY - Y轴偏移量
     * @returns {Promise<boolean>} - 成功结果
     */
    setScreenOffset = async function (offsetX, offsetY) {
        const param = { offsetX: offsetX, offsetY: offsetY };
        return await this.excuteUEClassFunction("setScreenOffset", param);
    }

    /**
     * 获取屏幕偏移量
     * @returns {Promise<Array<number>>} - 偏移量数组 [offsetX, offsetY]
     */
    getScreenOffset = async function () {
        let result = null;
        await this.excuteUEClassFunction("getScreenOffset", {}, function (json) {
            if (json.offset) {
                result = json.offset;
            }
        });
        return result || [0, 0];
    }

    /**
     * 设置是否启用屏幕碰撞检测
     * @param {boolean} enableScreenCollision - 是否启用屏幕碰撞检测
     * @returns {Promise<boolean>} - 成功结果
     */
    setEnableScreenCollision = async function (enableScreenCollision) {
        const param = { enableScreenCollision: enableScreenCollision };
        return await this.excuteUEClassFunction("setEnableScreenCollision", param);
    }

    /**
     * 获取是否启用屏幕碰撞检测
     * @returns {Promise<boolean>} - 是否启用屏幕碰撞检测
     */
    isEnableScreenCollision = async function () {
        let result = false;
        await this.excuteUEClassFunction("isEnableScreenCollision", {}, function (json) {
            if (json.enableScreenCollision !== undefined) {
                result = json.enableScreenCollision;
            }
        });
        return result;
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 配置对象，可包含以下属性：
     * @param {string} [config.url] - 网页URL
     * @param {string} [config.fileData] - HTML内容
     * @param {number} [config.width] - 宽度
     * @param {number} [config.height] - 高度
     * @param {Array<number>} [config.size] - 大小数组 [width, height]
     * @param {boolean} [config.autoScale] - 是否启用自动缩放
     * @param {number} [config.rate] - 深度偏移系数
     * @param {number|string} [config.blendMode] - 混合模式，支持数字(0=Opaque, 1=Masked, 2=Transparent)或字符串
     * @param {Array<number>} [config.posLLH] - 经纬度高程坐标数组 [longitude, latitude, height]
     * @param {number} [config.offsetX] - X轴屏幕偏移量
     * @param {number} [config.offsetY] - Y轴屏幕偏移量
     * @param {Array<number>} [config.offset] - 偏移量数组 [offsetX, offsetY]
     * @param {boolean} [config.enableScreenCollision] - 是否启用屏幕碰撞检测
     * @returns {Promise<boolean>} - 成功结果
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 创建标牌图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 初始配置
     * @param {string} [param.param.url] - 网页URL
     * @param {string} [param.param.fileData] - HTML内容
     * @param {number} [param.param.width] - 宽度
     * @param {number} [param.param.height] - 高度
     * @param {number|string} [param.param.blendMode] - 混合模式
     * @param {Array<number>} [param.param.posLLH] - 经纬度高程坐标数组 [longitude, latitude, height]
     * @param {number} [param.param.offsetX] - X轴屏幕偏移量
     * @param {number} [param.param.offsetY] - Y轴屏幕偏移量
     * @param {Array<number>} [param.param.offset] - 偏移量数组 [offsetX, offsetY]
     * @param {boolean} [param.param.autoScale] - 自动缩放
     * @param {number} [param.param.rate] - 深度偏移系数
     * @returns {Promise<DasWidgetBillboardLayer>} - 新创建的标牌图层实例
     */
    static async createInstance(param) {
        let billboardLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasWidgetBillboardLayer", "createInstance", param,
            function (json) {
                billboardLayer = new DasWidgetBillboardLayer();
                billboardLayer.readObjectInfo(json.object);
            });

        return billboardLayer;
    }

    /**
     * 批量创建多个标牌图层实例
     * @param {Object} param - 包含参数数组的对象
     * @param {Array<Object>} param.params - 实例配置数组，每个元素包含以下属性：
     * @param {string} [param.params[].url] - 网页URL
     * @param {string} [param.params[].fileData] - HTML内容
     * @param {number} [param.params[].width] - 宽度
     * @param {number} [param.params[].height] - 高度
     * @param {Array<number>} [param.params[].size] - 大小数组 [width, height]
     * @param {boolean} [param.params[].autoScale] - 是否启用自动缩放
     * @param {number} [param.params[].rate] - 深度偏移系数
     * @param {number|string} [param.params[].blendMode] - 混合模式，支持数字(0=Opaque, 1=Masked, 2=Transparent)或字符串
     * @param {Array<number>} [param.params[].posLLH] - 经纬度高程坐标数组 [longitude, latitude, height]
     * @param {number} [param.params[].offsetX] - X轴屏幕偏移量
     * @param {number} [param.params[].offsetY] - Y轴屏幕偏移量
     * @param {Array<number>} [param.params[].offset] - 偏移量数组 [offsetX, offsetY]
     * @param {boolean} [param.params[].enableScreenCollision] - 是否启用屏幕碰撞检测
     * @returns {Promise<Array<DasWidgetBillboardLayer>>} - 创建的标牌图层实例数组
     */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasWidgetBillboardLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasWidgetBillboardLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasWidgetBillboardLayer as DasWidgetBillboardLayer }; 