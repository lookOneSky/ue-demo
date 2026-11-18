import { ExcuteUEFun } from "../ExcuteUEFun.js";

class WatchGuideLine {
    static className = "DasWatchGuideLine";

    /**
     * 设置当前激活的引导路线名
     * @param {string} routeName - 路线名称（对应Tag中 "路线名_序号" 的路线名部分）
     * @returns {Promise<boolean>}
     */
    static async setCurrentGuideLineRouteName(routeName) {
        let result = false;
        let param = { routeName: routeName };
        await ExcuteUEFun.excuteUEFunction(WatchGuideLine.className, "setCurrentGuideLineRouteName", param, function (json) {
            result = true;
        });
        return result;
    }
}

export { WatchGuideLine };
