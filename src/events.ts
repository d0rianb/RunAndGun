class DOMEvent {
	event: string
	callback: (e?: any) => any

	constructor(event: string, callback: (e?: any) => any) {
		this.event = event
		this.callback = callback
		window.addEventListener(this.event, this.callback as any)
	}
}

export { DOMEvent }
