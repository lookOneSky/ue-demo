<script setup lang="ts">
import { inject, onBeforeUnmount, ref, watch } from 'vue'
import { useMessageSender } from '../utils/useMessageSender'
import StepCon from './step.vue'

defineProps<{ msg?: string }>()

type CameraMode = 'free' | 'tourist' | 'fly'
interface CameraState {
    viewerReady: boolean
    sequenceKeys: string[]
    presetViewKeys: string[]
}
const curCamera = ref<CameraMode>('free')
const showStepCon = ref(false)
const onMessage = useMessageSender()
const getShareData = inject<<K extends keyof CameraState>(key: K) => CameraState[K] | undefined>('getShareData')!
const sequenceKeys = () => getShareData('sequenceKeys') || []
const presetViewKeys = () => getShareData('presetViewKeys') || []
let counter = 0
let panelTimer: number | undefined
let viewTimer: number | undefined

watch(() => getShareData('viewerReady'), ready => {
    if (ready) {
        onMessage({ action: 'GetSequenceKeys', data: 0 })
        onMessage({ action: 'GetPresetViewKeys', data: 0 })
    }
}, { immediate: true })

function clearTimers() {
    window.clearTimeout(panelTimer)
    window.clearTimeout(viewTimer)
}
onBeforeUnmount(clearTimers)

function changeCamera(mode: CameraMode) {
    clearTimers()
    onMessage({ action: 'RemoteSetVisibility', data: mode === 'fly' })
    if (mode === 'fly') {
        onMessage({ action: 'CameraHide', data: true })
        panelTimer = window.setTimeout(() => { showStepCon.value = true }, 500)
    } else {
        showStepCon.value = false
        onMessage({ action: 'SwitchCamera', data: mode === 'free' ? -1 : 1 })
    }
}
watch(curCamera, changeCamera, { flush: 'sync' })

function setFlyCamera() {
    if (curCamera.value === 'fly') changeCamera('fly')
    else curCamera.value = 'fly'

    const presets = Array.from(new Set(presetViewKeys()))
    const sequences = Array.from(new Set(sequenceKeys()))
    const count = presets.length + sequences.length
    if (!count) return
    counter %= count
    viewTimer = window.setTimeout(() => {
        if (counter < presets.length) onMessage({ action: 'SetPresetView', data: presets[counter] })
        else onMessage({ action: 'PlaySequence', data: sequences[counter - presets.length] })
        counter++
    }, 1000)
}
</script>

<template>
    <div class="camera_setting" :class="{ 'move-up': curCamera === 'fly' }">
        <div class="free" :class="curCamera == 'free' ? 'free_sel' : ''" @click="curCamera = 'free'">

        </div>
        <div class="fly" :class="curCamera == 'fly' ? 'fly_sel' : ''" @click="setFlyCamera()">

        </div>
        <div class="tourist" :class="curCamera == 'tourist' ? 'tourist_sel' : ''" @click="curCamera = 'tourist'">

        </div>
        <div class="pointer"
            :style="curCamera == 'free' ? 'transform:rotate(0deg)' : (curCamera == 'fly' ? 'transform:rotate(-82deg)' : 'transform:rotate(95deg)')">

        </div>
        <div class="text">
            视角切换
        </div>
    </div>
    <Transition name="fade">
        <StepCon v-if="showStepCon"></StepCon>
    </Transition>
</template>

<style scoped>
.camera_setting {
    transition: transform 0.5s ease;
    /* Animation for moving up */
    position: absolute;
    width: 250px;
    height: 130px;
    bottom: 45px;
    right: 40px;
    z-index: 1;

		.free {
			cursor: pointer;
			position: absolute;
			left: 0px;
			top: 10px;
			width: 78px;
			height: 99px;
			background: url(/src/assets/images/freeCamera.png);
			background-size: 100% 100%;
		}

		.free_sel {
			background: url(/src/assets/images/freeCamera_active.png);
			background-size: 100% 100%;
		}

		.fly {
			cursor: pointer;
			position: absolute;
			left: 35px;
			bottom: -7px;
			width: 85px;
			height: 64px;
			background: url(/src/assets/images/flyCamera.png);
			background-size: 100% 100%;
		}

		.fly_sel {
			background: url(/src/assets/images/flyCamera_active.png);
			background-size: 100% 100%;
		}

		.tourist {
			cursor: pointer;
			position: absolute;
			left: 35px;
			top: -17px;
			width: 85px;
			height: 64px;
			background: url(/src/assets/images/touristCamera.png);
			background-size: 100% 100%;
		}

		.tourist_sel {
			background: url(/src/assets/images/touristCamera_active.png);
			background-size: 100% 100%;
		}

		.pointer {
			position: absolute;
			left: 50px;
			top: 33px;
			width: 55px;
			height: 55px;
			background: url(/src/assets/images/cursor.png);
			background-size: 100% 100%;
		}

    .pointer {
        position: absolute;
        left: 50px;
        top: 33px;
        width: 55px;
        height: 55px;
        background: url(/src/assets/images/cursor.png);
        background-size: 100% 100%;
    }

    .text {
        position: absolute;
        left: 110px;
        top: 47px;
        color: #f0dca9;
        font-family: "Source Han Serif CN";
        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        line-height: 28.8px;
    }
}

.move-up {
    transform: translateY(-130px);
    /* Adjust the value as needed */
}

.move-down {
    transform: translateY(130px);
    /* Adjust the value as needed */
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
    {
    opacity: 0;
}
</style>
