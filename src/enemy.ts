import * as Matter from 'matter-js'
import { SolidObject, Vector } from './object'
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
		this.env.addEntity(this)

	}
}

export { Enemy }
