import {
	Config,
	EventEmitter,
	Flags,
	NumericParameters,
	OptionParameters,
	TextParameters,
	PixelStreaming,
} from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.3"
import {
	Application,
	PixelStreamingApplicationStyle,
	UIElementCreationMode,
} from "@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.3"

//wyc封装的接口
class Viewer extends EventEmitter {
	constructor({
		InputControllers = [],
		onInitialize = () => {},
		useUrlParams = true,
		hideDefaultUI = false,
		signalServer = '',
		matchViewResolution = false,
	}) {
		super()

		const PixelStreamingApplicationStyles =
			new PixelStreamingApplicationStyle()
		PixelStreamingApplicationStyles.applyStyleSheet()

		const config = new Config({
			useUrlParams: useUrlParams,
		})
		const urlParams = new URLSearchParams(window.location.search)
		if (!useUrlParams || !urlParams.has(NumericParameters.MaxReconnectAttempts)) {
			// 默认每 1 秒重试一次，共等待约 5 分钟
			config.setNumericSetting(NumericParameters.MaxReconnectAttempts, 300)
		}
		if (!useUrlParams || !urlParams.has(NumericParameters.StreamerAutoJoinInterval)) {
			config.setNumericSetting(NumericParameters.StreamerAutoJoinInterval, 1000)
		}

		if (!useUrlParams) {
			config.setTextSetting(TextParameters.SignallingServerUrl, signalServer)
			config.setOptionSettingValue(OptionParameters.StreamerId, "DefaultStreamer")
		}
		
		config.setFlagEnabled(Flags.MatchViewportResolution, matchViewResolution)

		config.setFlagEnabled(Flags.AutoConnect, true)

		config.setFlagEnabled(Flags.FakeMouseWithTouches, true)

		config.setFlagEnabled(Flags.HoveringMouseMode, true)
		config.setFlagEnabled(Flags.SuppressBrowserKeys, false)
		config.setFlagEnabled(Flags.KeyboardInput, true)

		// 匹配视口分辨率
		//config.setFlagEnabled(Flags.MatchViewportResolution, true);
		

		const stream = new PixelStreaming(config)

		const settingsPanelConfig = hideDefaultUI
			? {
					visibilityButtonConfig: {
						creationMode: UIElementCreationMode.Disable,
					},
			  }
			: {
					isEnabled: true,
					visibilityButtonConfig: {
						creationMode:
							UIElementCreationMode.CreateDefaultElement,
					},
			  }

		const application = new Application({
			stream,
			onColorModeChanged: (isLightMode) =>
				PixelStreamingApplicationStyles.setColorMode(isLightMode),
			settingsPanelConfig: settingsPanelConfig,
			statsPanelConfig: {
				visibilityButtonConfig: {
					creationMode: UIElementCreationMode.Disable,
				},
			},
			fullScreenControlsConfig: {
				visibilityButtonConfig: {
					creationMode: UIElementCreationMode.Disable,
				},
			},
			videoQpIndicatorConfig: {
				disableIndicator: true
			}
		})

		this.stream = stream
		this.application = application
		this.responseCallbackMap = new Map()

		this.toStreamerMessagesProvider = null;

		//
		stream.addResponseEventListener("handle_responses", (response) => {
			let message = response

			try {
				message = JSON.parse(response)
			} catch (error) {
				message = response
			}

			for (const callback of this.getOrCreateResponseCallbackSet(
				message.EventName
			)) {
				callback(message)
			}
		})

		//stream.addEventListener("videoInitialized", () => {
		//	stream.injectInputControllers([
		//		(params) => {
		//			this.toStreamerMessagesProvider = params[0]
		//			// 初始化完成时调用回调
		//			setTimeout(() => {
		//				onInitialize({})
		//			}, 100)
		//		},
		//		...InputControllers.map((InputController) => {
		//			return (params) => {
		//				return new InputController(params, this.rootElement)
		//			}
		//		}),
		//	])
		//})
	}

	get rootElement() {
		return this.application.rootElement
	}

	getStreamHandler(handlerName = "") {
		return this.stream.toStreamerHandlers.get(handlerName)
	}

	getOrCreateResponseCallbackSet(key) {
		if (!this.responseCallbackMap.has(key)) {
			this.responseCallbackMap.set(key, new Set())
		}
		return this.responseCallbackMap.get(key)
	}

	addResponseEventListener(eventName, callback) {
		const eventSet = this.getOrCreateResponseCallbackSet(eventName)
		eventSet.add(callback)

		return () => {
			eventSet.delete(callback)
		}
	}

	waitResponseOnce(eventName, callback) {
		let canceler = this.addResponseEventListener(eventName, (params) => {
			callback(params)
			canceler()
			canceler = null
		})
	}

	waitResponseUntil(eventName, boolExpression) {
		let canceler = this.addResponseEventListener(eventName, (params) => {
			if (boolExpression(params)) {
				canceler()
				canceler = null
			}
		})
	}

	sendMessage(message) {
		this.stream.emitUIInteraction(message)
	}

	onResponse(callback) {
		this.stream.addResponseEventListener("handle_responses", callback)
	}

	addResponseEventListener(strKye, callback)
	{
		this.stream.addResponseEventListener(strKye, callback)
	}

	removeResponseEventListener(strKye)
	{
		this.stream.removeResponseEventListener(strKye)
	}

	dispose() {
		if (this.rootElement && this.rootElement.parentNode) {
			this.rootElement.parentNode.removeChild(this.rootElement)
		}
		this.stream.disconnect()
	}

	setResolution(width, height) {
		this.stream.emitCommand({
			Resolution: { Width: width, Height: height },
		})
	}
}

export default Viewer
