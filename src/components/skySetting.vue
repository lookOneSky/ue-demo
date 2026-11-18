<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { Weather } from "./lib/Scene/Weather.js";
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js";
import { DasPointsLayer } from "./lib/Layer/DasPointsLayer.js";
import { DasSelectTool } from "./lib/Tool/DasSelectTool.js";
import { Scene } from "./lib/Scene/Scene.js";
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js";


defineProps<{ msg: string }>()

const onMessage = inject('onMessage')

const form1 = ref({ guangzhao: false, shiqu: 37.5, sunangle: false, sunpower: false, wuzhishu: false, wuvolumn: false, wupower: 10 });

watch(() => form1.value.guangzhao, (newValue, oldValue) => {
    onMessage({ action: 'SetUseRealLight', data: newValue })
});

watch(() => form1.value.shiqu, async (newValue, oldValue) => {
    //Weather.SetTimeOfDay(newValue / 100 * 2400);
    //Weather.SetWeatherType("雪")
    //Weather.SetWeatherType("晴")
    //Weather.SetWeatherType("多云")
    //Weather.SetWeatherType("雾")
    //Weather.SetControlSnowOverlapIntensity(0)
    //Weather.SetControlSnowIntensity(1000)
    //Weather.SetControlFogIntensity(10)
    // Weather.SetWeatherType("雨")
    // Weather.SetControlRainIntensity("50000")
    //onMessage({ action: 'SetTimeOfDay', data: newValue / 100 * 2400 })
    //Weather.SetWeatherType("雷雨")
    //Weather.SetControlThunderIntensity(10)

    //let rootGroup = await DasGroupLayer.getRoot();
    //let pGroupNew = await DasGroupLayer.createInstance()
    ////rootGroup.addLayer(pGroupNew);
    //let nLayer = await rootGroup.numLayer();
    //console.log('nLayer', nLayer)
    //let layers = await rootGroup.getAllLayer()
    //await rootGroup.removeAllLayer()
    //console.log('layers', layers)
    if (!window.bcreatePoints) {
        //创建单个标牌
        // let param = {};
        // let points = [111.00466143314220, 32.400811258087423, 1585.1196362212040];
        // let allPoints = [];
        // allPoints.push(points);
        // param['points'] = allPoints;
        // param['texturePath'] = 'S:/Doc/图标/大屏版/taihegong.png';
        // let pointInfo = {};
        // pointInfo['pointSize'] = [92, 274];
        // param['pointInfo'] = pointInfo;

        // let wholeParam = {};
        // wholeParam['param'] = param;
        // DasPointsLayer.createInstance(wholeParam);

        //let params = [];
        //for (let i = 0; i < 10; i++) {
        //    let param = {};
        //    let points = [111.00466143314220, 32.400811258087423, 1585.1196362212040 + i * 10];
        //    let allPoints = [];
        //    allPoints.push(points);
        //    param['points'] = allPoints;
        //    param['texturePath'] = 'S:/Doc/图标/大屏版/taihegong.png';
        //    let pointInfo = {};
        //    pointInfo['pointSize'] = [92, 274];
        //    param['pointInfo'] = pointInfo;
        //    params.push(param);
        //}
//
        //let wholeParam = {};
        //wholeParam['params'] = params;
        //DasPointsLayer.batchCreateInstance(wholeParam);
//
        //window.bcreatePoints = true
    }



    //let posLLH = await Scene.screenToWorld(100, 100);
    //console.log('posLLH', posLLH)
    //let rootGroup = await DasGroupLayer.getRoot();
    //let nLayer = await rootGroup.numLayer();
    //console.log('nLayer', nLayer)
    //DasSelectTool.setToCurrent();
    //DasSelectTool.setSelectMode("Layer")
//
    //DasPointsTool.setToCurrent();
//
    //DasPointsTool.updateAll();
    let param = {};
    param['texturePath'] = 'S:/Doc/图标/大屏版/taihegong.png';
    param['pointSize'] = [92, 274];
    DasPointsTool.setToCurrent();
    DasPointsTool.updateAll(param);
    let info = await DasPointsTool.getAll();
    DasPointsLayer.createInstance({"param":info});
});

watch(() => form1.value.sunangle, (newValue, oldValue) => {
    //console.log('sunintensity', newValue / 100 * 360)
    //onMessage({ action: 'SetSunAngle', data: newValue / 100 * 360 })
    Weather.SetSunAngle(newValue / 100 * 360);
});

watch(() => form1.value.sunpower, (newValue, oldValue) => {
    Weather.SetSunIntensity(4 + newValue);
    //onMessage({ action: 'SetSunIntensity', data: 4 + newValue * 0.06 })
});

watch(() => form1.value.wuzhishu, (newValue, oldValue) => {
    onMessage({ action: 'SetExpHeightFog', data: newValue })
});

watch(() => form1.value.wuvolumn, (newValue, oldValue) => {
    onMessage({ action: 'SetVolumeFog', data: newValue })
});

// 时间格式设置
const setTimeLabel = (value) => {
    let rate = 60 * 24 / 2400;
    const hour = Math.floor(rate * value * 24 / 60);
    const minute = Math.floor(rate * value * 24 - hour * 60);
    return hour === 24 ? '23:59' : `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
}
</script>

<template>
    <div class="sky_container">
        <div class="title">
            天空设置
        </div>
        <div class="split_line">
        </div>
        <el-form ref="form" :model="form1" label-width="280px">
            <!-- <el-form-item label="真实时区光照">
                <el-switch v-model="form1.guangzhao" active-text="ON" inactive-text="OFF" style="margin-left: 55px;"
                    active-color="#E1BB82"></el-switch>
            </el-form-item> -->
            <el-form-item label="时间设置" class="sewen">
                <el-slider v-model="form1.shiqu" style="margin-left: -15px; margin-top: -20px;"
                    :format-tooltip="value => setTimeLabel(value)" :marks="{ 0: '0', 100: '24' }"></el-slider>
            </el-form-item>
            <el-form-item label="太阳角度" class="sun_angle">
                <el-slider v-model="form1.sunangle" style="margin-left: -15px; margin-top: -20px;"
                    :format-tooltip="value => parseFloat((value * 3.6).toFixed(1))"
                    :marks="{ 0: '0', 100: '360' }"></el-slider>
            </el-form-item>
            <el-form-item label="太阳强度" class="sun_power">
                <el-slider v-model="form1.sunpower" style="margin-left: -15px; margin-top: -20px;"
                    :format-tooltip="value => parseFloat((4 + value * 0.06).toFixed(1))"
                    :marks="{ 0: '4', 100: '10' }"></el-slider>
            </el-form-item>
            <!-- <el-form-item label="指数高度雾">
                <el-switch v-model="form1.wuzhishu" active-text="ON" inactive-text="OFF" style="margin-left: 55px;"
                    active-color="#E1BB82"></el-switch>
            </el-form-item>
            <el-form-item label="体积雾">
                <el-switch v-model="form1.wuvolumn" active-text="ON" inactive-text="OFF" style="margin-left: 55px;"
                    active-color="#E1BB82"></el-switch>
            </el-form-item> -->
            <!-- <el-form-item label="雾强度等级" class="wu_level">
                <el-slider v-model="form1.wupower" style="margin-left: -15px;  margin-top: -20px;"
                    :marks="{ 0: '0.5', 100: '1' }"></el-slider>
            </el-form-item> -->
        </el-form>
    </div>
</template>

<style lang="scss" scoped>
.sky_container {
    width: 440px;
    height: 520px;
    flex-shrink: 0;
    border-radius: 8px;
    border: 0.5px solid #E1BB82;
    background: #21201dcc;
    backdrop-filter: blur(4px);
    position: absolute;
    top: 62px;
    right: 119px;
    padding: 10px;
    z-index: 2;

    .title {
        align-self: stretch;
        color: #e1bb82;
        text-align: center;
        font-family: "Source Han Serif CN";
        font-size: 24px;
        font-style: normal;
        line-height: normal;
        letter-spacing: 9.6px;
        margin-top: 15px;
    }

    .split_line {
        background-image: url('/src/assets/images/hl.png');
        background-size: 100% 100%;
        height: 12px;
        width: 180px;
        margin: auto;
        margin-top: 15px;
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        justify-content: flex-start;
        color: #ffffff;
        font-family: "Source Han Sans CN";
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 40px;
        padding-left: 15px;

    }

    :deep(.el-form-item) {
        width: 410px;
        height: 40px;
        flex-shrink: 0;
        background: #e1bb820d;
        border-radius: 3px;
        margin-left: 15px;
    }

    :deep(.el-switch__core) {
        width: 64px;
        height: 28px;
        border-radius: 20px;
        background: #e1bb8233;
        border: 0.2px solid #E1BB82;
    }

    :deep(.el-switch__action) {
        width: 20px;
        height: 20px;
    }

    :deep(.el-switch.is-checked .el-switch__core .el-switch__action) {
        left: calc(100% - 21px);
    }

    :deep(.el-switch.is-checked .el-switch__core) {
        background: #E1BB82;
        border-color: #E1BB82;
        z-index: -1;
    }

    :deep(.el-switch__label--left) {
        left: 30px;
        position: absolute;
        z-index: -2;
        color: #e1bb82;
        display: none;
    }

    :deep(.el-switch__label--right) {
        margin-left: 10px;
        position: absolute;
        z-index: -1;
        color: #5f0d0b;
        display: none;
    }

    :deep(.is-active) {
        display: block;
    }

    :deep(.ruihua .el-form-item__label) {
        width: 280px;
    }

    :deep(.el-radio-button__inner) {
        background: none;
        color: #e1bb82;
        border: none;
    }

    :deep(.el-radio-group) {
        border: 0.2px solid #E1BB82;
        border-radius: 5px;
    }

    :deep(.el-radio-button:first-child .el-radio-button__inner) {
        border: none;
    }

    :deep(.el-radio-button.is-active .el-radio-button__original-radio:not(:disabled)+.el-radio-button__inner) {
        border-radius: 4px;
        background: #E1BB82;
        color: #5f0d0b;
        box-shadow: none;
    }


    :deep(.el-slider__button) {
        width: 30px;
        height: 18px;
        border: none;
        background: none;
        border-color: inherit;
        background-image: url('/src/assets/images/slider.png');
        background-size: 100% 100%;
    }

    :deep(.el-slider__bar) {
        height: 4px;
        background: #E1BB82;
    }

    :deep(.el-slider__runway) {
        height: 4px;
        background: #e1bb8233;
    }

    :deep(.el-slider__marks-text) {
        color: #e1bb82;
        font-family: "Source Han Sans CN";
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 12px;
    }

    :deep(.el-slider__marks-text:first-child) {
        margin-left: 5px;
    }

    :deep(.sewen .el-slider__marks-text:last-child) {
        margin-left: -15px;
    }

    :deep(.sun_angle .el-slider__marks-text:last-child) {
        margin-left: -12px;
    }

    :deep(.sun_power .el-slider__marks-text:last-child) {
        margin-left: -8px;
    }

    :deep(.wu_level .el-slider__marks-text:last-child) {
        margin-left: -3px;
    }


    :deep(.el-slider__stop) {
        background: none;
    }
}
</style>
