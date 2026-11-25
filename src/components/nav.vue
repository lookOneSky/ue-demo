<script setup lang="ts">
import { ref } from 'vue'
import SysSetting from './sysSetting.vue'
import SkySetting from './skySetting.vue'
import WeatherSetting from './weatherSetting.vue'
import SeasonSetting from './seasonSetting.vue'
import Camera from './camera.vue'
import Effect from './effect.vue'
defineProps<{ msg?: string }>()

const showSysSetting = ref(false)
const toggleSysSetting = () => {
    showSysSetting.value = !showSysSetting.value
    showSkySetting.value = false
    showWeatherSetting.value = false
    showSeasonSetting.value = false
    showEffect.value = false
}

const showSkySetting = ref(false)
const toggleSkySetting = () => {
    showSkySetting.value = !showSkySetting.value
    showSysSetting.value = false
    showWeatherSetting.value = false
    showSeasonSetting.value = false
    showEffect.value = false
}

const showWeatherSetting = ref(false)
const toggleWeatherSetting = () => {
    showWeatherSetting.value = !showWeatherSetting.value
    showSysSetting.value = false
    showSkySetting.value = false
    showSeasonSetting.value = false
    showEffect.value = false
}

const showSeasonSetting = ref(false)
const toggleSeasonSetting = () => {
    showSeasonSetting.value = !showSeasonSetting.value
    showSysSetting.value = false
    showSkySetting.value = false
    showWeatherSetting.value = false
    showEffect.value = false
}

const showEffect = ref(false)
const toggleEffect = () => {
    showEffect.value = !showEffect.value
    showSysSetting.value = false
    showSkySetting.value = false
    showWeatherSetting.value = false
    showSeasonSetting.value = false
}
</script>

<template>
    <div class="set_btn" title="系统设置" @click="toggleSysSetting">
    </div>
    <div>
        <ul>
            <li>
                <div class="sky_btn" title="天空设置" @click="toggleSkySetting">
                </div>
            </li>
            <li>
                <div class="weather_btn" title="天气设置" @click="toggleWeatherSetting">
                </div>
            </li>
            <li>
                <div class="season_btn" title="季节设置" @click="toggleSeasonSetting">
                </div>
            </li>
            <li>
                <div class="texiao_btn" title="空间特效" @click="toggleEffect">
                </div>
            </li>
        </ul>
    </div>
    <SysSetting v-show="showSysSetting" />
    <SkySetting v-show="showSkySetting" />
    <WeatherSetting v-show="showWeatherSetting" />
    <SeasonSetting v-show="showSeasonSetting" />
    <Camera />
    <Effect v-show="showEffect" />
</template>

<style scoped>
.fade-in-out {
    transition: opacity 1s ease-in-out;
}

.set_btn {
    width: 36px;
    height: 36px;
    position: absolute;
    top: 62px;
    right: 45px;
    background-image: url('/src/assets/images/sysSetting.png');
    background-size: 100% 100%;
    cursor: pointer;
}

ul {
    position: absolute;
    list-style-type: none;
    top: 105px;
    right: 40px;

    div {
        width: 46px;
        height: 152px;
        cursor: pointer;
        background-size: 100% 100%;
    }

    .sky_btn {
        background-image: url('/src/assets/images/skySetting.png');
    }

    .weather_btn {
        background-image: url('/src/assets/images/weatherSetting.png');
    }

    .season_btn {
        background-image: url('/src/assets/images/season.png');
    }

    .texiao_btn {
        background-image: url('/src/assets/images/kongjian.png');
    }
}
</style>
