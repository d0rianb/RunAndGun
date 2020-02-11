import * as Matter from 'matter-js'
import { Env } from './env'
import { Player } from './player'
import { Vector } from './object'
import { SizeObject } from './map'
import { Renderer, RenderObject, RenderOptions } from './render'
import { default as colors } from '../ressources/static/config/colors.json'

class Interface {
    player: Player
    env: Env
    objects: InterfaceObject[]

    font: string

    constructor(player: Player, env: Env) {
        this.player = player
        this.env = env
        this.objects = []
    }

    render(): void {

    }
}

class InterfaceObject {
    name: string
    position: Vector
    size: SizeObject

}

export { Interface }
