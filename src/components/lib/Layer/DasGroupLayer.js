import { ExcuteUEFun } from "../ExcuteUEFun.js";
import { DasLayerBase } from "./DasLayerBase.js";


class DasGroupLayer extends DasLayerBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasGroupLayer";
    }

    // Add a layer to the group
    addLayer = async function (childLayer) {
        const param = { child: childLayer.writeObjectJson()};
        return await this.excuteUEClassFunction("addLayer", param);
    }

    // Remove a layer from the group
    removeLayer = async function (childLayer) {
        const param = { child: childLayer };
        return await this.excuteUEClassFunction("removeLayer", param);
    }

    // Get number of layers in the group
    numLayer = async function () {
        let num = 0;
        await this.excuteUEClassFunction("numLayer", {}, function (json) {
            num = json.num;
        });
        return num;
    }

    // Get a layer by index
    getLayer = async function (index) {
        let layer = null;
        const param = { index: index };
        await this.excuteUEClassFunction("getLayer", param, function (json) {
            layer = new DasLayerBase();
            layer.readObjectInfo(json);
        });

        return layer;
    }

    // Get all layers in the group
    getAllLayer = async function () {
        let layers = [];
        await this.excuteUEClassFunction("getAllLayer", {}, function (json) {
            let layerJsons = json.layers;
            for (let i = 0; i < layerJsons.length; i++) {
                let layer = new DasLayerBase();
                layer.readObjectInfo(layerJsons[i]);
                layers.push(layer);
            }
        });
        return layers;
    }

    // Remove all layers from the group
    removeAllLayer = async function () {
        return await this.excuteUEClassFunction("removeAllLayer", {});
    }

    // Get the root group
    static getRoot = async function () {
        let root = null
        await ExcuteUEFun.excuteUEFunction("DasGroupLayer", "getRoot", {}, function (json) {
            root = new DasGroupLayer();
            root.readObjectInfo(json);
        });
        return root;
    }

    static async createInstance(param) {
        let group = null
        await ExcuteUEFun.excuteUEFunction("DasGroupLayer", "createInstance", param,
            function (json) {
                group = new DasGroupLayer();
                group.readObjectInfo(json.object);
            });

        return group;
    }
}

export { DasGroupLayer as DasGroupLayer };
