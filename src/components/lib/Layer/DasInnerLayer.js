import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";

class DasInnerLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasInnerLayer";
    }

    /**
     * Create a new inner layer instance
     * @param {Object} param - Creation parameters
     * @param {string} param.TagName - Tag name to find the actor
     * @returns {Promise<DasInnerLayer>} - New inner layer instance
     */
    static async createInstance(param) {
        let innerLayer = null;
        await ExcuteUEFun.excuteUEFunction("DasInnerLayer", "createInstance", param,
            function (json) {
                innerLayer = new DasInnerLayer();
                innerLayer.readObjectInfo(json.object);
            });

        return innerLayer;
    }
}

export { DasInnerLayer as DasInnerLayer }; 