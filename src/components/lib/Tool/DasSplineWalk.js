import { ExcuteUEFun, parseUEMessage } from "../ExcuteUEFun.js";

class DasSplineWalkClass {
    className = "DasSplineWalk";

    /**
     * 设置样条线自动行走开关
     * @param {boolean} enable
     */
    async setEnableAutoMove(enable) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setEnableAutoMove",
            { enableAutoMove: enable });
    }

    /**
     * 通过图层对象设置样条线 Actor
     * @param {DasLayerBase} layer - 图层对象（DasLayerBase 及其子类）
     */
    async setSplineActorByLayer(layer) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setSplineActorByLayer",
            { layer: layer.writeObjectInfo() });
    }

    /**
     * 设置移动速度
     * @param {number} speed
     */
    async setSpeed(speed) {
        await ExcuteUEFun.excuteUEFunction(this.className, "setSpeed",
            { speed: speed });
    }

    /**
     * 注册回调，移动完成时触发 fun(obj)
     * @param {function} fun
     */
    addCallBack(fun) {
        window.viewer.addResponseEventListener(this.className, (json) => {
            let obj = parseUEMessage(json);
            if (obj.class == this.className && fun != null) {
                fun(obj);
            }
        });
    }

    removeCallBack() {
        window.viewer.removeResponseEventListener(this.className);
    }
}

const DasSplineWalk = new DasSplineWalkClass();
export { DasSplineWalk };
