import * as Matter from 'matter-js'
import * as kd from 'keydrown'
import { SolidObject, Vector } from './object'
import { Env } from './env'
import { RenderObject, RenderOptions } from './render'
import { Weapon, AR, SMG, Shot } from './weapon'
import { DOMEvent } from './events'
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
const MAX_SPEED = 12
const SECOND_JUMP_COEFF = 0.8

const FRICTION = 0.01
const STATIC_FRICTION = 0.25
const AIR_FRICTION = 0.01

const BODY_COLLISION_FILTER = 0x0010
const ARM_COLLISION_FILTER = 0x0011

const armOffsetX = 5

/*
PLAYER BODY
________
| head | 1/3
|      |
| body | 1/3
|      |
| legs | 1/3
________
*/


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
	composite: Matter.Composite
	texture: string

	angle: number
	mass: number
	groundForce: number
	airForce: number
	stoppingFriction: number
	jumpForce: number
	onAir: boolean
	wallSlide: boolean
	wallSlideSide: string
	nbJump: number
	isCrouch: boolean
	isMoving: boolean
	dir: string
	cameraFocus: boolean = false

	jumpSensor: Matter.Body
	playerHead: Matter.Body
	playerBody: Matter.Body
	playerArm: Matter.Body
	insideLegs: Matter.Body
	playerLegs: Matter.Body
	crouchOffset: number

	weapon: Weapon
	health: number
	alive: boolean

	constructor(name: string, grid_x: number, grid_y: number, grid_width: number, grid_height: number, env: Env, camera_focus: boolean = false) {
		this.name = name
		this.env = env
		this.cameraFocus = camera_focus
		this.width = grid_width * this.env.relToAbs.x
		this.height = grid_height * this.env.relToAbs.y
		this.pos = new Vector(grid_x * this.env.relToAbs.x + this.width / 2, grid_y * this.env.relToAbs.y + this.height / 2)
		this.velocity = new Vector(0, 0)

		this.grid_width = grid_width
		this.grid_height = grid_height

		const headY = this.height * 1 / 3
		const armHeight = 10
		const bodyHeight = this.height * 2 / 3
		const legsOffsetY = this.height * 1 / 3

		this.crouchOffset = parseFloat((this.height * 1.5 / 6).toFixed(2))

		this.playerHead = Matter.Bodies.circle(this.pos.x, this.pos.y - headY, this.width / 2, { label: 'PlayerCircle', render: { fillStyle: 'red' } })
		this.playerBody = Matter.Bodies.rectangle(this.pos.x, this.pos.y, this.width, bodyHeight / 2, { label: 'PlayerRect', render: { fillStyle: 'blue' } })
		this.insideLegs = Matter.Bodies.rectangle(this.pos.x, this.pos.y + legsOffsetY, this.width, bodyHeight / 2, { label: 'PlayerRect', render: { fillStyle: 'green' } })
		this.jumpSensor = Matter.Bodies.rectangle(this.pos.x, this.pos.y + this.height / 2, this.width, 4, {
			// this sensor check if the player is on the ground to enable jumping
			sleepThreshold: 9e10,
			label: 'PlayerRect',
			isSensor: true,
			render: {
				fillStyle: 'yellow'
			}
		})
		this.playerLegs = Matter.Body.create({
			parts: [this.insideLegs, this.jumpSensor],
			label: 'ComposedBody',
			restitution: 0.2
		})

		this.playerArm = Matter.Bodies.rectangle(this.pos.x + this.width - armOffsetX, this.playerBody.position.y, this.width, armHeight, {
			label: 'PlayerRect',
			inertia: Infinity,
			sleepThreshold: Infinity,
			collisionFilter: {
				group: 1,
				category: ARM_COLLISION_FILTER,
				mask: 0x010001
			}
		})
		// const headSensor = Matter.Bodies.rectangle(0, -57, 48, 45, {
		// 	// senses if the player's head is empty and can return after crouching
		// 	sleepThreshold: 99999999999,
		// 	isSensor: true
		// })
		this.body = Matter.Body.create({
			parts: [this.playerBody, this.playerHead, this.playerLegs, this.jumpSensor],
			inertia: Infinity,
			friction: FRICTION,
			frictionAir: AIR_FRICTION,
			frictionStatic: STATIC_FRICTION,
			restitution: 0.14,
			sleepThreshold: Infinity,
			collisionFilter: {
				group: 0,
				category: BODY_COLLISION_FILTER,
				mask: 0x010011
			}
		})

		let armConstraint = Matter.Constraint.create({
			bodyA: this.body,
			pointA: { x: this.width / 2 - armOffsetX, y: 0 },
			bodyB: this.playerArm,
			pointB: { x: -this.width / 2, y: 0 },
			stiffness: 0.2,
			length: 0
		})

		this.composite = Matter.Composite.create({
			label: 'Player',
			bodies: [this.body, this.playerArm],
			constraints: [armConstraint]
		})

		console.log(this)

		this.groundForce = 0.04 // run force on ground
		this.airForce = 0.01    // run force in air
		this.mass = 5
		this.jumpForce = 0.3
		this.stoppingFriction = 0.70
		this.onAir = false
		this.isMoving = false
		this.isCrouch = false
		this.wallSlide = false
		this.wallSlideSide = 'no-collision'
		this.nbJump = 0
		this.dir = this.env.cursorPosition.x > this.body.position.x ? 'left' : 'right'

		Matter.Body.setMass(this.body, this.mass)

		this.health = 100
		this.alive = true
		this.weapon = new AR(this)
		this.env.events.push(new DOMEvent('mousedown', () => this.weapon.shoot()))

		this.env.addPlayer(this)
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
				kd_key.down(() => this.crouch())
				kd_key.up(() => this.uncrouch())
				break
			case 'dash':
				kd_key.press(() => console.log('grappeln'))
				break
			case 'reload':
				kd_key.press(() => this.weapon.reload())
				break
		}
		kd.F.press(() => this.flipDirection())
		kd.G.press(() => this.env.swicthRenderer())
	}

	move(side: string): void {
		if (this.body.speed <= MAX_SPEED && this.wallSlideSide !== 'jump') {
			const sideCoeff = side === 'left' ? -1 : 1
			const force = this.onAir ? this.airForce : this.groundForce
			this.body.force.x = sideCoeff * force
			this.isMoving = true
		}
	}

	jump(): void {
		if (!this.onAir || this.nbJump < 2) {
			const jumpForce: number = this.nbJump === 1 ? SECOND_JUMP_COEFF * this.jumpForce : this.jumpForce // 2nd jump is less powerfull
			let xJumpOffset: number = 0
			if (this.wallSlide && this.wallSlideSide !== 'no-collision') {
				xJumpOffset = this.wallSlideSide === 'left' ? -this.groundForce * 4 : this.groundForce * 4
				this.wallSlideSide = 'jump'
			}
			Matter.Body.applyForce(this.body, this.pos, { x: xJumpOffset, y: jumpForce * 0.12 * this.mass })
			this.body.force.y = -jumpForce
			Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 })
			this.nbJump++
		}
	}

	crouch(): void {
		if (!this.isCrouch) {
			Matter.Body.translate(this.playerLegs, { x: 0, y: -this.crouchOffset })
			Matter.Body.set(this.body, 'friction', FRICTION / 3)
			this.isCrouch = true
		}
	}

	uncrouch(): void {
		if (this.isCrouch) {
			Matter.Body.translate(this.playerLegs, { x: 0, y: this.crouchOffset })
			Matter.Body.set(this.body, 'friction', FRICTION)
			this.isCrouch = false
		}
	}

	lookAtCursor(cursor: Vector): void {
		this.angle = Math.atan2(
			cursor.y - this.pos.y,
			cursor.x - this.pos.x
		)

		const anchorArmVector: Vector = { x: this.body.position.x + this.width / 2 - armOffsetX, y: this.body.position.y }
		const targetAngle = Matter.Vector.angle(anchorArmVector, cursor)
		const flipAngle = Matter.Vector.angle(this.body.position, cursor);
		(Matter as any).Body.rotate(this.playerArm, targetAngle - this.playerArm.angle, anchorArmVector)
		const dirFactor = this.dir === 'left' ? 1 : -1
		if ((flipAngle + Math.PI / 2) * dirFactor < 0 && (flipAngle + Math.PI / 2) < Math.PI) {
			this.flipDirection()
		}
	}

	flipDirection(): void {
		this.dir = this.dir === 'left' ? 'right' : 'left'
		// Matter.Composite.setAngle(this.composite, 0)
		// Matter.Body.scale(this.body, -1, 1, this.body.position)
		// Matter.Body.scale(this.playerArm, -1, 1, this.body.position)
		Matter.Body.setInertia(this.body, Infinity)
		Matter.Body.setInertia(this.playerArm, Infinity)
	}

	onGround(): void {
		this.nbJump = 0
	}

	checkDeath(): void {
		this.alive = !((this.health <= 0) || (this.pos.y > this.env.height))
		if (!this.alive) console.log('Mort')
	}

	resize(): void {
		const new_width: number = this.grid_width * this.env.relToAbs.x
		const new_height: number = this.grid_height * this.env.relToAbs.y

		const ratioX: number = 1 / this.env.oldRelToAbs.x * this.env.relToAbs.x
		const ratioY: number = 1 / this.env.oldRelToAbs.y * this.env.relToAbs.y
		const headY = this.height * 1 / 10

		this.playerHead = Matter.Bodies.circle(this.playerHead.position.x * ratioX, this.playerHead.position.y * ratioY, new_width / 2, { label: 'PlayerCircle' })
		this.playerBody = Matter.Bodies.rectangle(this.playerBody.position.x * ratioX, this.playerBody.position.y * ratioY, new_width, new_height - 2 * headY, { label: 'PlayerRect' })
		this.jumpSensor = Matter.Bodies.rectangle(this.jumpSensor.position.x * ratioX, this.jumpSensor.position.y * ratioY, new_width, 15, {
			sleepThreshold: 9e10,
			label: 'PlayerRect',
			isSensor: true
		})
		this.body = Matter.Body.create({
			parts: [this.playerBody, this.playerHead, this.jumpSensor],
			inertia: Infinity,
			friction: 0.1,
			frictionAir: 0.018,
			frictionStatic: 0.8,
			restitution: 0.12,
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
			this.composite.bodies.forEach(body => {
				body.parts.forEach(part => {
					switch (part.label) {
						case 'PlayerRect':
							renderObjects.push(new RenderObject(
								'poly',
								part.position.x,
								part.position.y,
								<RenderOptions>{
									vertices: part.vertices
								}
							))
							break
						case 'PlayerCircle':
							renderObjects.push(new RenderObject(
								'circle',
								part.position.x,
								part.position.y,
								<RenderOptions>{ radius: (<any>part).circleRadius }
							))
							break
						case 'ComposedBody':
							part.parts.forEach(insidePart => {
								renderObjects.push(new RenderObject(
									'poly',
									part.position.x,
									part.position.y,
									<RenderOptions>{
										vertices: part.vertices
									}
								))
							})
							break
					}
				})
			})
			this.composite.constraints.forEach(constraint => {
				renderObjects.push(new RenderObject(
					'line',
					constraint.bodyA.position.x + constraint.pointA.x,
					constraint.bodyA.position.y + constraint.pointA.y,
					<RenderOptions>{
						x2: constraint.bodyB.position.x + constraint.pointB.x,
						y2: constraint.bodyB.position.y + constraint.pointB.y
					}
				))
			})
		}
		let debugText = new RenderObject('text', 10, 20, {
			content: [
				`motion: ${this.body.motion.toFixed(3)}`,
				`speed: ${this.body.speed.toFixed(3)}`,
				`velocity: {x: ${this.body.velocity.x.toFixed(3)}, y: ${this.body.velocity.y.toFixed(3)}}`,
				`position: {x: ${this.body.position.x.toFixed(3)}, y: ${this.body.position.y.toFixed(3)}}`,
				`angle: ${(this.angle * 180 / Math.PI).toFixed(2)}°`,
				`mass: ${this.body.mass}`,
				`inertia: ${this.body.inertia}`,
				`onAir: ${this.onAir}`,
				`isCrouching: ${this.isCrouch}`,
				`isMoving: ${this.isMoving}`,
				`wallSlide: ${this.wallSlide}`,
				`wallSlideSide: ${this.wallSlideSide}`,
				`frictionStatic: ${this.body.frictionStatic}`,
				`friction: ${this.body.friction.toFixed(4)}`,
				`direction: ${this.dir}`,
				`camera : ${this.env.camera.x.toFixed(2)}, ${this.env.camera.y.toFixed(2)}`,
			],
			interface: true
		})
		renderObjects.push(debugText)
		return renderObjects
	}

	update(): void {
		if (!this.alive) return
		this.lookAtCursor(this.env.cursorPosition)

		/* Colision Detection */
		this.onAir = this.env.objects.filter(obj => {
			let collision = (Matter as any).SAT.collides(obj.body, this.jumpSensor)
			return collision.collided && collision.axisNumber === 0
		}).length === 0

		let colidingWall = this.env.objects.filter(obj => {
			let collision = (Matter as any).SAT.collides(obj.body, this.jumpSensor)
			if (collision.collided && collision.axisNumber === 1) {
				this.wallSlideSide = collision.bodyA.position.x > collision.bodyB.position.x ? 'left' : 'right'
			}
			return collision.collided && collision.axisNumber === 1
		}).length !== 0 && this.body.velocity.y > 0

		this.wallSlide = colidingWall && this.isMoving

		/* Colision consequences*/
		if (!this.onAir) this.onGround()
		if (this.wallSlide) {
			this.nbJump = 1
		} else {
			this.wallSlideSide = 'no-collision'
		}

		if ((!this.isMoving || this.body.speed > MAX_SPEED) && !this.onAir) {
			Matter.Body.setVelocity(this.body, {
				x: this.body.velocity.x * this.stoppingFriction,
				y: this.body.velocity.y * this.stoppingFriction
			})
		} else {
			this.isMoving = false
		}
		if (this.wallSlide && this.body.friction == 0) {
			console.log('FrictionError')
		}
		this.pos = new Vector(this.body.position.x, this.body.position.y)
		this.checkDeath()
	}
}

export { Player }
