import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasPointsToolClass } from './DasPointsTool.js';

/**
 * DasPointEditTool JavaScript接口类
 * 继承自DasPointsTool，增加图层编辑功能
 */
class DasPointEditToolClass extends DasPointsToolClass {
    className = "DasPointEditTool"; // UE类名

    /**
     * 设置编辑图层
     * @param {DasLayerBase} layer - 要编辑的图层对象（DasLayerBase 及其子类）
     * @returns {Promise<boolean>} 设置是否成功
     */
    async editLayer(layer) {
        const param = {
            layer: layer.writeObjectInfo()  // 转换为 { id, class } 格式供 UE 解析
        };

        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "editLayer", param);
            return true;
        } catch (error) {
            console.error('设置编辑图层失败:', error);
            return false;
        }
    }

    /**
     * 设置当前工具
     * @returns {Promise<boolean>} 设置是否成功
     */
    async setToCurrent() {
        try {
            await ExcuteUEFun.excuteUEFunction(this.className, "setToCurrent", {});
            return true;
        } catch (error) {
            console.error('设置当前工具失败:', error);
            return false;
        }
    }
}

const DasPointEditTool = new DasPointEditToolClass(); // 全局实例，保持原有调用方式

export { DasPointEditTool }; 