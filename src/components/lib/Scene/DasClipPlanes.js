import { ExcuteUEFun } from "../ExcuteUEFun.js";

class DasClipPlanes {
    static className = "DasClipPlanes";

    /**
     * 整体替换裁剪平面列表
     * @param {Array<{normal: number[], distance: number}>} planes - 裁剪平面数组，normal为[x,y,z]法线，distance为平面距离
     */
    static async SetClipPlanes(planes) {
        return ExcuteUEFun.excuteUEFunction(DasClipPlanes.className, "SetClipPlanes", { planes })
    }

    /**
     * 获取当前裁剪平面列表
     * @param {function} callback - 回调，参数含 planes(Array<{normal, distance}>)
     */
    static async GetClipPlanes(callback) {
        return ExcuteUEFun.excuteUEFunction(DasClipPlanes.className, "GetClipPlanes", {}, callback)
    }

    /**
     * 清空所有裁剪平面
     */
    static async ClearClipPlanes() {
        return ExcuteUEFun.excuteUEFunction(DasClipPlanes.className, "ClearClipPlanes", {})
    }

    /**
     * 设置裁剪总开关
     * @param {boolean} bEnable - 是否开启裁剪
     */
    static async SetClipEnable(bEnable) {
        return ExcuteUEFun.excuteUEFunction(DasClipPlanes.className, "SetClipEnable", { bEnable })
    }

    /**
     * 获取裁剪总开关状态
     * @param {function} callback - 回调，参数含 bEnable(bool)
     */
    static async IsClipEnable(callback) {
        return ExcuteUEFun.excuteUEFunction(DasClipPlanes.className, "IsClipEnable", {}, callback)
    }
}
export { DasClipPlanes }
