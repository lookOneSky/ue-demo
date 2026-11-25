class EmbedViewer {
	constructor() {
		this.responseCallbackMap = new Map()
	}

	get rootElement() {
		return this.application.rootElement
	}

	sendMessage(message, chunkSize = 100000) {
		const bridge = window.ue?.daswebbridge
		if (!bridge) return false
		if (!Number.isInteger(chunkSize) || chunkSize <= 0) throw new RangeError("chunkSize 必须为正整数")
		const jsonStr = JSON.stringify(message)
		const send = (str) => bridge.onmessage(str)

		if (jsonStr.length <= chunkSize) {
			send(jsonStr)
			return true
		}

		const chunks = []
		for (let i = 0; i < jsonStr.length; i += chunkSize) {
			chunks.push(jsonStr.slice(i, i + chunkSize))
		}

		send('BEGIN' + chunks[0])
		for (let i = 1; i < chunks.length - 1; i++) {
			send(chunks[i])
		}
		send(chunks[chunks.length - 1] + 'END')
		return true
	}

	onMessage(message) {
		//alert(message)
		for (let [key, value] of this.responseCallbackMap) {
			if (typeof value === 'function') {
				value(message)
			}
		}
	}

	addResponseEventListener(strKye, callback)
	{
		this.responseCallbackMap.set(strKye, callback)
	}

	removeResponseEventListener(strKye)
	{
		this.responseCallbackMap.delete(strKye)
	}

	
	setResolution(width, height) {
		sendCommand({
			Resolution: { Width: width, Height: height },
		})
	}
}

export default EmbedViewer
