import { ExcuteUEFun, parseUEMessage } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

class DasUIBillboardLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasUIBillboardLayer";

    }

    static smapID2Callback = new Map();
    static sClassName = "DasUIBillboardLayer";
    static listeningViewer = null;

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
    setSize = async function (width, height) {
        const param = { width: width, height: height };
        return await this.excuteUEClassFunction("setSize", param);
    }

    /**
     * 设置屏幕偏移量
     * @param {number} x - X偏移量
     * @param {number} y - Y偏移量
     * @returns {Promise<boolean>} - 成功结果
     */
    setScreenOffset = async function (x, y) {
        const param = { x: x, y: y };
        return await this.excuteUEClassFunction("setScreenOffset", param);
    }

    /**
     * 设置UI可见性
     * @param {boolean} visible - 是否可见
     * @returns {Promise<boolean>} - 成功结果
     */
    setUIVisible = async function (visible) {
        const param = { visible: visible };
        return await this.excuteUEClassFunction("setUIVisible", param);
    }

    /**
     * 设置是否只在点位可见时显示UI
     * @param {boolean} onlyWhenVisible - 是否只在点位可见时显示
     * @returns {Promise<boolean>} - 成功结果
     */
    setOnlyVisibleWhenPointVisible = async function (onlyWhenVisible) {
        const param = { onlyWhenVisible: onlyWhenVisible };
        return await this.excuteUEClassFunction("setOnlyVisibleWhenPointVisible", param);
    }

    /**
     * 设置地理位置
     * @param {Array<number>} posLLH - 经纬度高程坐标数组 [longitude, latitude, height]
     * @returns {Promise<boolean>} - 成功结果
     */
    setGeoPosition = async function (posLLH) {
        if (!Array.isArray(posLLH) || posLLH.length < 3) {
            return false;
        }
        const param = { posLLH: posLLH };
        return await this.excuteUEClassFunction("setGeoPosition", param);
    }

    /**
     * 获取地理位置
     * @returns {Promise<Array<number>>} - 经纬度高程坐标数组 [longitude, latitude, height]
     */
    getGeoPosition = async function () {
        let result = null;
        await this.excuteUEClassFunction("getGeoPosition", {}, function (json) {
            if (json.posLLH) {
                result = json.posLLH;
            }
        });
        return result || [0, 0, 0];
    }

    /**
     * 执行JavaScript代码
     * @param {string} script - JavaScript代码
     * @returns {Promise<boolean>} - 成功结果
     */
    excuteJavaScript = async function (script) {
        const param = { script: script };
        return await this.excuteUEClassFunction("excuteJavaScript", param);
    }

    /**
     * 一次性更新所有属性
     * @param {Object} config - 配置对象，可包含以下属性：
     * @param {string} [config.url] - 网页URL
     * @param {string} [config.fileData] - HTML内容
     * @param {number} [config.width] - 宽度
     * @param {number} [config.height] - 高度
     * @param {Array<number>} [config.size] - 大小数组 [width, height]
     * @param {number} [config.x] - X偏移量
     * @param {number} [config.y] - Y偏移量
     * @param {Array<number>} [config.offset] - 偏移量数组 [x, y]
     * @param {boolean} [config.visible] - 是否可见
     * @param {boolean} [config.onlyWhenVisible] - 是否只在点位可见时显示
     * @param {Array<number>} [config.posLLH] - 经纬度高程坐标数组 [longitude, latitude, height]
     * @param {string} [config.script] - JavaScript代码
     * @returns {Promise<boolean>} - 成功结果
     */
    updateAll = async function (config) {
        return await this.excuteUEClassFunction("updateAll", config);
    }

    /**
     * 创建UI标牌图层实例
     * @param {Object} param - 创建参数
     * @param {Object} [param.param] - 初始配置
     * @param {string} [param.param.url] - 网页URL
     * @param {string} [param.param.fileData] - HTML内容
     * @param {number} [param.param.width] - 宽度
     * @param {number} [param.param.height] - 高度
     * @param {Array<number>} [param.param.posLLH] - 经纬度高程坐标数组 [longitude, latitude, height]
     * @param {number} [param.param.x] - 横向屏幕偏移
     * @param {number} [param.param.y] - 纵向屏幕偏移
     * @param {boolean} [param.param.onlyWhenVisible] - 仅在可见时显示
     * @returns {Promise<DasUIBillboardLayer>} - 新创建的标牌图层实例
     */
    static async createInstance(param) {
        let billboardLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasUIBillboardLayer", "createInstance", param,
            function (json) {
                billboardLayer = new DasUIBillboardLayer();
                billboardLayer.readObjectInfo(json.object);
            });

        return billboardLayer;
    }

    /** @param {(layer: DasUIBillboardLayer, message: string) => void} callback */
    addWebConsoleMessageListener = function (callback) {
        if (DasUIBillboardLayer.listeningViewer !== window.viewer) {
            DasUIBillboardLayer.listeningViewer = window.viewer;
            DasUIBillboardLayer.smapID2Callback.clear();
            window.viewer.addResponseEventListener(DasUIBillboardLayer.sClassName, (json) => {
                let JsonObject = parseUEMessage(json);

                if (JsonObject.class != DasUIBillboardLayer.sClassName)
                    return;

                if (JsonObject.function != "emitMessage")
                    return;

                let JsonObjectMessage = parseUEMessage(JsonObject.message);
                const id = JsonObjectMessage.id;
                const callback = DasUIBillboardLayer.smapID2Callback.get(id);
                if (callback)
                {
                    const layer = new DasUIBillboardLayer();
                    layer.id = id;
                    callback(layer, JsonObject.message);
                }
            });
        }
        DasUIBillboardLayer.smapID2Callback.set(this.id, callback);
    }

    removeWebConsoleMessageListener() {
        DasUIBillboardLayer.smapID2Callback.delete(this.id);
    }

    static clearWebConsoleMessageListener = function () {
        DasUIBillboardLayer.smapID2Callback.clear();
    }

    /**
     * 批量创建多个UI标牌图层实例
     * @param {Object} param - 包含参数数组的对象
     * @returns {Promise<Array>} - 创建的图层对象数组
     */
    static async batchCreateInstance(param) {
        let layers = [];
        await ExcuteUEFun.excuteUEFunction("DasUIBillboardLayer", "batchCreateInstance", param, function (json) {
            if (Array.isArray(json.layers)) {
                layers = json.layers.map(obj => {
                    const layer = new DasUIBillboardLayer();
                    layer.readObjectInfo(obj);
                    return layer;
                });
            }
        });
        return layers;
    }
}

export { DasUIBillboardLayer as DasUIBillboardLayer }; 