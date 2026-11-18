import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

class DasCarLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasCarLayer";
    }

    /**
     * 设置速度
     * @param {number} speed - 速度值
     */
    async setSpeed(speed) {
        return await this.excuteUEClassFunction("setSpeed", { speed: speed });
    }

    /**
     * 获取速度
     * @returns {Promise<number>} 速度值
     */
    async getSpeed() {
        let speed = 0;
        await this.excuteUEClassFunction("getSpeed", {}, function (json) {
            speed = json.speed;
        });
        return speed;
    }

    /**
     * 设置灯光开关
     * @param {boolean} lightOn - 是否开启灯光
     */
    async setLight(lightOn) {
        return await this.excuteUEClassFunction("setLight", { lightOn: lightOn });
    }

    /**
     * 获取灯光状态
     * @returns {Promise<boolean>} 灯光是否开启
     */
    async getLight() {
        let lightOn = false;
        await this.excuteUEClassFunction("getLight", {}, function (json) {
            lightOn = json.lightOn;
        });
        return lightOn;
    }

    /**
     * 设置车辆Transform
     * @param {Object} transform - Transform对象，包含translation、rotation、scale3D
     */
    async setVehicleTransform(transform) {
        return await this.excuteUEClassFunction("setVehicleTransform", { transform: transform });
    }

    /**
     * 获取车辆Transform
     * @returns {Promise<Object>} Transform对象
     */
    async getVehicleTransform() {
        let transform = {};
        await this.excuteUEClassFunction("getVehicleTransform", {}, function (json) {
            transform = json.transform;
        });
        return transform;
    }

    /**
     * 设置运行路线（通过Polyline对象）
     * @param {Object} polyline - Polyline对象，需包含id属性
     */
    async setPolylineSpline(polyline) {
        return await this.excuteUEClassFunction("setPolylineSpline", { polyline: polyline });
    }

    /**
     * 设置车辆颜色
     * @param {Object} color - 颜色对象 {r: 0-1, g: 0-1, b: 0-1, a: 0-1}
     */
    async setColor(color) {
        return await this.excuteUEClassFunction("setColor", { color: color });
    }

    /**
     * 获取车辆颜色
     * @returns {Promise<Object>} 颜色对象 {r, g, b, a}
     */
    async getColor() {
        let color = {};
        await this.excuteUEClassFunction("getColor", {}, function (json) {
            color = json.color;
        });
        return color;
    }

    /**
     * 开始移动
     */
    async startMovement() {
        return await this.excuteUEClassFunction("startMovement", {});
    }

    /**
     * 停止移动
     */
    async stopMovement() {
        return await this.excuteUEClassFunction("stopMovement", {});
    }

    /**
     * 设置蓝图路径
     * @param {string} blueprintPath - 蓝图资源路径
     */
    async setBlueprintPath(blueprintPath) {
        return await this.excuteUEClassFunction("setBlueprintPath", { blueprintPath: blueprintPath });
    }

    /**
     * 获取蓝图路径
     * @returns {Promise<string>} 蓝图资源路径
     */
    async getBlueprintPath() {
        let blueprintPath = "";
        await this.excuteUEClassFunction("getBlueprintPath", {}, function (json) {
            blueprintPath = json.blueprintPath;
        });
        return blueprintPath;
    }

    /**
     * 获取所有参数
     * @returns {Promise<Object>} 包含所有参数的对象
     */
    async getAll() {
        let allParams = {};
        await this.excuteUEClassFunction("getAll", {}, function (json) {
            allParams = {
                transform: json.transform,
                speed: json.speed,
                lightOn: json.lightOn,
                color: json.color,
                blueprintPath: json.blueprintPath
            };
        });
        return allParams;
    }

    /**
     * 更新所有参数
     * @param {Object} params - 更新参数
     * @param {Object} [params.transform] - Transform对象
     * @param {number} [params.speed] - 速度值
     * @param {boolean} [params.lightOn] - 灯光开关
     * @param {Object} [params.color] - 颜色对象
     * @param {Object} [params.polyline] - Polyline对象
     */
    async setAll(params) {
        return await this.excuteUEClassFunction("setAll", params);
    }

    /**
     * 创建车辆图层
     * @param {Object} param - 创建参数
     * @param {string} param.blueprintPath - 蓝图资源路径（必需）
     * @param {Object} [param.param] - 初始配置参数
     * @param {Object} [param.param.transform] - 初始Transform
     * @param {number} [param.param.speed] - 初始速度
     * @param {boolean} [param.param.lightOn] - 初始灯光状态
     * @param {Object} [param.param.color] - 初始颜色
     * @param {Object} [param.param.polyline] - 初始路线
     * @returns {Promise<DasCarLayer>} 创建的车辆图层实例
     */
    static async createInstance(param) {
        let carLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasCarLayer", "createInstance", param,
            function (json) {
                carLayer = new DasCarLayer();
                carLayer.readObjectInfo(json.object);
            });

        return carLayer;
    }
}

export { DasCarLayer as DasCarLayer }; 