import { World } from 'matter-js'
import { Vector, Object } from './object'
import { Map } from './map'
import { DOMEvent } from './events.ts'

import { default as colors } from './ressources/colors.json'

class Env {
	public canvas: HTMLCanvasElement
	public width: number = 0
	public height: number = 0
	public map: Map
	public world: Matter.World // Matter.js World
	public events: Array<DOMEvent> = []
	private tick: number = 0
	private scale: number = 1
	private timescale: number = 1

	constructor(canvas: HTMLCanvasElement, map: Map) {
		this.canvas = canvas
		this.map = map
		this.events.push(new DOMEvent('resize', () => this.initSize()))
		this.initSize()
	}

	getWindowDimensions(): any[] {
		const html: any = document.scrollingElement
		return [html.clientWidth, html.clientHeight]
	}

	initSize(): void {
		[this.width, this.height] = this.getWindowDimensions();
		[this.canvas.width, this.canvas.height] = [this.width, this.height];
		this.canvas.style.backgroundColor = colors.canvasBackground
		document.querySelector('main').appendChild(this.canvas)
	}


	update(): void {
		this.tick++
		this.render()
		requestAnimationFrame(() => this.update())
	}

	render(): void {
		if (this.tick % 20 == 0) {
			// console.log(this.canvas.width, this.canvas.height)
		}
	}
}

export { Env }
