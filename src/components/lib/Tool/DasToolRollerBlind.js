import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { ToolBase } from "./ToolBase.js";

class DasToolRollerBlind extends ToolBase {
    className = "ToolRollerBlind";

    /**
     * 激活卷帘对比工具
     * @param {function} [callback]
     */
    async setToCurrent(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {}, callback);
    }

    /**
     * 设置卷帘分界线位置
     * @param {number} rollerBlindPosition - 位置 0.0~1.0（0=最左，1=最右）
     * @param {function} [callback]
     */
    async setRollerBlindPosition(rollerBlindPosition, callback) {
        let param = { rollerBlindPosition: rollerBlindPosition };
        await ExcuteUEFun.excuteUEFunction(this.className, "setRollerBlindPosition", param, callback);
    }

    /**
     * 获取当前卷帘分界线位置
     * @param {function} [callback] - 回调参数: {rollerBlindPosition: number}
     */
    async getRollerBlindPosition(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getRollerBlindPosition", {}, callback);
    }

    /**
     * 设置图层 Actor 在卷帘分界线的显示侧
     * @param {DasLayerBase} layer - 目标图层对象
     * @param {boolean} bRight - true=右侧显示，false=左侧显示
     * @param {function} [callback]
     */
    async setRollerBlindRight(layer, bRight, callback) {
        const param = {
            layer: layer.writeObjectInfo(),
            rollerBlindRight: bRight
        };
        await ExcuteUEFun.excuteUEFunction(this.className, "setRollerBlindRight", param, callback);
    }

    /**
     * 设置分界线贴图与贴图宽度
     * @param {string} texturePath - 图片路径：本地绝对路径 / base64 字符串 / http(s) URL；为空则不修改
     * @param {number} textureWidth - 贴图宽度（基于 1080 屏幕高度的像素值，按实际高度等比缩放）；<=0 则不修改
     * @param {function} [callback]
     */
    async setRollerBlindLineTexture(texturePath, textureWidth, callback) {
        let param = {
            texturePath: texturePath,
            textureWidth: textureWidth
        };
        await ExcuteUEFun.excuteUEFunction(this.className, "setRollerBlindLineTexture", param, callback);
    }

    /**
     * 设置分界线拖拽命中宽度（触屏拖拽热区）
     * @param {number} hitThreshold - 命中阈值（基于 1080 屏幕高度的像素值，按实际高度等比缩放）
     * @param {function} [callback]
     */
    async setRollerBlindHitThreshold(hitThreshold, callback) {
        let param = { hitThreshold: hitThreshold };
        await ExcuteUEFun.excuteUEFunction(this.className, "setRollerBlindHitThreshold", param, callback);
    }

    /**
     * 设置是否暂停移动中间轴（防止触屏与鼠标操作误触分界线）
     * @param {boolean} movePaused - true=暂停（无法拖动/点击移动分界线），false=恢复
     * @param {function} [callback]
     */
    async setRollerBlindMovePaused(movePaused, callback) {
        let param = { movePaused: movePaused };
        await ExcuteUEFun.excuteUEFunction(this.className, "setRollerBlindMovePaused", param, callback);
    }

    /**
     * 获取是否暂停移动中间轴
     * @param {function} [callback] - 回调参数: {movePaused: boolean}
     */
    async getRollerBlindMovePaused(callback) {
        await ExcuteUEFun.excuteUEFunction(this.className, "getRollerBlindMovePaused", {}, callback);
    }
}

export { DasToolRollerBlind }
