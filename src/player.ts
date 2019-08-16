import * as Matter from 'matter-js'
import * as kd from 'keydrown'
import { SolidObject, Vector } from './object'
import { Env } from './env'
import { RenderObject, RenderOptions } from './render'
import { default as setup } from '../ressources/config/setup.json'

const KEY_MAP = {
	'ZERO': kd.ZERO,
	'ONE': kd.ONE,
	'TWO': kd.TWO,
	'THREE': kd.THREE,
	'FOUR': kd.FOUR,
	'FIVE': kd.FIVE,
	'SIX': kd.SIX,
	'SEVEN': kd.SEVEN,
	'EIGHT': kd.EIGHT,
	'NINE': kd.NINE,
	'A': kd.A,
	'B': kd.B,
	'C': kd.C,
	'D': kd.D,
	'E': kd.E,
	'F': kd.F,
	'G': kd.G,
	'H': kd.H,
	'I': kd.I,
	'J': kd.J,
	'K': kd.K,
	'L': kd.L,
	'M': kd.M,
	'N': kd.N,
	'O': kd.O,
	'P': kd.P,
	'Q': kd.Q,
	'R': kd.R,
	'S': kd.S,
	'T': kd.T,
	'U': kd.U,
	'V': kd.V,
	'W': kd.W,
	'X': kd.X,
	'Y': kd.Y,
	'Z': kd.Z,
	'ENTER': kd.ENTER,
	'SHIFT': kd.SHIFT,
	'ESC': kd.ESC,
	'SPACE': kd.SPACE,
	'LEFT': kd.LEFT,
	'UP': kd.UP,
	'RIGHT': kd.RIGHT,
	'DOWN': kd.DOWN,
	'BACKSPACE': kd.BACKSPACE,
	'DELETE': kd.DELETE,
	'TAB': kd.TAB,
	'TILDE': kd.TILDE2
}
const MAX_SPEED = 14

class Player {
	name: string
	pos: Vector
	velocity: Vector
	width: number
	height: number

	grid_width: number
	grid_height: number

	env: Env
	body: Matter.Body
	texture: string

	angle: number
	mass: number
	groundForce: number
	airForce: number
	stoppingFriction: number
	jumpForce: number
	onAir: boolean
	nbJump: number
	isMoving: boolean

	jumpSensor: Matter.Body

	constructor(name: string, grid_x: number, grid_y: number, grid_width: number, grid_height: number, env: Env, options?: Matter.IBodyDefinition) {
		this.name = name
		this.env = env
		this.width = grid_width * this.env.relToAbs.x
		this.height = grid_height * this.env.relToAbs.y
		this.pos = new Vector(grid_x * this.env.relToAbs.x + this.width / 2, grid_y * this.env.relToAbs.y + this.height / 2)
		this.velocity = new Vector(0, 0)

		this.grid_width = grid_width
		this.grid_height = grid_height

		const headOffsetY = this.width * 3 / 5
		const playerHead = Matter.Bodies.circle(this.pos.x, this.pos.y - headOffsetY, this.width / 2, { label: 'PlayerHead' })
		const playerBody = Matter.Bodies.rectangle(this.pos.x, this.pos.y + headOffsetY, this.width, this.height - headOffsetY, { label: 'PlayerBody' })
		this.jumpSensor = Matter.Bodies.rectangle(this.pos.x, this.pos.y + this.height / 2 + 10, this.width, 15, {
			// this sensor check if the player is on the ground to enable jumping
			sleepThreshold: 9e10,
			label: 'PlayerBody',
			isSensor: true
		})
		// const headSensor = Matter.Bodies.rectangle(0, -57, 48, 45, {
		// 	// senses if the player's head is empty and can return after crouching
		// 	sleepThreshold: 99999999999,
		// 	isSensor: true
		// })
		this.body = Matter.Body.create({
			parts: [playerBody, playerHead, this.jumpSensor],
			inertia: Infinity,
			friction: 0.002,
			frictionAir: 0.005,
			frictionStatic: 0.0002,
			restitution: 0.15,
			sleepThreshold: Infinity,
			collisionFilter: {
				group: 0,
				category: 0x001000,
				mask: 0x010011
			}
		})

		console.log(this)

		this.groundForce = 0.015 // run force on ground
		this.airForce = 0.011    // run force in air
		this.mass = options.mass || 10
		this.jumpForce = 0.18
		this.stoppingFriction = 0.92
		this.onAir = false
		this.isMoving = false
		this.nbJump = 0

		this.env.players.push(this)
		Matter.World.add(this.env.world, this.body)
		this.initSetup(setup)
	}

	initSetup(setup): void {
		Object.keys(setup.keybind).forEach(key => {
			let value: string = setup.keybind[key]
			if (typeof value === "string") {
				this.assignKey(key, value)
			} else if (typeof value === 'object') {
				(value as Array<string>).forEach(key_bis => {
					this.assignKey(key, key_bis)
				})
			}
		})
		kd.run(() => kd.tick())
	}

	assignKey(key: string, value: string): void {
		let kd_key = KEY_MAP[value]
		switch (key) {
			case 'move_forward':
				kd_key.down(() => this.move('right'))
				break
			case 'move_backward':
				kd_key.down(() => this.move('left'))
				break
			case 'jump':
				kd_key.press(() => this.jump())
				break
			case 'crouch':
				kd_key.down(() => console.log('s'))
				break
			case 'dash':
				kd_key.down(() => console.log('shift'))
				break
			case 'reload':
				kd_key.down(() => console.log('r'))
				break

		}
	}

	move(side: string): void {
		this.isMoving = true
		if (side === 'left') {
			if (this.onAir && this.velocity.x > -2) {
				this.body.force.x -= this.airForce * .5
			} else {
				this.body.force.x -= this.groundForce * .5
			}
		} else if (side === 'right') {
			if (this.onAir && this.velocity.x < -2) {
				this.body.force.x += this.airForce * .5
			} else {
				this.body.force.x += this.groundForce * .5
			}
		}
	}

	jump(): void {
		if (!this.onAir || this.nbJump < 2) {
			Matter.Body.applyForce(this.body, this.pos, { x: 0, y: this.jumpForce * 0.12 * this.mass })
			this.body.force.y = - this.jumpForce
			Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 })
			this.nbJump++
		}
	}

	lookAtCursor(cursor: Vector) {
		this.angle = Math.atan2(
			cursor.y - this.pos.y,
			cursor.x - this.pos.x
		)
	}


	onGround(): void {
		this.nbJump = 0
	}

	resize() {
		const new_width: number = this.grid_width * this.env.relToAbs.x
		const new_height: number = this.grid_height * this.env.relToAbs.y
		const new_x: number = this.body.position.x / this.env.oldRelToAbs.x * this.env.relToAbs.x
		const new_y: number = this.body.position.y / this.env.oldRelToAbs.y * this.env.relToAbs.y
		const headOffsetY = new_width * 3 / 5
		const playerHead = Matter.Bodies.circle(new_x, new_y - headOffsetY, new_width / 2)
		const playerBody = Matter.Bodies.rectangle(new_x, new_y + headOffsetY, new_width, new_height - headOffsetY)
		this.body = Matter.Body.create({
			parts: [playerBody, playerHead],
			inertia: Infinity,
			friction: 0.002,
			frictionAir: 0.001,
			restitution: 0,
			sleepThreshold: Infinity,
			collisionFilter: {
				group: 0,
				category: 0x001000,
				mask: 0x010011
			}
		})
	}

	toRender(): RenderObject[] {
		let renderObjects = []
		if (this.body.render.visible) {
			this.body.parts.forEach(part => {
				switch (part.label) {
					case 'PlayerBody':
						var { min, max } = <any>part.bounds
						renderObjects.push(new RenderObject(
							'rect',
							part.position.x,
							part.position.y,
							<RenderOptions>{
								width: max.x - min.x,
								height: max.y - min.y
							}
						))
						break
					case 'PlayerHead':
						var { min, max } = <any>part.bounds
						renderObjects.push(new RenderObject(
							'circle',
							part.position.x,
							part.position.y,
							// <RenderOptions>{ radius: (max.x - min.x) / 2 }
							<RenderOptions>{ radius: this.width / 2 }
						))
						break
				}
			})
		}
		let debugText = new RenderObject('text', 10, 20, {
			content: [
				`motion: ${this.body.motion.toFixed(3)}`,
				`speed: ${this.body.speed.toFixed(3)}`,
				`velocity: {x: ${this.body.velocity.x.toFixed(3)}, y: ${this.body.velocity.y.toFixed(3)}}`,
				`position: {x: ${this.body.position.x.toFixed(3)}, y: ${this.body.position.y.toFixed(3)}}`,
				`onAir: ${this.onAir}`
			]
		})
		renderObjects.push(debugText)
		return renderObjects
	}

	update(): void {
		this.lookAtCursor(this.env.cursorPosition)
		this.onAir = this.env.objects.filter(obj => (Matter as any).SAT.collides(obj.body, this.jumpSensor).collided).length === 0
		if (!this.onAir) this.onGround()

		if ((!this.isMoving || this.body.speed > MAX_SPEED) && !this.onAir) {
			Matter.Body.setVelocity(this.body, {
				x: this.body.velocity.x * this.stoppingFriction,
				y: this.body.velocity.y * this.stoppingFriction
			})
		} else {
			this.isMoving = false
		}
	}
}

export { Player }
