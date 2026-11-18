import { ExcuteUEFun } from "../ExcuteUEFun.js";

/**
 * JavaScript wrapper for the UWebThirdPersonCamera UE component
 * Provides third person pawn control functions
 */
class ThirdPersonCamera {
    static className = "ThirdPersonCamera";

    /**
     * 设置第三人称操作器的移动速度
     * @param {number} moveSpeed - 移动速度值
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setMoveSpeed(moveSpeed) {
        let result = false;
        let param = {
            moveSpeed: moveSpeed
        };
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setMoveSpeed", param, function (json) {
            result = true;
        });
        return result;
    }
    
    /**
     * 获取第三人称操作器的移动速度
     * @returns {Promise<number>} 当前移动速度值
     */
    static async getMoveSpeed() {
        let result = 1.0;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "getMoveSpeed", param, function (json) {
            if (json.moveSpeed !== undefined) {
                result = json.moveSpeed;
            }
        });
        return result;
    }

    /**
     * 设置视角输入倍速
     * @param {number} lookScale - 倍速值
     * @returns {Promise<boolean>}
     */
    static async setLookScale(lookScale) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setLookScale", { lookScale: lookScale }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 获取视角输入倍速
     * @returns {Promise<number>}
     */
    static async getLookScale() {
        let result = 1.0;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "getLookScale", {}, function (json) {
            if (json.lookScale !== undefined) {
                result = json.lookScale;
            }
        });
        return result;
    }

    /**
     * 设置脚部骨骼网格体部件
     * @param {string} feetName - 部件名称
     * @returns {Promise<boolean>}
     */
    static async setFeet(feetName) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setFeet", { feetName: feetName }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 设置头发骨骼网格体部件
     * @param {string} hairName - 部件名称
     * @returns {Promise<boolean>}
     */
    static async setHair(hairName) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setHair", { hairName: hairName }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 设置左手骨骼网格体部件
     * @param {string} handLName - 部件名称
     * @returns {Promise<boolean>}
     */
    static async setHandL(handLName) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setHandL", { handLName: handLName }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 设置右手骨骼网格体部件
     * @param {string} handRName - 部件名称
     * @returns {Promise<boolean>}
     */
    static async setHandR(handRName) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setHandR", { handRName: handRName }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 设置下身骨骼网格体部件
     * @param {string} bottomBodyName - 部件名称
     * @returns {Promise<boolean>}
     */
    static async setBottomBody(bottomBodyName) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setBottomBody", { bottomBodyName: bottomBodyName }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 设置上身骨骼网格体部件
     * @param {string} upperBodyName - 部件名称
     * @returns {Promise<boolean>}
     */
    static async setUpperBody(upperBodyName) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setUpperBody", { upperBodyName: upperBodyName }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 设置面具骨骼网格体部件
     * @param {string} maskName - 部件名称
     * @returns {Promise<boolean>}
     */
    static async setMask(maskName) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "setMask", { maskName: maskName }, function (json) {
            result = true;
        });
        return result;
    }

    /**
     * 一次性更新所有换装部件
     * @param {object} param - 包含各部件名称的对象，所有字段可选
     * @param {string} [param.feetName] - 脚部部件名称
     * @param {string} [param.hairName] - 头发部件名称
     * @param {string} [param.handLName] - 左手部件名称
     * @param {string} [param.handRName] - 右手部件名称
     * @param {string} [param.bottomBodyName] - 下身部件名称
     * @param {string} [param.upperBodyName] - 上身部件名称
     * @param {string} [param.maskName] - 面具部件名称
     * @returns {Promise<boolean>}
     */
    static async updateAll(param) {
        let result = false;
        await ExcuteUEFun.excuteUEFunction(ThirdPersonCamera.className, "updateAll", param, function (json) {
            result = true;
        });
        return result;
    }
}

export { ThirdPersonCamera };
