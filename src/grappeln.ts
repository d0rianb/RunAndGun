import * as Matter from 'matter-js'
import { Env } from './env'
import { Player } from './player'
import { Shot } from './weapon'
import { Cooldown } from './events'

class Rope {
    bodies: Array<Matter.Body>
}

class Grappeln {
    player: Player
    env: Env

    constructor() {

    }
}

export { Grappeln }
