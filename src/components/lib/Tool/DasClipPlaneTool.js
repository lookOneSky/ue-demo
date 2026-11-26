import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { ToolBase } from "./ToolBase.js";

class DasClipPlaneTool extends ToolBase {
    className = "DasClipPlaneTool";

    /**
     * 激活裁剪平面取点工具：左键第1个点为裁剪点，第2个点为方向点（决定法线），第3次点击清空重取
     * @param {function} callback - 操作完成后的回调函数
     */
    async setToCurrent(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {}, callback);
    }

    /**
     * 清空已取的裁剪点和方向点
     * @param {function} callback - 操作完成后的回调函数
     */
    async clearPoints(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "clearPoints", {}, callback);
    }

    /**
     * 导出裁剪平面到 项目根目录/ClipPlanes/时间戳.json（ADasClipPlanes 启动时加载）
     * @param {function} callback - 回调参数: {result: "Success"|"Fail"}，不足2个点时为 "Fail"
     */
    async exportClipPlaneToJson(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "exportClipPlaneToJson", {}, callback);
    }
}

export { DasClipPlaneTool }
