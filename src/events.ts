class DOMEvent {
	event: string
	callback: (e?: any) => any

	constructor(event: string, callback: (e?: any) => any) {
		this.event = event
		this.callback = callback
		window.addEventListener(this.event, this.callback as any)
	}
}

class Cooldown {
	delay: number // ms
	callback: () => any

	constructor(delay: number, callback: () => any) {
		this.delay = delay
		this.callback = callback
		window.setTimeout(this.callback, this.delay)
	}
}

export { DOMEvent, Cooldown }
