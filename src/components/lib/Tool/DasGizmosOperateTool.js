import { ExcuteUEFun } from "../ExcuteUEFun.js";

/**
 * DasGizmosOperateTool JavaScript接口类
 * 提供变换操作工具的Web接口
 */
class DasGizmosOperateToolClass {
    className = "DasGizmosOperateTool"; // UE类名

    /**
     * 操作类型枚举
     */
    OperateType = {
        NoTransform: 0,  // 无变换
        Translation: 1,  // 平移
        Rotation: 2,     // 旋转
        Scale: 3         // 缩放
    };

    /**
     * 轴枚举
     */
    AxisType = {
        X: 0,  // X轴
        Y: 1,  // Y轴
        Z: 2   // Z轴
    };

    /**
     * 设置操作图层
     * @param {Object} layer - 要操作的图层对象
     * @param {boolean} saveLast - 是否保存上次操作，默认true
     * @returns {Promise<boolean>} 设置是否成功
     */
    async setOperateLayer(layer, saveLast = true) {
        const param = {
            layer: layer,
            saveLast: saveLast
        };

        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "setOperateLayer", param);
            return true;
        } catch (error) {
            console.error('设置操作图层失败:', error);
            return false;
        }
    }

    /**
     * 设置变换
     * @param {Object} transform - 变换对象，包含位置、旋转、缩放信息
     * @returns {Promise<boolean>} 设置是否成功
     */
    async setTransform(transform) {
        const param = {
            transform: transform
        };

        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "setTransform", param);
            return true;
        } catch (error) {
            console.error('设置变换失败:', error);
            return false;
        }
    }

    /**
     * 设置操作类型
     * @param {number} type - 操作类型 (0:无变换, 1:平移, 2:旋转, 3:缩放)
     * @returns {Promise<boolean>} 设置是否成功
     */
    async setOperateType(type) {
        const param = {
            type: type
        };

        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "setOperateType", param);
            return true;
        } catch (error) {
            console.error('设置操作类型失败:', error);
            return false;
        }
    }

    /**
     * 设置旋转度数每像素
     * @param {number} value - 每像素对应的旋转度数
     * @returns {Promise<boolean>} 设置是否成功
     */
    async setRotateDegreeOnePixel(value) {
        const param = {
            value: value
        };

        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "setRotateDegreeOnePixel", param);
            return true;
        } catch (error) {
            console.error('设置旋转度数每像素失败:', error);
            return false;
        }
    }

    /**
     * 自动旋转
     * @returns {Promise<boolean>} 操作是否成功
     */
    async autoRotate() {
        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "autoRotate", {});
            return true;
        } catch (error) {
            console.error('自动旋转失败:', error);
            return false;
        }
    }

    /**
     * 恢复操作
     * @returns {Promise<boolean>} 操作是否成功
     */
    async recoverOperate() {
        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "recoverOperate", {});
            return true;
        } catch (error) {
            console.error('恢复操作失败:', error);
            return false;
        }
    }

    /**
     * 设置单个轴的颜色
     * @param {number} axis - 轴 (0:X, 1:Y, 2:Z)，可用 AxisType
     * @param {Array<number>} color - [r, g, b, a]，取值 0-1，a 可省略
     * @returns {Promise<boolean>} 设置是否成功
     */
    async setAxisColor(axis, color) {
        const param = {
            axis: axis,
            color: color
        };

        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "setAxisColor", param);
            return true;
        } catch (error) {
            console.error('设置轴颜色失败:', error);
            return false;
        }
    }

    /**
     * 获取单个轴的颜色
     * @param {number} axis - 轴 (0:X, 1:Y, 2:Z)，可用 AxisType
     * @returns {Promise<Array<number>>} [r, g, b, a]，取值 0-1
     */
    async getAxisColor(axis) {
        let result = [1, 1, 1, 1];
        await ExcuteUEFun.excuteUEFunction(this.className, "getAxisColor", { axis: axis }, (json) => {
            result = json.color;
        });
        return result;
    }

    addCallBack(fun){
        window.viewer.addResponseEventListener(this.className, (json) => {
            let obj = JSON.parse(json);

            if(obj.class == this.className)
            {
                if(fun != null)
                {
                    let message = obj.message;
                    let messageObj = JSON.parse(message);
                    fun(messageObj);
                }
            }
        });
    }

    removeCallBack(){
        window.viewer.removeResponseEventListener(this.className)
    }
}

const DasGizmosOperateTool = new DasGizmosOperateToolClass(); // 全局实例，保持原有调用方式

export { DasGizmosOperateTool }; 