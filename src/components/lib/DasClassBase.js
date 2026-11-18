import { fa } from "element-plus/es/locales.mjs";
import { ExcuteUEFun } from "./ExcuteUEFun.js";

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
  
    readObjectInfo = function (obj) {
        if (obj == null) {
            return
        }
        this.id = obj.id;
        this.className = obj.class
    }

    writeObjectJson = function () {
        let json = {}
        json.id = this.id
        json.class = this.className
        return json
    }
    
    async removeInstance(callback) {
        if (this.id == "") {
            return
        }
        var param = {}

        param.id = this.id
        let result = await ExcuteUEFun.excuteUEFunction(this.getClassName(), "removeInstance", param, callback);
        return result;
    }

    async excuteUEClassFunction (funName, param, callback) {
        param.id = this.id
        let result = await ExcuteUEFun.excuteUEFunction(this.getClassName(), funName, param, callback);
        return result;
    }


}
export { DasClassBase as DasClassBase }

    
