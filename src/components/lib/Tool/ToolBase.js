import { ExcuteUEFun } from "../ExcuteUEFun.js";

class ToolBase {
    className = "ToolBase"; // UE类名

    /**
     * 设置此工具为当前活动工具
     * @param {function} callback - 操作完成后的回调函数
     */
    async setToCurrent(callback) {
        let param = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", param, callback)
    }

    /**
     * 完成当前工具操作
     * @param {function} callback - 操作完成后的回调函数
     */
    async finishTool(callback) {
        let param = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "finishTool", param, callback)
    }
}

export { ToolBase }
