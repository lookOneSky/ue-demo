<script setup lang="ts">
import { ref, watch } from 'vue'
import { Weather } from './lib/Scene/Weather.js'
import { useMessageSender } from '../utils/useMessageSender'

defineProps<{ msg?: string }>()

const onMessage = useMessageSender()
const form1 = ref({ guangzhao: false, shiqu: 37.5, sunangle: 0, sunpower: 0, wuzhishu: false, wuvolumn: false, wupower: 10 })

function setTimeLabel(value: number) {
    const minutes = Math.min(Math.floor(value / 100 * 1440), 1439)
    return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0')
}

watch(() => form1.value.shiqu, value => Weather.SetTimeOfDay(setTimeLabel(value)))
watch(() => form1.value.sunangle, value => Weather.SetSunAngle(value * 3.6))
watch(() => form1.value.sunpower, value => Weather.SetSunIntensity(4 + value * 0.06))
watch(() => form1.value.guangzhao, value => onMessage({ action: 'SetUseRealLight', data: value }))
watch(() => form1.value.wuzhishu, value => onMessage({ action: 'SetExpHeightFog', data: value }))
watch(() => form1.value.wuvolumn, value => onMessage({ action: 'SetVolumeFog', data: value }))
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
                    :format-tooltip="setTimeLabel" :marks="{ 0: '0', 100: '24' }"></el-slider>
            </el-form-item>
            <el-form-item label="太阳角度" class="sun_angle">
                <el-slider v-model="form1.sunangle" style="margin-left: -15px; margin-top: -20px;"
                    :format-tooltip="(value: number) => parseFloat((value * 3.6).toFixed(1))"
                    :marks="{ 0: '0', 100: '360' }"></el-slider>
            </el-form-item>
            <el-form-item label="太阳强度" class="sun_power">
                <el-slider v-model="form1.sunpower" style="margin-left: -15px; margin-top: -20px;"
                    :format-tooltip="(value: number) => parseFloat((4 + value * 0.06).toFixed(1))"
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
