import * as Matter from 'matter-js'
import { Vector, Object } from './object'
import { Map } from './map'
import { DOMEvent } from './events.ts'

import { default as colors } from './ressources/colors.json'

class Env {
	public canvas: HTMLCanvasElement
	public width: number = 0
	public height: number = 0
	public map: Map
	public engine: Matter.Engine  // Matter.js Engine
	public world: Matter.World  // Matter.js World
	public events: Array<DOMEvent> = []
	private tick: number = 0
	private scale: number = 1
	private timescale: number = 1
	public framerate: number = 60  // fps

	constructor(canvas: HTMLCanvasElement, map: Map, engine: Matter.Engine) {
		this.canvas = canvas
		this.map = map
		this.engine = engine
		this.world = this.engine.world
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

	changeTimeScale(timescale: number): void {
		this.timescale = timescale
		this.engine.timing.timeScale = this.timescale
	}

	update(): void {
		this.tick++
		Matter.Engine.update(this.engine, 1 / this.framerate)
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
