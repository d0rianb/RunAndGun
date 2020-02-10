import * as Matter from 'matter-js'
import { Vector } from './object'
import { Entity } from './player'
import { Env } from './env'
import { RenderObject, RenderOptions } from './render'
import { Weapon, AR, SMG, Shot } from './weapon'

const MAX_SPEED = 12
const SECOND_JUMP_COEFF = 0.8

const FRICTION = 0.01
const STATIC_FRICTION = 0.25
const AIR_FRICTION = 0.01

const BODY_COLLISION_FILTER = 0x0010
const ARM_COLLISION_FILTER = 0x0011

const armOffsetX = 5

class Enemy extends Entity {

    constructor(name: string, x: number, y: number, width: number, height: number, env: Env) {
        super(name, new Vector(x + width / 2, y + height / 2), width, height, env)
        this.createBody()
        this.env.addEntity(this)
    }

    createBody(): void {
        const headY = this.height * 1 / 3
        const armHeight = 10
        const bodyHeight = this.height * 2 / 3
        const legsOffsetY = this.height * 1 / 3

        this.crouchOffset = parseFloat((this.height * 1.5 / 6).toFixed(2))

        this.playerHead = Matter.Bodies.circle(this.pos.x, this.pos.y - headY, this.width / 2, { label: 'PlayerCircle', render: { fillStyle: 'red' } })
        this.playerBody = Matter.Bodies.rectangle(this.pos.x, this.pos.y, this.width, bodyHeight / 2, { label: 'PlayerRect', render: { fillStyle: 'blue' } })
        this.insideLegs = Matter.Bodies.rectangle(this.pos.x, this.pos.y + legsOffsetY, this.width, bodyHeight / 2, { label: 'PlayerRect', render: { fillStyle: 'green' } })
        this.jumpSensor = Matter.Bodies.rectangle(this.pos.x, this.pos.y + this.height / 2, this.width, 4, {
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
    }
}

export { Enemy }
