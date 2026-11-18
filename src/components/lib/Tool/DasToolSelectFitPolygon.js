import { DasSelectToolClass } from "./DasSelectTool.js";

/**
 * JavaScript wrapper for the DasToolSelectFitPolygon UE component
 * 继承DasSelectTool，选择模式、描边高亮、selectChange回调等接口完全一致，
 * 区别是点击时优先用射线与立面贴附柱体求交选中DasFitLookPolygon
 */
class DasToolSelectFitPolygonClass extends DasSelectToolClass {
    className = "DasToolSelectFitPolygon"; // UE类名
}

const DasToolSelectFitPolygon = new DasToolSelectFitPolygonClass(); // 全局实例，保持原有调用方式

export { DasToolSelectFitPolygon, DasToolSelectFitPolygonClass };
