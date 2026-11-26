import { ExcuteUEFun } from "../ExcuteUEFun.js";

/**
 * ScreenPosInformer 类
 * 用于在Web界面中管理和跟踪地理位置点在屏幕上的投影位置
 * 提供点位注册、移除、查询以及屏幕位置变化事件监听等功能
 */
class ScreenPosInformer {
    static className = "ScreenPosInformer";

    // 存储屏幕位置变化的回调函数
    static onScreenPositionsChangedCallbacks = [];

    //static map mapString2Callback
    static mapString2Callback = new Map();
    static mapString2PointInfo = new Map();
    static bIsRequesting = false;

    //是否创建监听
    static bCreateListener = false;

    /**
     * 添加屏幕位置变化事件监听器
     * @param {function} callback - 回调函数，参数为变化的点位数组，每个点位包含 
     *                             {pointId: string, screenPos: {X: number, Y: number}, isVisible: boolean}
     * @returns {function} 返回一个取消监听的函数
     */
    static addScreenPositionsChangedListener(strID, callback) {
        ScreenPosInformer.mapString2Callback.set(strID, callback);

        if (!ScreenPosInformer.bCreateListener) {
            ScreenPosInformer.bCreateListener = true;
            window.viewer.addResponseEventListener(ScreenPosInformer.className, (json) => {
                //if (ScreenPosInformer.bIsRequesting)
                //    return;

                console.log("bIsRequesting is false");

                //json string to obj
                let obj = JSON.parse(json);

                if (obj.class == ScreenPosInformer.className) {
                    if (obj.function != "emitMessage")
                        return;

                    //points 是数组
                    let objPoints = JSON.parse(obj.message);
                    const points = objPoints.points.map(point => ({
                        pointId: point.pointId,
                        screenPos: point.screenPos,
                        isVisible: point.isVisible !== undefined ? point.isVisible : true
                    }));

                    ScreenPosInformer.mapString2PointInfo.clear();
                    for (const point of points) {
                        ScreenPosInformer.mapString2PointInfo.set(point.pointId, point);
                    }

                    // 监听视频帧
                    function onFrame(now, metadata) {
                        //连续请求，连续返回，只执行一次
                        if (!ScreenPosInformer.bIsRequesting)
                            return;

                        for (const point of ScreenPosInformer.mapString2PointInfo.values()) {
                            //延迟到帧更新的时候刷新位置
                            const callback = ScreenPosInformer.mapString2Callback.get(point.pointId);
                            if (callback) {
                                callback(point);
                            }
                        }
                        ScreenPosInformer.bIsRequesting = false;
                    }

                    const video = document.querySelector('#streamingVideo');
                    video.requestVideoFrameCallback(onFrame);
                    ScreenPosInformer.bIsRequesting = true;
                }
            });
        }

        // 返回取消监听的函数
        return function () {
            const index = ScreenPosInformer.onScreenPositionsChangedCallbacks.indexOf(callback);
            if (index !== -1) {
                ScreenPosInformer.onScreenPositionsChangedCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * 注册一个经纬度点位
     * @param {number} longitude - 经度
     * @param {number} latitude - 纬度
     * @param {number} [height=0] - 高度，可选参数
     * @returns {Promise<string>} 返回点位ID
     */
    static async RegisterPoint(longitude, latitude, height = 0) {
        let param = {
            posLLH: [longitude, latitude, height]
        };

        const result = await ExcuteUEFun.excuteUEFunction(ScreenPosInformer.className, "RegisterPoint", param);
        return result.pointId;
    }

    /**
     * 移除点位
     * @param {string} pointId - 点位ID
     * @returns {Promise<boolean>} 返回是否成功
     */
    static async RemovePoint(pointId) {
        let param = { pointId: pointId };
        const result = await ExcuteUEFun.excuteUEFunction(ScreenPosInformer.className, "RemovePoint", param);
        return result.success === undefined ? true : result.success;
    }

    /**
     * 清除所有点位
     * @returns {Promise<boolean>} 返回是否成功
     */
    static async ClearAllPoints() {
        const result = await ExcuteUEFun.excuteUEFunction(ScreenPosInformer.className, "ClearAllPoints", {});
        return result.success === undefined ? true : result.success;
    }
}

export { ScreenPosInformer }; 