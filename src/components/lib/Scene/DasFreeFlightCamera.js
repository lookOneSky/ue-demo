import { ExcuteUEFun } from "../ExcuteUEFun.js";

/**
 * JavaScript wrapper for the UWebDasFreeFlightCamera UE component
 * Provides free flight pawn control functions
 */
class DasFreeFlightCamera {
    static className = "DasFreeFlightCamera";

    /**
     * 设置自由飞行操作器的移动速度
     * @param {number} moveSpeed - 移动速度值
     * @returns {Promise<boolean>} 操作是否成功
     */
    static async setMoveSpeed(moveSpeed) {
        let result = false;
        let param = {
            moveSpeed: moveSpeed
        };
        await ExcuteUEFun.excuteUEFunction(DasFreeFlightCamera.className, "setMoveSpeed", param, function (json) {
            result = true;
        });
        return result;
    }
    
    /**
     * 获取自由飞行操作器的移动速度
     * @returns {Promise<number>} 当前移动速度值
     */
    static async getMoveSpeed() {
        let result = 1.0;
        let param = {};
        await ExcuteUEFun.excuteUEFunction(DasFreeFlightCamera.className, "getMoveSpeed", param, function (json) {
            if (json.moveSpeed !== undefined) {
                result = json.moveSpeed;
            }
        });
        return result;
    }
}

export default DasFreeFlightCamera; 