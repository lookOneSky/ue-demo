<script setup lang="ts">
import { ref, onMounted, inject } from "vue"
import { dataConfig } from "./data/dataConfig"
import Viewer from "./lib/Viewer.js"
import EmbedViewer from "./lib/EmbedViewer.js"
import { Camera } from "./lib/Scene/Camera.js"
import DasElectron from "./lib/Scene/DasElectron.js"


// 类型声明
declare global {
	interface Window {
		viewer: any;
	}
}

const sceneContainer = ref<HTMLElement>()
const viewerPopupContainer = ref<HTMLElement>()
let viewer: any = null;

const getSignalServerUrl = () => {
	//return "ws://10.100.5.72:6543"
	return "ws://127.0.0.1:6543"
	//return "ws://10.100.2.28:6543"

	const configuredUrl = import.meta.env.VITE_SIGNAL_SERVER_URL?.trim()
	if (configuredUrl) return configuredUrl

	const protocol = window.location.protocol === "https:" ? "wss" : "ws"
	return `${protocol}://${window.location.hostname}:6543`
}

// 设置共享数据
const setShareData: any = inject("setShareData")

// 将viewer挂载到左下角弹窗
const appendViewerToPopup = (viewerInstance: any) => {
	if (viewerPopupContainer.value && viewerInstance?.rootElement) {
		viewerPopupContainer.value.appendChild(viewerInstance.rootElement)
	}
}

// 初始化viewer
const initViewer = () => {
	// 创建Viewer实例
	viewer = new Viewer({
		InputControllers: [],
		onInitialize: () => {
			console.log('Viewer initialized')
			if (setShareData) {
				setShareData("viewerReady", true)
			}

			window.viewer.addResponseEventListener("1111", (x) => {
				console.log("1111", x)
			})

			// 测试连通性：获取相机信息
			Camera.getCameraFlyInfoLLH().then((info: any) => {
				console.log('Camera连通性测试成功，相机信息:', info)
			}).catch((err: any) => {
				console.error('Camera连通性测试失败:', err)
			})

		},
		useUrlParams: false,
		hideDefaultUI: true,
		signalServer: getSignalServerUrl(),
	})

	if (sceneContainer.value) {
		sceneContainer.value.appendChild(viewer.rootElement)
	}

	//appendViewerToPopup(viewer)

	// 将viewer添加到全局window对象以便调试
	window.viewer = viewer
	DasElectron.initListener()
}

// 发送消息到UE
const sendMessageToUE = (message: any) => {
	if (viewer) {
		viewer.sendMessage(message)
	}
}

const initEmbedViewer = () => {
	let viewer = new EmbedViewer();
	window.viewer = viewer
	
}

// 组件挂载时初始化
onMounted(() => {
	//initEmbedViewer()
	initViewer();
})

// 注册事件处理器
const addSceneHandler: any = inject("addHandler")
if (addSceneHandler) {
	addSceneHandler(({ action, data }: { action: string, data: any }) => {
		console.log('Scene action:', action, data)
		
		// 直接发送命令到UE
		try {
			const message = {
				EventName: action,
				Params: typeof data === 'object' ? JSON.stringify(data) : data
			}
			sendMessageToUE(message)
		} catch (error) {
			console.error('发送消息到UE失败:', error)
		}
	})
}
</script>

<template>
	<div id="player" class="scene-container" ref="sceneContainer">
		<div class="viewer-popup">
			<div class="viewer-popup-body" ref="viewerPopupContainer"></div>
		</div>
	</div>
</template>

<style scoped>
.scene-container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: 1;
	background-color: transparent;
}

.viewer-popup {
	position: absolute;
	left: 16px;
	bottom: 16px;
	width: 25%;
	height: 25%;
	z-index: 10;
	overflow: hidden;
	background-color: #000;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
}

.viewer-popup-body {
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.viewer-popup-body :deep(> *) {
	width: 100%;
	height: 100%;
}
</style>
