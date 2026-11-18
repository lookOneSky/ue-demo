<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import StepCon from './step.vue'
defineProps<{ msg: string }>()

const curCamera = ref("free")

const onMessage = inject("onMessage")
const subShareData = inject("subShareData")
const getShareData = inject("getShareData")

const showStepCon = ref(false)

subShareData("viewerReady", (key, value) => {
	if (value) {
		onMessage({ action: "GetSequenceKeys", data: 0 })
		onMessage({ action: "GetPresetViewKeys", data: 0 })
	}
})

const sequenceKeys = ref(new Set())

subShareData("sequenceKeys", (key, value) => {
	if (value) {
		sequenceKeys.value = new Set(value)
	}
})

const presetViewKeys = ref(new Set())
subShareData("presetViewKeys", (key, value) => {
	if (value) {
		presetViewKeys.value = new Set(value)
	}
})

let counter = 0

const changeCamera = (camera) => {
	if (camera == "free") {
		onMessage({ action: "RemoteSetVisibility", data: false })
		onMessage({ action: "SwitchCamera", data: -1 })
		if (showStepCon.value) {
			showStepCon.value = false;
			const cameraSetting = document.querySelector('.camera_setting');
			if (cameraSetting) {
				cameraSetting.classList.remove('move-up');
			}
		}
	} else if (camera == "tourist") {
		onMessage({ action: "RemoteSetVisibility", data: false })
		onMessage({ action: "SwitchCamera", data: 1 })
		if (showStepCon.value) {
			showStepCon.value = false;
			const cameraSetting = document.querySelector('.camera_setting');
			if (cameraSetting) {
				cameraSetting.classList.remove('move-up');
			}
		}
	} else if (camera == "fly") {
		const cameraSetting = document.querySelector('.camera_setting');
		if (cameraSetting) {
			cameraSetting.classList.add('move-up');
			setTimeout(() => {
				showStepCon.value = true; // Show StepCon
			}, 500); 
		}
		onMessage({ action: "RemoteSetVisibility", data: true })
		onMessage({ action: "CameraHide", data: true})

		// if (sequenceKeys.value.size > 0) {
		// 	const sequenceKeysArray = Array.from(sequenceKeys.value)
		// 	onMessage({ action: 'PlaySequence', data: sequenceKeysArray[0] })
		// }
		
	}
}

watch(
	() => curCamera.value,
	(newValue, oldValue) => {
		switch (newValue) {
			case "free":
				changeCamera("free")
				break
			case "fly":
				changeCamera("fly")
				break
			case "tourist":
				changeCamera("tourist")
				break
			default:
				break
		}
	}
)

const setFlyCamera = () => {
	if (curCamera.value === 'fly') {
		changeCamera('fly')
	} else {
		curCamera.value = 'fly'
	}


	if (sequenceKeys.value.size > 0 || presetViewKeys.value.size > 0) {
			const sequenceKeysArray = Array.from(sequenceKeys.value)
			const presetViewKeysArray = Array.from(presetViewKeys.value)
			if (
				counter >=
				sequenceKeysArray.length + presetViewKeysArray.length
			) {
				counter = 0
			}

			setTimeout(() => {
				if (counter < presetViewKeysArray.length) {
					onMessage({
						action: "SetPresetView",
						data: presetViewKeysArray[counter],
					})
				} else {
					onMessage({
						action: "PlaySequence",
						data: sequenceKeysArray[
							counter - sequenceKeysArray.length
						],
					})
				}
				counter = counter + 1
			}, 1000)
		}
};
</script>

<template>
    <div class="camera_setting">
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
			background: url(/src/assets/images/freeCamera_over.png);
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
			background: url(/src/assets/images/flyCamera_over.png);
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
			background: url(/src/assets/images/touristCamera_over.png);
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
