import * as Matter from 'matter-js'
import * as main from './main'
import { Vector, MapElement, ObjectRenderOptions } from './object'
import { Entity, Player } from './player'
import { Map, SizeObject } from './map'
import { DOMEvent } from './events'
import { Shot } from './weapon'
import { Particle } from './particles'
import { Interface } from './interface'
import { Renderer, RenderObject, RenderOptions } from './render'
import { default as colors } from '../ressources/config/colors.json'

const WALL_COLLISION_FILTER = 0x0010
const GRAVITY_SCALE = 0.00195

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
	private ctx: CanvasRenderingContext2D
	public width: number = 0 // px
	public height: number = 0 // px
	public gridWidth: number // grid unit
	public gridHeight: number // grid unit
	public mapWidth: number
	public mapHeight: number
	public oldRelToAbs: Vector
	public relToAbs: number
	public map: Map
	public camera: Camera
	public engine: Matter.Engine
	public engineRunner: Matter.Runner
	public renderer: Matter.Render
	public world: Matter.World
	public events: Array<DOMEvent>
	public cursorPosition: Vector
	private tick: number = 0
	private scale: number = 1
	public timescale: number = 1
	public framerate: number = 60  // fps
	public objects: Array<MapElement>
	public entities: Array<Entity>
	public shots: Array<Shot>
	public particles: Array<Particle>
	private renderingStack: Array<RenderObject>
	public renderMode: string // local | matter-js

	constructor(canvas: HTMLCanvasElement, map: Map, renderMode: string = 'local') {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.map = map
		this.gridWidth = map.tileWidth
		this.gridHeight = map.tileWidth

		this.engine = Matter.Engine.create({ enableSleeping: true })
		this.engineRunner = Matter.Runner.create({})
		this.renderMode = renderMode
		this.world = this.engine.world
		this.world.gravity.scale = 0 //0.0019

		this.entities = []
		this.shots = []
		this.objects = []
		this.particles = []
		this.events = []
		this.renderingStack = []
		this.cursorPosition = new Vector(0, 0)
		this.sizeCanvas()
		this.relToAbs = Math.min(this.width / this.gridWidth, this.height / this.gridHeight)
		this.mapWidth = this.map.dimensions.width * this.relToAbs
		this.mapHeight = this.map.dimensions.height * this.relToAbs
		this.oldRelToAbs = new Vector(0, 0)
		Object.assign(this.oldRelToAbs, this.relToAbs)
		this.events.push(new DOMEvent('mousemove', e => this.updateCursorPosition(e)))
		this.initMatterEngine()
		this.initRender()
		this.initMap()
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

	initMatterEngine(): void {
		this.world.gravity.scale = 0 //0.0019
		Matter.Events.on(this.engine, 'beforeUpdate', e => {
			// Own gravity
			const bodies = Matter.Composite.allBodies(this.engine.world)
			bodies.forEach(body => {
				if (!(body.isStatic || body.isSleeping) && body.label !== 'Shot') {
					body.force.y += body.mass * GRAVITY_SCALE
				}
			})
		})
		Matter.Events.on(this.engine, 'collisionStart', e => {
			const shotCollision = e.pairs.filter(pair => pair.bodyA.label === 'Shot' || pair.bodyB.label === 'Shot')
			if (shotCollision.length > 0) {
				for (let shot of shotCollision) {
					const shotBody = shot.bodyA.label === 'Shot' ? shot.bodyA : shot.bodyB
					const otherBody = shotBody === shot.bodyA ? shot.bodyB : shot.bodyA
					if (otherBody.label === 'Wall') {
						const shotObj = this.shots.filter(shot => shot.id === shotBody.id)[0]
						if (shotObj) shotObj.destroy()
					} else if (otherBody.label == 'PlayerRect' || otherBody.label == 'PlayerCircle' ) {
						this.collision(shotBody, otherBody)
					}
				}
			}
		})
	}

	initRender(): void {
		// init matter js canvas if it doesn't exist
		if (this.renderMode === 'matter-js' && !document.querySelector('[data-pixel-ratio]')) {
			let matterOptions: object = Object.assign(renderOption, { width: this.width, height: this.height })
			this.renderer = Matter.Render.create({ element: document.body, engine: this.engine, options: matterOptions })
			Matter.Events.on(this.renderer, 'beforeRender', e => {
				const allBodies: Matter.Body[] = Matter.Composite.allBodies(this.world)
				allBodies.sort((a, b) => {
					const zIndexA = (<ObjectRenderOptions>a.render) && typeof (<ObjectRenderOptions>a.render).zIndex !== 'undefined' ? (<ObjectRenderOptions>a.render).zIndex : 1
					const zIndexB = (<ObjectRenderOptions>b.render) && typeof (<ObjectRenderOptions>b.render).zIndex !== 'undefined' ? (<ObjectRenderOptions>b.render).zIndex : 1
					return zIndexA - zIndexB
				})
			})
			Matter.Render.run(this.renderer)
		}
		this.camera = new Camera(0, 0, this.width, this.height, this)
	}

	initMap(): void {
		this.objects = []
		Matter.World.clear(this.world, false)
		this.map.init(this)
		this.objects.forEach(mapEl => {
			mapEl.tiles.forEach(tile => {
				tile.defineTexture()
			})
		})
	}

	addEntity(entity: Entity): void {
		this.entities.push(entity)
		Matter.World.add(this.world, entity.composite)
		if (entity instanceof Player && entity.cameraFocus) {
			this.camera.setFocus(<Player>entity)
		}
	}

	addShot(shot: Shot): void {
		this.shots.push(shot)
		Matter.World.add(this.world, shot.body)
	}

	removeShot(shot: Shot): void {
		this.shots = this.shots.filter(envShot => envShot.id === shot.id)
		Matter.World.remove(this.world, shot.body)
	}

	collision(shotBody: Matter.Body, entityBody: Matter.Body): boolean {
		const shot: Shot = this.shots.filter(shot => shot.id === shotBody.id)[0]
		if (shot && shot.player.idArray.includes(entityBody.id)) {
			return false
		}
		const entity: Entity = this.entities.filter(entity => entity.idArray.includes(entityBody.id))[0]
		if (entity && shot) {
			entity.hitBy(shot, entityBody)
		}
		return entity != null
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
		this.shots.forEach(shot => shot.update())
		this.particles.forEach(particule => particule.update())
		this.entities.forEach(entity => entity.update())
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

		// Tile render
		this.objects.forEach(obj => {
			obj.tileRender().forEach(tile => {
				this.addToRenderingStack(tile)
			})
		})

		// Shot render
		this.shots.forEach(shot => {
			const pos: Matter.Vector = shot.body.position
			let renderObj: RenderObject = new RenderObject('poly', pos.x, pos.y, <RenderOptions>{ vertices: shot.body.vertices })
			this.addToRenderingStack(renderObj)
		})

		this.particles.forEach(particule => particule.render(this))

		// Player render
		this.entities.forEach(entity => {
			let renderObj: RenderObject[] = entity.toRender()
			if (renderObj) {
				renderObj.forEach(obj => {
					this.addToRenderingStack(<RenderObject>obj)
				})
			}
		})

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		Renderer.render(this.renderingStack, this.ctx, this.camera)
		Renderer.renderSprite(this.renderingStack, this.ctx, this.camera)
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
	zoom: number
	env: Env

	follow_x: boolean
	follow_y: boolean

	constructor(x: number, y: number, width: number, height: number, env: Env) {
		this.focus = undefined
		this.env = env
		this.x = x
		this.y = y
		this.zoom = 1
		this.width = width / this.zoom
		this.height = height / this.zoom

		this.safe_zone_size = this.width / 5
		this.safe_zone = {
			x1: this.width / 2 - this.safe_zone_size / 2,
			x2: this.width / 2 + this.safe_zone_size / 2
		}
		this.follow_x = true
		this.follow_y = false
		if (this.env.renderMode == 'matter-js') {
			(<any>this.env.renderer.bounds).max.x *= this.zoom;
			(<any>this.env.renderer.bounds).max.y *= this.zoom;
		}
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
				let delta: number = 0
				if (focus_x <= this.x + this.safe_zone.x1) {
					delta = focus_x - this.x - this.safe_zone.x1
					this.x += delta
				} else if (focus_x >= this.x + this.safe_zone.x2) {
					delta = focus_x - this.x - this.safe_zone.x2
					this.x += delta
				}
				if (this.env.renderMode == 'matter-js') {
					Matter.Bounds.translate(this.env.renderer.bounds, <Matter.Vector>{ x: delta, y: 0 })
				}
			}
		}
	}
}

export { Env, Camera }
