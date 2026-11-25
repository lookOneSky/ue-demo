import { ExcuteUEFun, isUESuccess } from "../ExcuteUEFun.js";

async function applySetting(method, params) {
    const reply = await ExcuteUEFun.excuteUEFunction(ShowModel.className, method, params);
    if (!isUESuccess(reply)) throw new Error("UE 未能应用 ShowModel." + method);
}

class ShowModel {
    static className = "ShowModel";

    /**
     * 设置白膜模式
     * @param {boolean} bEnable - 是否开启白膜
     */
    static async SetWhiteModelEnable(bEnable) {
        await applySetting("SetWhiteModelEnable", { bEnable })
    }

    /**
     * 获取白膜模式当前状态
     * @param {function} [callback] - 回调，参数含 bEnable(bool)
     */
    static async IsWhiteModelEnable(callback) {
        return ExcuteUEFun.excuteUEFunction(ShowModel.className, "IsWhiteModelEnable", {}, callback)
    }

    /**
     * 设置线框模式
     * @param {boolean} bEnable - 是否开启线框
     */
    static async SetWireframeEnable(bEnable) {
        await applySetting("SetWireframeEnable", { bEnable })
    }

    /**
     * 获取线框模式当前状态
     * @param {function} [callback] - 回调，参数含 bEnable(bool)
     */
    static async IsWireframeEnable(callback) {
        return ExcuteUEFun.excuteUEFunction(ShowModel.className, "IsWireframeEnable", {}, callback)
    }

    /**
     * 设置双面材质模式
     * @param {boolean} bEnable - 是否开启双面
     */
    static async SetTwoSideEnable(bEnable) {
        await applySetting("SetTwoSideEnable", { bEnable })
    }

    /**
     * 获取双面材质当前状态
     * @param {function} [callback] - 回调，参数含 bEnable(bool)
     */
    static async IsTwoSideEnable(callback) {
        return ExcuteUEFun.excuteUEFunction(ShowModel.className, "IsTwoSideEnable", {}, callback)
    }

    /**
     * 设置Unlight材质模式
     * @param {boolean} bEnable - 是否开启Unlight（不受光）材质
     */
    static async SetUnlightEnable(bEnable) {
        await applySetting("SetUnlightEnable", { bEnable })
    }

    /**
     * 获取Unlight材质当前状态
     * @param {function} [callback] - 回调，参数含 bEnable(bool)
     */
    static async IsUnlightEnable(callback) {
        return ExcuteUEFun.excuteUEFunction(ShowModel.className, "IsUnlightEnable", {}, callback)
    }

    /**
     * 设置3DTiles平滑法线生成
     * @param {boolean} bEnable - 是否开启平滑法线
     */
    static async SetGenerateNormal(bEnable) {
        await applySetting("SetGenerateNormal", { bEnable })
    }

    /**
     * 获取3DTiles平滑法线当前状态
     * @param {function} [callback] - 回调，参数含 bEnable(bool)
     */
    static async IsGenerateNormal(callback) {
        return ExcuteUEFun.excuteUEFunction(ShowModel.className, "IsGenerateNormal", {}, callback)
    }

    /**
     * 设置法线反转值
     * @param {number} normalInverse - 法线反转值，范围 0-1（0=不反转，1=完全反转）
     */
    static async SetNormalInverse(normalInverse) {
        await applySetting("SetNormalInverse", { normalInverse })
    }

    /**
     * 获取法线反转值
     * @param {function} [callback] - 回调，参数含 normalInverse(number)
     */
    static async GetNormalInverse(callback) {
        return ExcuteUEFun.excuteUEFunction(ShowModel.className, "GetNormalInverse", {}, callback)
    }

    /**
     * 设置后处理开关
     * @param {boolean} bEnable - 是否开启后处理，false 等同控制台 showflag.PostProcessing 0
     */
    static async SetPostProcessEnable(bEnable) {
        await applySetting("SetPostProcessEnable", { bEnable })
    }

    /**
     * 获取后处理当前状态
     * @param {function} [callback] - 回调，参数含 bEnable(bool)
     */
    static async IsPostProcessEnable(callback) {
        return ExcuteUEFun.excuteUEFunction(ShowModel.className, "IsPostProcessEnable", {}, callback)
    }

    /**
     * 设置白膜颜色
     * @param {{r: number, g: number, b: number, a: number}} color - 颜色，范围 0-1
     */
    static async SetPureColor(color) {
        await applySetting("SetPureColor", { color })
    }
}
export { ShowModel }
