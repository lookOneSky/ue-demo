import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasGroupLayer } from "./DasGroupLayer.js";

class DasGroupInnerLayer extends DasGroupLayer {
    constructor() {
        super();
        this.id = "";
        this.className = "DasGroupInnerLayer";
    }

    /**
     * Create a new group inner layer instance.
     * Finds all actors with the given tag and wraps each as a child inner layer.
     * @param {Object} param - Creation parameters
     * @param {string} param.TagName - Tag name used to find actors in the scene
     * @returns {Promise<DasGroupInnerLayer>} - New group inner layer instance
     */
    static async createInstance(param) {
        let group = null;
        await ExcuteUEFun.excuteUEFunction("DasGroupInnerLayer", "createInstance", param,
            function (json) {
                group = new DasGroupInnerLayer();
                group.readObjectInfo(json.object);
            });

        return group;
    }
}

export { DasGroupInnerLayer as DasGroupInnerLayer };
