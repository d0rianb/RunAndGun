import * as Matter from 'matter-js'
import * as kd from 'keydrown'

import { Point, Renderer, Texture, Vector2 } from 'unrail-engine'

import { Env } from './env'
import { Weapon, AR, SMG, Shot } from './weapon'
import { DOMEvent, Cooldown } from './events'
import { Particle, ParticuleGenerator } from './particles'
import { PLAYER_BODY_SPRITE, PLAYER_HEAD_SPRITE } from './texture'

import { default as setup } from '../ressources/static/config/setup.json'
import { constants } from '../ressources/static/constants.js'

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
const SLOW_MOTION_DURATION = 600 //ms

const FRICTION = 0.01
const STATIC_FRICTION = 0.25
const AIR_FRICTION = 0.01

const COLLISION = constants.physics.collision

const armOffsetX = 5
const armHeight = 10


function renderPoly(x: number, y: number, vertices: any[]): void {
    const pointArray = vertices.map(vertices => new Point(vertices.x, vertices.y))
    Renderer.poly(pointArray)
}

/*
ENTITY BODY
________
| head | 1/3
|      |
| body | 1/3
|      |
| legs | 1/3
________
*/

abstract class Entity {
    id: number
    name: string
    pos: Vector2
    velocity: Vector2
    width: number
    height: number

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
    isCrouch: boolean
    isMoving: boolean
    dir: string

    jumpSensor: Matter.Body
    playerHead: Matter.Body
    playerBody: Matter.Body
    playerArm: Matter.Body
    insideLegs: Matter.Body
    playerLegs: Matter.Body
    armConstraint: Matter.Constraint
    idArray: Array<number>
    crouchOffset: number

    health: number
    alive: boolean


    constructor(name: string, initialPos: Vector2, width: number, height: number, env: Env,) {
        this.name = name
        this.pos = initialPos
        this.width = width
        this.height = height
        this.env = env
        this.id = this.env.entities.length + 1
        this.velocity = new Vector2(0, 0)
        this.health = 100
        this.alive = this.health > 0

        this.groundForce = 0.04 // run force on ground
        this.airForce = 0.01    // run force in air
        this.mass = 5
        this.jumpForce = 0.3
        this.stoppingFriction = 0.70
        this.onAir = false
        this.isMoving = false
        this.isCrouch = false

        this.createBody()
        this.dir = this.env.cursorPosition.x > this.body.position.x ? 'left' : 'right'

        Matter.Body.setMass(this.body, this.mass)
    }

    createBody(): void {
        const headY = this.height * 1 / 3
        const bodyHeight = this.height * 2 / 3
        const legsOffsetY = this.height * 1 / 3

        this.crouchOffset = parseFloat((this.height * 1.5 / 6).toFixed(2))

        this.playerHead = Matter.Bodies.circle(this.pos.x, this.pos.y - headY, this.width / 2, { label: 'PlayerCircle' })
        this.playerBody = Matter.Bodies.rectangle(this.pos.x, this.pos.y, this.width, bodyHeight / 2, { label: 'PlayerRect' })
        this.insideLegs = Matter.Bodies.rectangle(this.pos.x, this.pos.y + legsOffsetY, this.width, bodyHeight / 2, { label: 'PlayerRect' })
        this.jumpSensor = Matter.Bodies.rectangle(this.pos.x, this.pos.y + this.height / 2, this.width, 4, {
            sleepThreshold: 9e10,
            label: 'PlayerRect',
            isSensor: true
        })
        this.playerLegs = Matter.Body.create({
            parts: [this.insideLegs, this.jumpSensor],
            label: 'ComposedBody',
            restitution: 0.2
        })

        this.playerArm = Matter.Bodies.rectangle(this.pos.x + this.width - armOffsetX, this.playerBody.position.y, this.width * 2 / 3, armHeight, {
            label: 'PlayerRect',
            inertia: Infinity,
            sleepThreshold: Infinity,
            collisionFilter: {
                group: COLLISION.collisionGroup.arm,
                category: COLLISION.collisionCategory.arm,
                mask: COLLISION.collisionMask.arm
            }
        })

        let parts: Array<Matter.Body> = [this.playerBody, this.playerHead, this.playerLegs, this.jumpSensor]
        this.idArray = parts.concat([this.playerArm]).map(body => body.id)

        this.body = Matter.Body.create({
            parts: [this.playerBody, this.playerHead, this.playerLegs, this.jumpSensor],
            inertia: Infinity,
            friction: FRICTION,
            frictionAir: AIR_FRICTION,
            frictionStatic: STATIC_FRICTION,
            restitution: 0.14,
            sleepThreshold: Infinity,
            collisionFilter: {
                group: COLLISION.collisionGroup.body,
                category: COLLISION.collisionCategory.body,
                mask: COLLISION.collisionMask.body
            }
        })

        this.armConstraint = Matter.Constraint.create({
            bodyA: this.body,
            pointA: { x: this.width / 2 - armOffsetX, y: 0 },
            bodyB: this.playerArm,
            pointB: { x: -this.width / 2, y: 0 },
            stiffness: 1,
            length: 0
        })

        this.composite = Matter.Composite.create({
            label: 'Player',
            bodies: [this.body, this.playerArm],
            constraints: [this.armConstraint]
        })
    }

    flipDirection(): void {
        this.dir = this.dir === 'left' ? 'right' : 'left'
        const sign = this.dir === 'left' ? +1 : -1
        Matter.Composite.remove(this.composite, this.armConstraint)
        Matter.Body.setAngle(this.playerArm, 0)
        this.armConstraint = Matter.Constraint.create({
            bodyA: this.body,
            pointA: { x: sign * this.width / 2 - sign * armOffsetX, y: 0 },
            bodyB: this.playerArm,
            pointB: { x: -this.width / 2, y: 0 },
            stiffness: 1,
            length: 0
        })
        Matter.Composite.add(this.composite, this.armConstraint)
        Matter.Body.setAngle(this.playerArm, this.angle)
        Matter.Body.setInertia(this.body, Infinity)
        Matter.Body.setInertia(this.playerArm, Infinity)
    }

    distTo(player: Entity): number {
        const deltaX: number = this.pos.x - player.pos.x
        const deltaY: number = this.pos.y - player.pos.y
        return Math.sqrt(deltaX ** 2 + deltaY ** 2)
    }

    getCloserPlayer(): Entity | boolean {
        const closerPlayer: Entity[] = this.env.entities.sort((a, b) => {
            return this.distTo(a) - this.distTo(b)
        })
        return closerPlayer[1] // closerPlayer[0] is the player
    }

    hitBy(shot: Shot, bodyPart: Matter.Body): void {
        this.health -= shot.damage
        if (this.health < 0) {
            this.health = 0
        }
        this.env.removeShot(shot)
        const PG: ParticuleGenerator = new ParticuleGenerator(5, this.body.position as Vector2, 200, this.env)

    }

    checkDeath(): void {
        this.alive = !((this.health <= 0) || (this.pos.y > this.env.mapHeight))
        if (!this.alive) console.log(`${this.name} vient de mourir`)
    }

    render(): void {
        // @ts-ignore
        Renderer.rectFromPoints(this.body.bounds.min.x, this.body.bounds.min.y, this.body.bounds.max.x, this.body.bounds.max.y, { strokeStyle: 'red' })
        this.composite.bodies.forEach(body => {
            body.parts.forEach(part => {
                switch (part.label) {
                    case 'PlayerRect':
                        renderPoly(part.position.x, part.position.y, part.vertices)
                        break
                    case 'PlayerCircle':
                        Renderer.circle(part.position.x, part.position.y, (<any>part).circleRadius)
                        break
                    case 'ComposedBody':
                        renderPoly(part.position.x, part.position.y, part.vertices)
                        break
                }
            })
        })
    }

    update(): void {
        if (!this.alive) return

        /* Colision Detection */
        this.onAir = this.env.objects.filter(obj => {
            let collision = (Matter as any).SAT.collides(obj.body, this.jumpSensor)
            return collision.collided && collision.axisNumber === 0
        }).length === 0

        this.onAir = false

        if ((!this.isMoving || this.body.speed > MAX_SPEED) && !this.onAir) {
            Matter.Body.setVelocity(this.body, {
                x: this.body.velocity.x * this.stoppingFriction,
                y: this.body.velocity.y * this.stoppingFriction
            })
        } else {
            this.isMoving = false
        }

        this.pos = new Vector2(this.body.position.x, this.body.position.y)
        this.checkDeath()
    }

}

class Player extends Entity {
    public cameraFocus: boolean = false
    private wallSlide: boolean
    private wallSlideSide: string
    private nbJump: number
    public weapon: Weapon

    constructor(name: string, x: number, y: number, width: number, height: number, env: Env, cameraFocus: boolean = false) {
        super(name, new Vector2(x + width / 2, y + height / 2), width, height, env)
        this.cameraFocus = cameraFocus

        this.nbJump = 0
        this.wallSlide = false
        this.wallSlideSide = 'no-collision'

        this.weapon = new AR(this)
        this.env.events.push(new DOMEvent('mousedown', () => this.weapon.shoot()))
        this.env.events.push(new DOMEvent('mouseup', () => this.weapon.stopShoot()))

        this.env.addEntity(this)
        this.initSetup(setup)
    }

    initSetup(setup): void {
        Object.keys(setup.keybind).forEach(key => {
            let value: string = setup.keybind[key]
            if (typeof value === 'string') {
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
        kd.F.press(() => this.slowMotion())
        kd.E.press(() => this.autoShoot())
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
            Matter.Body.set(this.body, 'airFriction', AIR_FRICTION / 3)
            this.isCrouch = true
        }
    }

    uncrouch(): void {
        if (this.isCrouch) {
            Matter.Body.translate(this.playerLegs, { x: 0, y: this.crouchOffset })
            Matter.Body.set(this.body, 'airFriction', AIR_FRICTION)
            this.isCrouch = false
        }
    }

    autoShoot(): void {
        const target: Entity | boolean = this.getCloserPlayer()
        if (target) {
            this.lookAt((<Entity>target).playerHead.position as Vector2)
            this.weapon.singleShoot()
        }
    }

    slowMotion(): void {
        const slowMotionFactor: number = 0.33
        if (this.env.timescale === 1) {
            this.env.changeTimeScale(slowMotionFactor)
            const cd: Cooldown = new Cooldown(SLOW_MOTION_DURATION, () => this.env.changeTimeScale(1))
        }

    }

    lookAt(position: Vector2): void {
        this.angle = Math.atan2(
            position.y - this.pos.y,
            position.x - this.pos.x
        )

        let anchorArmVector: Vector2 = new Vector2(0, 0)
        if (this.dir === 'right') {
            anchorArmVector = { x: this.body.position.x + this.width / 2 - armOffsetX, y: this.body.position.y } as Vector2
        } else if (this.dir === 'left') {
            anchorArmVector = { x: this.body.position.x - this.width / 2 + armOffsetX, y: this.body.position.y } as Vector2
        }
        const targetAngle = Matter.Vector.angle(anchorArmVector, position)
        const flipAngle = Matter.Vector.angle(this.body.position, position);
        (<any>Matter).Body.rotate(this.playerArm, targetAngle - this.playerArm.angle, anchorArmVector)
        const dirFactor = this.dir === 'left' ? -1 : +1
        if (Math.cos(this.angle) * dirFactor > 0) {
            this.flipDirection()
        }
    }

    onGround(): void {
        this.nbJump = 0
    }


    update(): void {
        if (!this.alive) return
        this.lookAt(this.env.cursorPosition)

        /* Collision Detection */
        this.onAir = this.env.objects.filter(obj => {
            let collision = (Matter as any).SAT.collides(obj.body, this.jumpSensor)
            return collision.collided && collision.axisNumber === 0
        }).length === 0

        let collidingWall = this.env.objects.filter(obj => {
            let collision = (Matter as any).SAT.collides(obj.body, this.jumpSensor)
            if (collision.collided && collision.axisNumber === 1) {
                this.wallSlideSide = collision.bodyA.position.x > collision.bodyB.position.x ? 'left' : 'right'
                return true
            }
            return false
        }).length !== 0 && this.body.velocity.y > 0

        this.wallSlide = collidingWall && this.isMoving

        /* Collision consequences*/
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
        this.pos = new Vector2(this.body.position.x, this.body.position.y)
        this.checkDeath()
    }

    render(): void {
        super.render()
        const debugArray = [
            `motion: ${this.body.motion.toFixed(3)}`,
            `speed: ${this.body.speed.toFixed(3)}`,
            `velocity: {x: ${this.body.velocity.x.toFixed(0)}, y: ${this.body.velocity.y.toFixed(0)}}`,
            `position: {x: ${this.body.position.x.toFixed(0)}, y: ${this.body.position.y.toFixed(0)}}`,
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
            `number of bodies: ${Matter.Composite.allBodies(this.env.world).length}`
        ]
        debugArray.forEach((text, i) => Renderer.text(text, 10, 15 * (i + 1)))
    }
}


export { Entity, Player }
