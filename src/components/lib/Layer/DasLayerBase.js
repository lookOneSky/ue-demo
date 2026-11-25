import { DasClassBase } from "../DasClassBase.js";

class DasLayerBase extends DasClassBase {
    constructor() {
        super();
        this.id = "";
        this.className = "DasLayerBase"
    }

    // Get the layer's unique ID
    getID = async function () {
        let layerID = "";
        await this.excuteUEClassFunction("getID", {}, function(json) {
            layerID = json.LayerID;
        });
        return layerID;
    }

    // Set the layer's visibility
    setVisible = async function (visible) {
        const param = { visible: visible };
        return await this.excuteUEClassFunction("setVisible", param);
    }

    // Check if the layer is visible
    isVisible = async function () {
        let visible = false;
        await this.excuteUEClassFunction("isVisible", {}, function(json) {
            visible = json.visible;
        });
        return visible;
    }

    // Set the layer's name
    setName = async function (strName) {
        const param = { name: strName };
        return await this.excuteUEClassFunction("setName", param);
    }

    // Get the layer's name
    getName = async function () {
        let name = "";
        await this.excuteUEClassFunction("getName", {}, function(json) {
            name = json.name;
        });
        return name;
    }

    // Get the layer's parent
    getParent = async function () {
        const reply = await this.excuteUEClassFunction("getParent", {});
        if (!reply.parent?.id) return null;
        // The group class extends this base, so load it after both classes are initialized.
        const { DasGroupLayer } = await import("./DasGroupLayer.js");
        const parent = new DasGroupLayer();
        parent.readObjectInfo(reply.parent);
        return parent;
    }

    // Fly camera to this layer's position
    flyToThis = async function (canInterruptByMoving = true, flyDuration = 5.0, pitch = 89.9) {
        const param = {
            canInterruptByMoving: canInterruptByMoving,
            flyDuration: flyDuration,
            Pitch: pitch
        };
        return await this.excuteUEClassFunction("flyToThis", param);
    }

    // Set the scale bound for fly to operation
    setScaleBoundFlyTo = async function (scaleBoundFlyTo) {
        const param = { scaleBoundFlyTo: scaleBoundFlyTo };
        return await this.excuteUEClassFunction("setScaleBoundFlyTo", param);
    }

    // Get the scale bound for fly to operation
    getScaleBoundFlyTo = async function () {
        let scaleBoundFlyTo = 1.0;
        await this.excuteUEClassFunction("getScaleBoundFlyTo", {}, function(json) {
            scaleBoundFlyTo = json.scaleBoundFlyTo;
        });
        return scaleBoundFlyTo;
    }

    // Set the layer's visible distance settings (combined interface)
    setVisibleDistance = async function (distanceVisibleEnable, maxVisibleDistance, minVisibleDistance) {
        const param = { 
            distanceVisibleEnable: distanceVisibleEnable,
            maxVisibleDistance: maxVisibleDistance
        };
        
        if (minVisibleDistance !== undefined) {
            param.minVisibleDistance = minVisibleDistance;
        }
        
        return await this.excuteUEClassFunction("setVisibleDistance", param);
    }

    // Set distance visible enable state
    setDistanceVisibleEnable = async function (enable) {
        const param = { enable: enable };
        return await this.excuteUEClassFunction("setDistanceVisibleEnable", param);
    }

    // Check if distance visible is enabled
    isDistanceVisibleEnable = async function () {
        let enable = false;
        await this.excuteUEClassFunction("isDistanceVisibleEnable", {}, function(json) {
            enable = json.enable;
        });
        return enable;
    }

    // Set visible distance configuration
    setVisibleDistanceConfig = async function (maxVisibleDistance, minVisibleDistance = 0) {
        const param = { 
            maxVisibleDistance: maxVisibleDistance,
            minVisibleDistance: minVisibleDistance
        };
        return await this.excuteUEClassFunction("setVisibleDistanceConfig", param);
    }

    // Get visible distance configuration
    getVisibleDistanceConfig = async function () {
        let config = { maxVisibleDistance: 50000, minVisibleDistance: 0 };
        await this.excuteUEClassFunction("getVisibleDistanceConfig", {}, function(json) {
            config.maxVisibleDistance = json.maxVisibleDistance;
            config.minVisibleDistance = json.minVisibleDistance;
        });
        return config;
    }

    // Set the layer's highlight state
    setHightLight = async function (hightLight) {
        const param = { hightLight: hightLight };
        return await this.excuteUEClassFunction("setHightLight", param);
    }

    // Check if the layer is highlighted
    isHightLight = async function () {
        let hightLight = false;
        await this.excuteUEClassFunction("isHightLight", {}, function(json) {
            hightLight = json.hightLight;
        });
        return hightLight;
    }

    // Set the layer's outline state
    setOutline = async function (outline) {
        const param = { outline: outline };
        return await this.excuteUEClassFunction("setOutline", param);
    }

    // Check if the layer has outline
    isOutline = async function () {
        let outline = false;
        await this.excuteUEClassFunction("isOutline", {}, function(json) {
            outline = json.outline;
        });
        return outline;
    }

    // Set the layer as permanent layer
    // Permanent layers are added to RootLayer and won't be cleared
    setPermanentLayer = async function (isPermanent) {
        const param = { IsPermanentLayer: isPermanent };
        return await this.excuteUEClassFunction("setPermanentLayer", param);
    }

    // Check if the layer is a permanent layer
    isPermanentLayer = async function () {
        let isPermanent = false;
        await this.excuteUEClassFunction("isPermanentLayer", {}, function(json) {
            isPermanent = json.IsPermanentLayer;
        });
        return isPermanent;
    }

    // Set which side of the roller-blind splitting line this layer's Actor is shown on
    setRollerBlindRight = async function (rollerBlindRight) {
        const param = { rollerBlindRight: rollerBlindRight };
        return await this.excuteUEClassFunction("setRollerBlindRight", param);
    }

    // Set whether this layer's primitive components cast shadows
    setCastShadow = async function (castShadow) {
        const param = { castShadow: castShadow };
        return await this.excuteUEClassFunction("setCastShadow", param);
    }

    /**
     * Set the layer's world transform
     * @param {Object}   transform             - Transform object
     * @param {number[]} transform.translation - Position as [x, y, z] (ESU coordinates)
     * @param {number[]} transform.rotation    - Rotation as quaternion [x, y, z, w]
     * @param {number[]} transform.scale3D     - Scale as [x, y, z]
     */
    setWorldTransform = async function (transform) {
        const param = { transform: transform };
        return await this.excuteUEClassFunction("setWorldTransform", param);
    }

    /**
     * Get the layer's world transform
     * @returns {Promise<{translation: number[], rotation: number[], scale3D: number[]}>}
     */
    getWorldTransform = async function () {
        let transform = null;
        await this.excuteUEClassFunction("getWorldTransform", {}, function(json) {
            transform = json.transform;
        });
        return transform;
    }

    /**
     * Update all layer properties at once
     * This method allows batch updating of multiple layer properties in a single call
     *
     * NOTE: Subclass createInstance calls this parent updateAll with all initialization
     * params merged (base params + subclass-specific params) in a single request.
     *
     * @param {Object} params - The parameters object containing properties to update
     * @param {boolean} [params.visible] - Layer visibility state
     * @param {boolean} [params.distanceVisibleEnable] - Enable/disable distance-based visibility
     * @param {number} [params.maxVisibleDistance] - Maximum visible distance in meters
     * @param {number} [params.minVisibleDistance] - Minimum visible distance in meters (optional)
     * @param {boolean} [params.hightLight] - Highlight state
     * @param {boolean} [params.outline] - Outline state
     * @param {number} [params.scaleBoundFlyTo] - Scale bound for FlyTo operation
     * @param {boolean} [params.IsPermanentLayer] - Set as permanent layer (added to RootLayer, won't be cleared)
     * @param {boolean} [params.castShadow] - Whether the layer's primitive components cast shadows
     * @param {Object}   [params.transform]             - World transform
     * @param {number[]} [params.transform.translation] - Position [x, y, z] (ESU coordinates)
     * @param {number[]} [params.transform.rotation]    - Rotation as quaternion [x, y, z, w]
     * @param {number[]} [params.transform.scale3D]     - Scale [x, y, z]
     *
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     *
     * @example
     * // Update multiple properties at once
     * await layer.updateAll({
     *     visible: true,
     *     distanceVisibleEnable: true,
     *     maxVisibleDistance: 10000,
     *     minVisibleDistance: 100,
     *     hightLight: false,
     *     outline: true,
     *     scaleBoundFlyTo: 1.5,
     *     IsPermanentLayer: true,
     *     castShadow: true,
     *     transform: { translation: [0, 0, 0], rotation: [0, 0, 0, 1], scale3D: [1, 1, 1] }
     * });
     */
    updateAll = async function (params) {
        return await this.excuteUEClassFunction("updateAll", params);
    }

    readObjectInfo(obj) {
        super.readObjectInfo(obj);
        this.layerID = obj?.layerID ?? obj?.LayerID;
    }

    writeObjectInfo() {
        let obj = {}
        obj.class = this.className;
        obj.id = this.id;
        return obj;
    }
}

export { DasLayerBase as DasLayerBase };