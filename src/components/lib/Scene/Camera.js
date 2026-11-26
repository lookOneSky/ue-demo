import { ExcuteUEFun } from "../ExcuteUEFun.js";

/**
 * JavaScript wrapper for the UWebCamera UE component
 * Provides camera control and positioning functions
 */
class Camera {
    static className = "Camera";

    /**
     * 通过名称飞行到指定点位
     * @param {string} positionName - 点位名称
     * @param {number} [duration=5.0] - 飞行时间（秒）
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async flyToCameraPositionByName(positionName, duration = 5.0) {
        let result = false;
        let param = {
            positionName: positionName,
            duration: duration
        };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "flyToCameraPositionByName", param, function (json) {
            result = true;
        });
        return result;
    }
    
    /**
     * 获取当前相机的经纬度高度和欧拉角
     * @returns {Promise<object>} 包含locationLLH和rotationLLH的对象
     */
    static async getCameraFlyInfoLLH() {
        let result = {};
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "getCameraFlyInfoLLH", param, function (json) {
            // 位置数据 [longitude, latitude, height]
            if (json.locationLLH && Array.isArray(json.locationLLH)) {
                result.locationLLH = json.locationLLH;
            }
            
            // 旋转数据 (对象格式 {pitch, yaw, roll})
            if (json.rotationLLH) {
                result.rotationLLH = json.rotationLLH;
            }
        });
        return result;
    }
    
    /**
     * 飞行到指定的经纬度高度和欧拉角
     * @param {Array} locationLLH - 包含[经度,纬度,高度]的数组
     * @param {object} rotationLLH - 包含pitch、yaw、roll的对象
     * @param {number} [duration=5.0] - 飞行时间（秒）
     * @param {number} [addHeightScale=1.0] - 飞行时增加高度的缩放系数
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async flyToLocationLLH(locationLLH, rotationLLH, duration = 5.0, addHeightScale = 100) {
        let result = false;
        let param = {
            locationLLH: locationLLH,
            rotationLLH: rotationLLH,
            duration: duration,
            addHeightScale: addHeightScale
        };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "flyToLocationLLH", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 通过经纬度飞行到指定位置（自动请求地形高度）
     * @param {number} longitude - 经度
     * @param {number} latitude - 纬度
     * @param {number} [rotationYaw=0.0] - 旋转Yaw角度
     * @param {number} [rotationPitch=-30.0] - 旋转Pitch角度
     * @param {number} [duration=5.0] - 飞行时间（秒）
     * @param {number} [addHeightScale=1.0] - 飞行时增加高度的缩放系数
     * @param {number} [extraViewHeight=0.0] - 在地形高度上额外叠加的观察高度（米）
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async flyToLocationLongLat(longitude, latitude, rotationYaw = 0.0, rotationPitch = -30.0, duration = 5.0, addHeightScale = 1.0) {
        let result = false;
        let param = {
            longitude: longitude,
            latitude: latitude,
            rotationYaw: rotationYaw,
            rotationPitch: rotationPitch,
            duration: duration,
            addHeightScale: addHeightScale
        };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "flyToLocationLongLat", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 设置飞行时禁止增加高度的标志
     * @param {boolean} forbitAddHeight - 是否禁止增加高度
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async forbitAddHeightOnFly(forbitAddHeight) {
        let result = false;
        let param = {
            forbitAddHeight: forbitAddHeight
        };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "forbitAddHeightOnFly", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取飞行时是否禁止增加高度的标志
     * @returns {Promise<boolean>} 是否禁止增加高度
     */
    static async IsForbitAddHeightOnFly() {
        let forbitAddHeight = false;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "IsForbitAddHeightOnFly", param, function (json) {
            if (json.forbitAddHeight !== undefined) {
                forbitAddHeight = json.forbitAddHeight;
            }
        });
        return forbitAddHeight;
    }

    /**
     * 设置是否禁用边界检查
     * @param {boolean} disableBoundCheck - 是否禁用边界检查
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setDisableBoundCheck(disableBoundCheck) {
        let result = false;
        let param = {
            disableBoundCheck: disableBoundCheck
        };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "setDisableBoundCheck", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取是否禁用边界检查
     * @returns {Promise<boolean>} 是否禁用边界检查
     */
    static async isDisableBoundCheck() {
        let disableBoundCheck = false;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "isDisableBoundCheck", param, function (json) {
            if (json.disableBoundCheck !== undefined) {
                disableBoundCheck = json.disableBoundCheck;
            }
        });
        return disableBoundCheck;
    }

    /**
     * 设置Pawn是否启用
     * @param {boolean} enable - 是否启用
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setPawnEnable(enable) {
        let result = false;
        let param = { enable: enable };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "setPawnEnable", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取Pawn是否启用
     * @returns {Promise<boolean>} 是否启用
     */
    static async getPawnEnable() {
        let enable = false;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "getPawnEnable", param, function (json) {
            if (json.enable !== undefined) {
                enable = json.enable;
            }
        });
        return enable;
    }

    /**
     * 设置鼠标滚轮缩放速度倍率（对应 MouseWheelSpeed，默认1.0）
     * @param {number} mouseWheelSpeed - 速度倍率，值越大缩放越快
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setMouseWheelSpeed(mouseWheelSpeed) {
        let result = false;
        let param = { mouseWheelSpeed: mouseWheelSpeed };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "setMouseWheelSpeed", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取鼠标滚轮缩放速度倍率（对应 MouseWheelSpeed，默认1.0）
     * @returns {Promise<number>} 当前速度倍率
     */
    static async getMouseWheelSpeed() {
        let mouseWheelSpeed = 1.0;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "getMouseWheelSpeed", param, function (json) {
            if (json.mouseWheelSpeed !== undefined) {
                mouseWheelSpeed = json.mouseWheelSpeed;
            }
        });
        return mouseWheelSpeed;
    }

    /**
     * 设置是否强制使用近距离平移模式（开启后平移始终按屏幕位移计算，垂直方向沿地表上方向）
     * @param {boolean} forceUseNearTranslationMode - 是否强制使用近距离平移模式
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setForceUseNearTranslationMode(forceUseNearTranslationMode) {
        let result = false;
        let param = { forceUseNearTranslationMode: forceUseNearTranslationMode };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "setForceUseNearTranslationMode", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取是否强制使用近距离平移模式
     * @returns {Promise<boolean>} 是否强制使用近距离平移模式
     */
    static async isForceUseNearTranslationMode() {
        let forceUseNearTranslationMode = false;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "isForceUseNearTranslationMode", param, function (json) {
            if (json.forceUseNearTranslationMode !== undefined) {
                forceUseNearTranslationMode = json.forceUseNearTranslationMode;
            }
        });
        return forceUseNearTranslationMode;
    }

    /**
     * 设置相机水平圆形限制范围（DisableBoundCheck为true时不生效）
     * @param {Array} centerLLH - 圆心 [经度, 纬度, 高度]
     * @param {number} radius - 半径（米），<=0关闭限制
     * @param {boolean} [canIntersect] - 越界时是否滑到圆边界（false直接拒绝移动），不传保持原值
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setBoundingSphere(centerLLH, radius, canIntersect) {
        let result = false;
        let param = { centerLLH: centerLLH, radius: radius };
        if (canIntersect !== undefined) {
            param.canIntersect = canIntersect;
        }
        await ExcuteUEFun.excuteUEFunction(Camera.className, "setBoundingSphere", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 关闭相机水平圆形限制
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async clearBoundingSphere() {
        return await Camera.setBoundingSphere([0, 0, 0], 0);
    }

    /**
     * 获取相机水平圆形限制范围
     * @returns {Promise<object>} { centerLLH: [经度, 纬度, 高度], radius: 米, canIntersect: boolean }
     */
    static async getBoundingSphere() {
        let result = {};
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "getBoundingSphere", param, function (json) {
            result.centerLLH = json.centerLLH;
            result.radius = json.radius;
            result.canIntersect = json.canIntersect;
        });
        return result;
    }

    /**
     * 设置相机最大高度限制（米）
     * @param {number} maxHeight - 最大高度
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setMaxHeight(maxHeight) {
        let result = false;
        let param = { maxHeight: maxHeight };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "setMaxHeight", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取相机最大高度限制（米）
     * @returns {Promise<number>} 最大高度
     */
    static async getMaxHeight() {
        let maxHeight = 0;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "getMaxHeight", param, function (json) {
            if (json.maxHeight !== undefined) {
                maxHeight = json.maxHeight;
            }
        });
        return maxHeight;
    }

    /**
     * 设置禁止操作相机的高度（米），相机高于此值时不再响应移动
     * @param {number} disableHeight - 禁止操作高度
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setDisableHeight(disableHeight) {
        let result = false;
        let param = { disableHeight: disableHeight };
        await ExcuteUEFun.excuteUEFunction(Camera.className, "setDisableHeight", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取禁止操作相机的高度（米）
     * @returns {Promise<number>} 禁止操作高度
     */
    static async getDisableHeight() {
        let disableHeight = 0;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(Camera.className, "getDisableHeight", param, function (json) {
            if (json.disableHeight !== undefined) {
                disableHeight = json.disableHeight;
            }
        });
        return disableHeight;
    }
}

export { Camera }; 
