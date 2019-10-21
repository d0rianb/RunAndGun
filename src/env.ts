import * as Matter from 'matter-js'
import * as main from './main'
import { Vector, SolidObject } from './object'
import { Player } from './player'
import { Map, SizeObject } from './map'
import { DOMEvent } from './events'
import { Renderer, RenderObject, RenderOptions } from './render'
import { default as colors } from '../ressources/config/colors.json'

const WALL_COLLISION_FILTER = 0x0010

let debug = main.DEBUG

const renderOption: object = {
	pixelRatio: 'auto',
	background: '#bbb',
	wireframeBackground: '#222',
	hasBounds: true,
	enabled: true,
	wireframes: debug,
	showSleeping: true,
	showDebug: debug,
	showBroadphase: debug,
	showBounds: debug,
	showVelocity: debug,
	showCollisions: debug,
	showSeparations: false,
	showAxes: false,
	showPositions: debug,
	showAngleIndicator: false,
	showIds: debug,
	showShadows: false,
	showVertexNumbers: false,
	showConvexHulls: false,
	showInternalEdges: false,
	showMousePosition: false
}

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
	public camera: Camera
	public engine: Matter.Engine
	public engineRunner: Matter.Runner
	public renderer: Matter.Render
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
	public renderMode: string // local | matter-js

	constructor(canvas: HTMLCanvasElement, map: Map, renderMode: string = 'local') {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.map = map
		this.gridWidth = map.grid.width
		this.gridHeight = map.grid.height

		this.engine = Matter.Engine.create({ enableSleeping: true })
		this.engineRunner = Matter.Runner.create({})
		this.renderMode = renderMode
		this.world = this.engine.world
		this.world.gravity.scale = 0.0019

		this.players = []
		this.objects = []
		this.renderingStack = []
		this.cursorPosition = new Vector(0, 0)
		this.sizeCanvas()
		this.camera = new Camera(0, 0, this.width, this.height)
		this.relToAbs = {
			x: this.width / this.gridWidth,
			y: this.height / this.gridHeight
		}
		this.oldRelToAbs = new Vector(0, 0)
		Object.assign(this.oldRelToAbs, this.relToAbs)
		// this.events.push(new DOMEvent('resize', () => this.resize()))
		this.events.push(new DOMEvent('mousemove', e => this.updateCursorPosition(e)))
		this.init()
	}

	getWindowDimensions(): number[] {
		const html: any = document.scrollingElement
		return [window.outerWidth, html.clientHeight]
	}

	sizeCanvas(): void {
		const dpr: number = window.devicePixelRatio || 1;
		[this.width, this.height] = this.getWindowDimensions()
		if (this.renderMode === 'local') {
			[this.canvas.width, this.canvas.height] = [this.width * dpr, this.height * dpr];
			[this.canvas.style.width, this.canvas.style.height] = [this.width + 'px', this.height + 'px'];
			this.canvas.style.backgroundColor = colors.canvasBackground
			document.querySelector('main').appendChild(this.canvas)
			this.ctx.scale(dpr, dpr)
		}
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
		// init matter js canvas if it doesn't exist
		if (this.renderMode === 'matter-js' && !document.querySelector('[data-pixel-ratio]')) {
			let matterOptions: object = Object.assign(renderOption, { width: this.width, height: this.height })
			this.renderer = Matter.Render.create({ element: document.body, engine: this.engine, options: matterOptions })
			Matter.Render.run(this.renderer)
		}
		this.objects = []
		Matter.World.clear(this.world, false)
		for (let objString of this.map.objects) {
			let objArray: Array<string> = objString.split(/[\s,]+/)
			let type: string = objArray[0]
			if (type !== 'format') {
				let isStatic: boolean = objArray.length > 5 && objArray[5] === 'static'
				let solidObj: SolidObject = new SolidObject(
					objArray[0],
					parseFloat(objArray[1]),
					parseFloat(objArray[2]),
					parseFloat(objArray[3]),
					parseFloat(objArray[4]),
					isStatic,
					this,
					<Matter.IBodyDefinition>{
						label: 'Wall',
						friction: 0.0001,
						chamfer: { radius: 0 },
						mass: 5,
						frictionStatic: 0.1,
						collisionFilter: {
							group: 0,
							category: WALL_COLLISION_FILTER,
							mask: 0x010011
						}
						// chamfer: { radius: 7.5 }
					})
			}
		}
	}

	addPlayer(player: Player): void {
		this.players.push(player)
		Matter.World.add(this.world, player.composite)
		if (player.cameraFocus) {
			this.camera.setFocus(player)
		}
	}

	changeTimeScale(timescale: number): void {
		this.timescale = timescale
		this.engine.timing.timeScale = this.timescale
	}

	updateCursorPosition(evt: any) {
		const rect = this.canvas.getBoundingClientRect()
		this.cursorPosition = new Vector(
			evt.clientX + this.camera.x - rect.left,
			evt.clientY + this.camera.y - rect.top
		)
	}

	addToRenderingStack(object: RenderObject): void {
		this.renderingStack.push(object)
	}

	swicthRenderer(): void {
		this.renderMode = this.renderMode === 'local' ? 'matter-js' : 'local'
		console.log('New render mode is', this.renderMode)
		if (this.renderMode === 'matter-js') {
			this.canvas.style.display = 'none'
			if (!this.renderer) {
				this.renderer = Matter.Render.create({ element: document.body, engine: this.engine, options: renderOption })
			}
			Matter.Render.run(this.renderer)
		} else if (this.renderMode === 'local') {
			if (this.renderer) Matter.Render.stop(this.renderer)
			this.canvas.style.display = 'inherit'
			this.sizeCanvas()
		}
	}

	update(): void {
		Matter.Runner.tick(this.engineRunner, this.engine, 1 / this.framerate)
		this.objects.forEach(obj => obj.update())
		this.players.forEach(player => player.update())
		this.camera.update()
		if (this.renderMode === 'local') this.render()
		this.tick++
		requestAnimationFrame(() => this.update())
	}

	render(): void {
		this.renderingStack = []

		// Camera Guide
		let x1: number = this.camera.safe_zone.x1
		let x2: number = this.camera.safe_zone.x2
		let renderObj: RenderObject = new RenderObject('line', x1, this.camera.width / 2, <RenderOptions>{ x2: x2, y2: this.camera.width / 2, interface: true })
		this.addToRenderingStack(renderObj)

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
			Renderer.render(this.ctx, object, this.camera, true)
		}
	}
}

class Camera {
	focus: Player

	x: number
	y: number
	width: number
	height: number
	safe_zone_size: number
	safe_zone: any

	follow_x: boolean
	follow_y: boolean

	constructor(x: number, y: number, width: number, height: number) {
		this.focus = undefined
		this.x = x
		this.y = y
		this.width = width
		this.height = height

		this.safe_zone_size = this.width / 5
		this.safe_zone = {
			x1: this.width / 2 - this.safe_zone_size / 2,
			x2: this.width / 2 + this.safe_zone_size / 2
		}
		this.follow_x = true
		this.follow_y = false
	}

	setFocus(player: Player): void {
		this.focus = player
	}

	include(obj: Object): boolean {
		return true
	}

	update(): void {
		if (this.focus) {
			let focus_x: number = this.focus.pos.x
			let focus_y: number = this.focus.pos.y
			if (this.follow_x) {
				if (focus_x <= this.x + this.safe_zone.x1) {
					this.x += focus_x - this.x - this.safe_zone.x1
				} else if (focus_x >= this.x + this.safe_zone.x2) {
					this.x += focus_x - this.x - this.safe_zone.x2
				}
			}
		}
	}

	render(): void {

	}
}

export { Env, Camera }
