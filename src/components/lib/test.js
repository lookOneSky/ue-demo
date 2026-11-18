import { BaseFunction } from "./BaseFunction.js"

class EVObject {
    constructor() {
        this.id = ""//前后端交互使用ID
        this.className = "EVObject"//对象名,与后端交互需要
    }
    getClassName = function () {
        return this.className
    }
    getID = function () {
        return this.id
    }
    getObjInfo = function () {
        var objInfo = {
            id: this.id,
            className: this.className
        }

        return objInfo;
    }
    /**
     * 删除对象
     */
    async removeInstance(callback) {
        if (this.id == "") {
            return
        }
        var param = {}
        this.excuteUEFunction("removeInstance", param, (json) => {
            // @ts-ignore
            window.EVLayerCollection.delete(this.id)
            callback && callback(json);
        })
    }
    excuteUEFunction = async function (funName, param, callback) {
        param.id = this.id;
        var strWholeFun = this.getClassName() + "_" + funName;
        let result = await BaseFunction.excuteUEFunction(strWholeFun, param, callback);
        return result;
    }
}
export { EVObject as EVObject }
