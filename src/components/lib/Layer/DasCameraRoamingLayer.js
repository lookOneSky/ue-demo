import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

/**
 * @typedef {Object} Vector3
 * @property {number} X - X坐标（经度 Longitude）
 * @property {number} Y - Y坐标（纬度 Latitude）
 * @property {number} Z - Z坐标（高度 Height）
 */

/**
 * @typedef {Object} Quaternion
 * @property {number} X - 四元数X分量
 * @property {number} Y - 四元数Y分量
 * @property {number} Z - 四元数Z分量
 * @property {number} W - 四元数W分量
 */

/**
 * @typedef {Object} CameraPosition
 * @property {Vector3} llh - 经纬度高度坐标 (Longitude, Latitude, Height)
 * @property {Quaternion} rotation - 相机旋转四元数
 * @property {number} duration - 飞行到该位置的时长（秒），默认5.0秒
 */

/**
 * @typedef {Object} CameraRoamingCreateParam
 * @property {Object} [param] - 初始配置参数
 * @property {Array<CameraPosition>} [param.positions] - 相机点位数组
 */

/**
 * 相机漫游图层类
 * 用于管理相机在多个预设位置之间的飞行漫游
 */
class DasCameraRoamingLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasCameraRoamingLayer";
    }

    /**
     * 添加当前相机位置
     * @returns {Promise<boolean>} 是否添加成功
     */
    async addCurrentCameraPosition() {
        return await this.excuteUEClassFunction("addCurrentCameraPosition", {});
    }

    /**
     * 清除所有相机位置
     * @returns {Promise<boolean>} 是否清除成功
     */
    async clearCameraPosition() {
        return await this.excuteUEClassFunction("clearCameraPosition", {});
    }

    /**
     * 飞到指定索引的相机位置
     * @param {number} index 相机位置索引
     * @returns {Promise<boolean>} 是否执行成功
     */
    async flyToCameraPositionWithIndex(index) {
        return await this.excuteUEClassFunction("flyToCameraPositionWithIndex", { index: index });
    }

    /**
     * 更新指定索引的相机位置
     * @param {number} index 相机位置索引
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateCameraPositionWithIndex(index) {
        return await this.excuteUEClassFunction("updateCameraPositionWithIndex", { index: index });
    }

    /**
     * 删除指定索引的相机位置
     * @param {number} index 相机位置索引
     * @returns {Promise<boolean>} 是否删除成功
     */
    async removeCameraPositionWithIndex(index) {
        return await this.excuteUEClassFunction("removeCameraPositionWithIndex", { index: index });
    }

    /**
     * 开始全部飞行
     * @returns {Promise<boolean>} 是否启动成功
     */
    async startFlightAll() {
        return await this.excuteUEClassFunction("startFlightAll", {});
    }

    /**
     * 停止全部飞行
     * @returns {Promise<boolean>} 是否停止成功
     */
    async stopFlightAll() {
        return await this.excuteUEClassFunction("stopFlightAll", {});
    }

    /**
     * 更新指定索引的飞行时间
     * @param {number} index 相机位置索引
     * @param {number} duration 飞行时间（秒）
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateCameraFlyDurationWithIndex(index, duration) {
        return await this.excuteUEClassFunction("updateCameraFlyDurationWithIndex", { index: index, duration: duration });
    }

    /**
     * 获取所有点位信息
     * @returns {Promise<Array<CameraPosition>>} 相机点位数组
     */
    async getAllPositionInfo() {
        let positions = [];
        await this.excuteUEClassFunction("getAllPositionInfo", {}, function (json) {
            if (json && json.positions) {
                positions = json.positions;
            }
        });
        return positions;
    }

    /**
     * 设置相机点位
     * @param {Array<CameraPosition>} positions 相机点位数组
     * @returns {Promise<boolean>} 是否设置成功
     */
    async setCameraPositions(positions) {
        return await this.excuteUEClassFunction("setCameraPositions", { positions: positions });
    }

    /**
     * 创建相机漫游层
     * @param {CameraRoamingCreateParam} param - 创建参数
     * @returns {Promise<DasCameraRoamingLayer>} 创建的相机漫游层实例
     */
    static async createInstance(param) {
        let cameraRoaming = null;
        await ExcuteUEFun.excuteUEFunction("DasCameraRoamingLayer", "createInstance", param,
            function (json) {
                cameraRoaming = new DasCameraRoamingLayer();
                cameraRoaming.readObjectInfo(json.object);
        });

        return cameraRoaming;
    }
}

export { DasCameraRoamingLayer as DasCameraRoamingLayer };
