import { ExcuteUEFun } from "../ExcuteUEFun.js";

class Weather {
    static className = "Weather";

    /**
     * 设置一天中的时间
     * @param {string} timeOfDay - 时间字符串，格式为"8:30"，24小时制，范围: 0:00 - 23:59
     * @param {function} callback
     */
    static async SetTimeOfDay(timeOfDay) {
        let param = { timeOfDay: timeOfDay };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetTimeOfDay", param)
    }

    /**
     * 设置太阳角度
     * @param {number} angle - 角度，范围: 0-360
     * @param {function} callback
     */
    static async SetSunAngle(angle) {
        let param = { angle: angle };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetSunAngle", param)
    }

    /**
     * 设置太阳强度
     * @param {number} intensity - 强度，范围: 0-无穷大
     * @param {function} callback
     */
    static async SetSunIntensity(intensity) {
        let param = { intensity: intensity };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetSunIntensity", param)
    }

    /**
     * 设置天气类型
     * @param {string} weatherType - 天气类型，中文字符串，可选："晴"、"雨"
     * @param {function} callback
     */
    static async SetWeatherType(weatherType) {
        let param = { weatherType: weatherType };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetWeatherType", param)
    }

    /**
     * 设置风向
     * @param {number} direction - 角度，范围: 0-360
     * @param {function} callback
     */
    static async SetWindDirection(direction) {
        let param = { direction: direction };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetWindDirection", param)
    }

    /**
     * 设置风强度
     * @param {number} intensity - 强度，范围: 0-5
     * @param {function} callback
     */
    static async SetWindIntensity(intensity) {
        let param = { intensity: intensity };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetWindIntensity", param)
    }

    /**
     * 设置云层强度
     * @param {number} intensity - 强度，范围: 0-10
     * @param {function} callback
     */
    static async SetControlCloudIntensity(intensity) {
        let param = { intensity: intensity };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetControlCloudIntensity", param)
    }

    /**
     * 设置雨强度
     * @param {number} intensity - 强度，范围: 1000-50000 //2000
     * @param {function} callback
     */
    static async SetControlRainIntensity(intensity) {
        let param = { intensity: intensity };
        ExcuteUEFun.excuteUEFunction(Weather.className, "SetControlRainIntensity", param)
    }

    /**
     * 设置雪强度
     * @param {number} intensity - 强度,参数范围: 1000-50000（浮点数） //2000
     * @param {function} callback
     * 
     */
    static async SetControlSnowIntensity(intensity) {
        let param = { intensity: intensity };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetControlSnowIntensity", param)
    }

    /**
     * 设置雾强度
     * @param {number} intensity - 强度，范围: 0-10
     * @param {function} callback
     */
    static async SetControlFogIntensity(intensity) {
        let param = { intensity: intensity };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetControlFogIntensity", param)
    }

    /**
     * 设置雷暴强度
     * @param {number} intensity - 强度，范围: 0-20
     * @param {function} callback
     */
    static async SetControlThunderIntensity(intensity) {
        let param = { intensity: intensity };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetControlThunderIntensity", param)
    }

    /**
     * 设置雪覆盖强度
     * @param {number} intensity - 强度，范围: 0-1
     * @param {function} callback
     */
    static async SetControlSnowOverlapIntensity(intensity) {
        let param = { intensity: intensity };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetControlSnowOverlapIntensity", param)
    }

    /**
     * 设置季节
     * @param {number} season - 季节类型: 0-春天, 1-夏天, 2-秋天, 3-冬天
     * @param {function} callback
     */
    static async SetSeason(season) {
        let param = { season: season };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetSeason", param)
    }

    /**
     * 设置月亮大小
     * @param {number} scale - 月亮大小比例，范围: 0-10
     * @param {function} callback
     */
    static async SetMoonSacle(scale) {
        let param = { moonScale: scale };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetMoonSacle", param)
    }

    /**
     * 设置月光颜色
     * @param {Object} color - 颜色对象 {r: 1.0, g: 1.0, b: 1.0, a: 1.0}，范围: 0-1
     * @param {function} callback
     */
    static async SetMoonLightColor(color) {
        let param = { moonColor: color };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetMoonLightColor", param)
    }

    /**
     * 设置月光强度
     * @param {number} intensity - 月光强度，范围: 0-10
     * @param {function} callback
     */
    static async SetMoonLightIntensity(intensity) {
        let param = { moonIntensity: intensity };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetMoonLightIntensity", param)
    }

    /**
     * 设置星星强度
     * @param {number} intensity - 星星亮度强度，范围: 0-10
     * @param {function} callback
     */
    static async SetStarIntensity(intensity) {
        let param = { starIntensity: intensity };
        await ExcuteUEFun.excuteUEFunction(Weather.className, "SetStarIntensity", param)
    }

}
export { Weather }