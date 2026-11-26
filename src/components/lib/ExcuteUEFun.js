import { pa } from "element-plus/es/locales.mjs";
import createGuid from "./guid.js";
class ExcuteUEFun {
    constructor() {}

    static async excuteUEFunction(strclass, strFun, param, callback) {
        if (!window.gInitListener) {
            window.gmapClass = new Map();
            window.viewer.addResponseEventListener("DasExcuteReturn", (x) => {
                //x解析成jsonObject
                let JsonResult = JSON.parse(x)
                console.log(
                    "RecieveMessage",
                    JsonResult
                );

                if (window.gmapClass.has(JsonResult.class)) {
                    var classBack = window.gmapClass.get(JsonResult.class);
                    var f = classBack.get(JsonResult.commandID);
                    if (f) {
                        f(JsonResult);
                    }
                    classBack.delete(JsonResult.commandID);
                }

            });
            window.gInitListener = true;
        }

        return new Promise(function (resolve, reject) {
            var guid = createGuid()
            var message = {
                class: strclass,
                function: strFun,
                commandID: guid,
                param: param,
            }

            window.viewer.sendMessage(message);
            console.log("sendMessage", message);
            if (!window.gmapClass.has(strclass)) {
                window.gmapClass.set(strclass, new Map());
            }
            var classBack = window.gmapClass.get(strclass);
            classBack.set(guid, function (json) {
                if (callback != null) {
                    callback(json)
                }
                resolve(json);
            });
        });
    }
}
export { ExcuteUEFun as ExcuteUEFun }