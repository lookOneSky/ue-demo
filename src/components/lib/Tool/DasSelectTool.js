import { ExcuteUEFun, parseUEMessage } from "../ExcuteUEFun.js";
import { ToolBase } from "./ToolBase.js";

/**
 * JavaScript wrapper for the DasSelectTool UE component
 * Provides selection functionality for Components, Actors, and Layers
 */
class DasSelectToolClass extends ToolBase {
    className = "DasSelectTool"; // UE类名

    /**
     * 设置DasSelectTool为当前活动工具
     * @param {function} [callback] - Optional callback function after operation
     */
    async setToCurrent(callback) {
        let param = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", param, callback);
    }

    /**
     * 清除当前选择
     * @param {function} [callback] - Optional callback function after operation
     */
    async clearSelect(callback) {
        let param = {};
        await ExcuteUEFun.excuteUEFunction(this.className, "clearSelect", param, callback);
    }

    /**
     * 设置选择模式
     * @param {string} mode - The selection mode: "Component", "Actor", or "Layer"
     * @param {function} [callback] - Optional callback function after operation
     */
    async setSelectMode(mode) {
        let param = {
            selectMode: mode
        };
        await ExcuteUEFun.excuteUEFunction(this.className, "setSelectMode", param);
    }

    /**
     * 获取当前选择模式
     * @param {function} [callback] - Callback function receiving the selection mode
     */
    async getSelectMode() {
        let selectMode = ""
        await ExcuteUEFun.excuteUEFunction(this.className, "getSelectMode", {}, function (json) {
            selectMode = json.selectMode
        });

        return selectMode;
    }

    /**
     * 设置选择的视觉状态
     * @param {string} state - Visual state: "None", "Outline", "Highlight", or "OutlineAndHighlight"
     * @param {function} [callback] - Optional callback function after operation
     */
    async setSelectShowState(state) {
        let param = {
            selectShowState: state
        };
        await ExcuteUEFun.excuteUEFunction(this.className, "setSelectShowState", param);
    }

    /**
     * 获取当前选择的视觉状态
     * @param {function} [callback] - Callback function receiving the visual state
     */
    async getSelectShowState() {
        let strShowState = "";
        await ExcuteUEFun.excuteUEFunction(this.className, "getSelectShowState", {}, function (json) {
            strShowState = json.selectShowState;
        });

        return strShowState;
    }

    /**
     * 设置轮廓颜色
     * @param {Object} color - Color object {r: 1.0, g: 1.0, b: 1.0, a: 1.0}, range: 0-1
     */
    async setOutLineColor(color) {
        let param = {
            outlineColor: color
        };
        await ExcuteUEFun.excuteUEFunction(this.className, "setOutLineColor", param);
    }

    /**
     * 设置轮廓宽度
     * @param {number} width - Width in pixels, range: 1-10
     */
    async setOutLineWidth(width) {
        let param = {
            outlineWidth: width
        };
        await ExcuteUEFun.excuteUEFunction(this.className, "setOutLineWidth", param);
    }

    /**
     * 设置高亮颜色
     * @param {Object} color - Color object {r: 1.0, g: 1.0, b: 1.0, a: 1.0}, range: 0-1
     */
    async setHightLightColor(color) {
        let param = {
            highlightColor: color
        };
        await ExcuteUEFun.excuteUEFunction(this.className, "setHightLightColor", param);
    }

    addCallBack(fun){
        window.viewer.addResponseEventListener(this.className, (json) => {
            let obj = parseUEMessage(json);

            if(obj.class == this.className)
            {
                if(fun != null)
                {
                    fun(obj);
                }
            }
        });
    }

    removeCallBack(){
        window.viewer.removeResponseEventListener(this.className)
    }
}

const DasSelectTool = new DasSelectToolClass(); // 全局实例，保持原有调用方式

export { DasSelectTool, DasSelectToolClass };
