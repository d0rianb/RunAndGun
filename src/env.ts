import * as Matter from 'matter-js'
import { Vector, SolidObject } from './object'
import { Player } from './player'
import { Map } from './map'
import { DOMEvent } from './events'
import { Renderer, RenderObject } from './render'
import { default as colors } from '../ressources/config/colors.json'

class Env {
	public canvas: HTMLCanvasElement
	public ctx: CanvasRenderingContext2D
	public width: number = 0 // px
	public height: number = 0 // px
	public gridWidth: number // grid unit
	public gridHeight: number // grid unit
	public oldRelToAbs: Vector
	public relToAbs: Vector
	public map: Map
	public engine: Matter.Engine
	public engineRunner: Matter.Runner
	public world: Matter.World
	public events: Array<DOMEvent> = []
	public cursorPosition: Vector
	private tick: number = 0
	private scale: number = 1
	private timescale: number = 1
	public framerate: number = 60  // fps
	public objects: SolidObject[]
	public players: Player[]
	private renderingStack: RenderObject[]

	constructor(canvas: HTMLCanvasElement, map: Map) {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.map = map
		this.gridWidth = map.grid.width
		this.gridHeight = map.grid.height

		this.engine = Matter.Engine.create({ enableSleeping: true })
		this.engineRunner = Matter.Runner.create({})
		this.world = this.engine.world
		this.world.gravity.scale = 0.0019
		this.players = []
		this.objects = []
		this.renderingStack = []
		this.cursorPosition = new Vector(0, 0)
		this.events.push(new DOMEvent('resize', () => this.resize()))
		this.events.push(new DOMEvent('mousemove', e => this.updateCursorPosition(e)))
		this.sizeCanvas()
		this.relToAbs = {
			x: this.width / this.gridWidth,
			y: this.height / this.gridHeight
		}
		this.oldRelToAbs = new Vector(0, 0)
		Object.assign(this.oldRelToAbs, this.relToAbs)
		this.init()
	}

	getWindowDimensions(): any[] {
		const html: any = document.scrollingElement
		return [html.clientWidth, html.clientHeight]
	}

	sizeCanvas(): void {
		const dpr: number = window.devicePixelRatio || 1;
		[this.width, this.height] = this.getWindowDimensions();
		[this.canvas.width, this.canvas.height] = [this.width * dpr, this.height * dpr];
		[this.canvas.style.width, this.canvas.style.height] = [this.width + 'px', this.height + 'px'];
		this.canvas.style.backgroundColor = colors.canvasBackground
		document.querySelector('main').appendChild(this.canvas)
		this.ctx.scale(dpr, dpr)
	}

	resize(): void {
		this.sizeCanvas()
		this.relToAbs = {
			x: this.width / this.gridWidth,
			y: this.height / this.gridHeight
		}
		for (let obj of this.objects) {
			obj.resize()
		}
		for (let player of this.players) {
			player.resize()
		}
		Object.assign(this.oldRelToAbs, this.relToAbs)
	}

	init(): void {
		this.objects = []
		Matter.World.clear(this.world, false)
		for (let objString of this.map.objects) {
			let objArray: Array<string> = objString.split(' ')
			let isStatic: boolean = objArray.length > 5
			let solidObj: SolidObject = new SolidObject(
				objArray[0],
				parseInt(objArray[1]),
				parseInt(objArray[2]),
				parseInt(objArray[3]),
				parseInt(objArray[4]),
				isStatic,
				this,
				<Matter.IBodyDefinition>{
					label: 'Wall',
					friction: 0.5,
					frictionStatic: 0.2
				})
		}
	}

	changeTimeScale(timescale: number): void {
		this.timescale = timescale
		this.engine.timing.timeScale = this.timescale
	}

	updateCursorPosition(evt: any) {
		const rect = this.canvas.getBoundingClientRect()
		this.cursorPosition = new Vector(
			evt.clientX - rect.left,
			evt.clientY - rect.top
		)
	}

	addToRenderingStack(object: RenderObject): void {
		this.renderingStack.push(object)
	}

	update(): void {
		// Matter.Engine.update(this.engine, 1 / this.framerate)
		Matter.Runner.tick(this.engineRunner, this.engine, 1 / this.framerate)
		this.objects.forEach(obj => obj.update())
		this.players.forEach(player => player.update())
		this.render()
		this.tick++
		requestAnimationFrame(() => this.update())
	}

	render(): void {
		this.renderingStack = []

		// Map render
		this.objects.forEach(obj => {
			let renderObj: RenderObject | boolean = obj.toRender()
			if (renderObj) {
				this.addToRenderingStack(<RenderObject>renderObj)
			}
		})

		// Player render
		this.players.forEach(player => {
			let renderObj: RenderObject[] = player.toRender()
			if (renderObj) {
				renderObj.forEach(obj => {
					this.addToRenderingStack(<RenderObject>obj)
				})
			}
		})

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		for (let object of this.renderingStack) {
			Renderer.render(this.ctx, object, true)
		}
	}
}

export { Env }
