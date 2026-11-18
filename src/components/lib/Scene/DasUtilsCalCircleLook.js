import { ExcuteUEFun } from "../ExcuteUEFun.js";

/**
 * JavaScript wrapper for the UWebDasUtilsCalCircleLook UE component
 * 环绕观察点位计算：给定目标点和圆心，算出隔指定距离回看目标点的相机位姿
 */
class DasUtilsCalCircleLook {
    static className = "DasUtilsCalCircleLook";

    /**
     * 计算从圆心方位观察目标点的相机位姿
     * @param {Array} posTargetLLH - 目标点[经度,纬度,高度(米)]
     * @param {Array} [posCircleLLH=[0,0,0]] - 圆心[经度,纬度,高度(米)]，传零向量时取Georeference原点
     * @param {number} [distance=100000] - 相机到目标点的距离（UE厘米）
     * @returns {Promise<object>} {locationLLH:[经度,纬度,高度], rotationLLH:{pitch,yaw,roll}}，失败返回{}
     */
    static async calcLookTransform(posTargetLLH, posCircleLLH = [0, 0, 0], distance = 100000) {
        let result = {};
        let param = {
            posTargetLLH: posTargetLLH,
            posCircleLLH: posCircleLLH,
            distance: distance
        };
        await ExcuteUEFun.excuteUEFunction(DasUtilsCalCircleLook.className, "calcLookTransform", param, function (json) {
            if (json.locationLLH && Array.isArray(json.locationLLH)) {
                result.locationLLH = json.locationLLH;
            }
            if (json.rotationLLH) {
                result.rotationLLH = json.rotationLLH;
            }
        });
        return result;
    }

    /**
     * 用已配置的圆心和距离计算相机位姿
     * @param {Array} posTargetLLH - 目标点[经度,纬度,高度(米)]
     * @returns {Promise<object>} {locationLLH:[经度,纬度,高度], rotationLLH:{pitch,yaw,roll}}，失败返回{}
     */
    static async calcLookTransformByConfig(posTargetLLH) {
        let result = {};
        let param = { posTargetLLH: posTargetLLH };
        await ExcuteUEFun.excuteUEFunction(DasUtilsCalCircleLook.className, "calcLookTransformByConfig", param, function (json) {
            if (json.locationLLH && Array.isArray(json.locationLLH)) {
                result.locationLLH = json.locationLLH;
            }
            if (json.rotationLLH) {
                result.rotationLLH = json.rotationLLH;
            }
        });
        return result;
    }

    /**
     * 设置环绕圆心与观察距离
     * @param {Array} posCircleLLH - 圆心[经度,纬度,高度(米)]
     * @param {number} distance - 相机到目标点的距离（UE厘米）
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setCircleConfig(posCircleLLH, distance) {
        let result = false;
        let param = {
            posCircleLLH: posCircleLLH,
            distance: distance
        };
        await ExcuteUEFun.excuteUEFunction(DasUtilsCalCircleLook.className, "setCircleConfig", param, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取环绕圆心与观察距离
     * @returns {Promise<object>} {posCircleLLH:[经度,纬度,高度], distance:number}
     */
    static async getCircleConfig() {
        let result = {};
        let param = {};
        await ExcuteUEFun.excuteUEFunction(DasUtilsCalCircleLook.className, "getCircleConfig", param, function (json) {
            if (json.posCircleLLH && Array.isArray(json.posCircleLLH)) {
                result.posCircleLLH = json.posCircleLLH;
            }
            if (json.distance !== undefined) {
                result.distance = json.distance;
            }
        });
        return result;
    }
}

export { DasUtilsCalCircleLook };
