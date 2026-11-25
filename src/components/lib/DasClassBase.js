import { ExcuteUEFun, isUEFailure } from "./ExcuteUEFun.js";

class DasClassBase {
    constructor() {
        this.id = ""//前后端交互使用ID
        this.className = "DasLayerBase"//对象名,与后端交互需要
    }
    getClassName = function () {
        return this.className
    }
    getID = function () {
        return this.id
    }

    //请求获取的class，可以获取具体的子类信息
    requestClassName = async function () {
        let name = "";
        await this.excuteUEClassFunction("requestClassName", {}, function(json) {
            name = json.childClassName;
        });
        return name;
    }
  
    readObjectInfo(obj) {
        if (!obj?.id) throw new Error(`UE 未返回 ${this.className} 的实例 ID`);
        this.id = obj.id;
        this.className = obj.class || this.className
    }

    writeObjectJson = function () {
        let json = {}
        json.id = this.id
        json.class = this.className
        return json
    }
    
    /** @param {Function} [callback] */
    async removeInstance(callback) {
        if (this.id == "") {
            return
        }
        return this.excuteUEClassFunction("removeInstance", {}, callback);
    }

    /**
     * @param {string} funName
     * @param {object} param
     * @param {Function} [callback]
     */
    async excuteUEClassFunction (funName, param, callback) {
        const result = await ExcuteUEFun.excuteUEFunction(this.getClassName(), funName, { ...param, id: this.id }, callback);
        if (!callback && isUEFailure(result)) throw new Error(`${this.getClassName()}.${funName} 执行失败`);
        return result;
    }


}
export { DasClassBase as DasClassBase }

    
