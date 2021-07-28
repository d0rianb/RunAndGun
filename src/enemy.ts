import * as Matter from 'matter-js'
import { Entity } from './player'
import { Env } from './env'
import { Weapon, AR, SMG, Shot } from './weapon'

import { constants } from '../ressources/static/constants.js'

import { Vector2 } from 'unrail-engine'

const MAX_SPEED = 12
const SECOND_JUMP_COEFF = 0.8

// TODO: move to the constant file
const FRICTION = 0.01
const STATIC_FRICTION = 0.25
const AIR_FRICTION = 0.01

const COLLISION = constants.physics.collision

const armOffsetX = 5

class Enemy extends Entity {

    constructor(name: string, x: number, y: number, width: number, height: number, env: Env) {
        super(name, new Vector2(x + width / 2, y + height / 2), width, height, env)
        this.env.addEntity(this)
    }
}

export { Enemy }
