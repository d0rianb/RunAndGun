// import { Vector } from './object'

// @ts-ignore
import { default as CENTER } from '../ressources/assets/tiles/CENTER.png'
// @ts-ignore
import { default as UP } from '../ressources/assets/tiles/UP.png'
// @ts-ignore
import { default as END } from '../ressources/assets/tiles/END.png'
// @ts-ignore
import { default as HPIPE } from '../ressources/assets/tiles/H-PIPE.png'
// @ts-ignore
import { default as PLAYER_BODY } from '../ressources/assets/sprite/player/player_body.png'
// @ts-ignore
import { default as PLAYER_HEAD } from '../ressources/assets/sprite/player/player_head.png'


class Vector2 {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

const V_NULL = new Vector2(0, 0)

class Texture {
    image: HTMLImageElement
    rotation: number // radians
    offset: Vector2

    constructor(source: string, rotation: number = 0, offset: Vector2 = V_NULL) {
        this.image = new Image()
        this.image.src = source
        this.rotation = rotation
        this.offset = offset
    }
}

class Sprite extends Texture {
    constructor(source: string, offset?: Vector2) {
        super(source, 0, offset)
    }
}

const UP_TEXTURE = new Texture(UP)
const DOWN_TEXTURE = new Texture(UP, Math.PI)
const LEFT_TEXTURE = new Texture(UP, -Math.PI / 2)
const RIGHT_TEXTURE = new Texture(UP, Math.PI / 2)
const MIDDLE_TEXTURE = new Texture(CENTER)
const HPIPE_TEXTURE = new Texture(HPIPE)
const VPIPE_TEXTURE = new Texture(HPIPE, Math.PI / 2)
const TOP_END_TEXTURE = new Texture(END)
const BOTTOM_END_TEXTURE = new Texture(END, Math.PI)
const RIGHT_END_TEXTURE = new Texture(END, Math.PI / 2)
const LEFT_END_TEXTURE = new Texture(END, -Math.PI / 2)

const PLAYER_BODY_SPRITE = new Sprite(PLAYER_BODY)
const PLAYER_HEAD_SPRITE = new Sprite(PLAYER_HEAD, new Vector2(-7, 0))

let TILE_TEXTURE = {
    UP: UP_TEXTURE,
    DOWN: DOWN_TEXTURE,
    LEFT: LEFT_TEXTURE,
    RIGHT: RIGHT_TEXTURE,
    MIDDLE: MIDDLE_TEXTURE,
    HPIPE: HPIPE_TEXTURE,
    VPIPE: VPIPE_TEXTURE,
    TOP_END: TOP_END_TEXTURE,
    BOTTOM_END: BOTTOM_END_TEXTURE,
    RIGHT_END: RIGHT_END_TEXTURE,
    LEFT_END: LEFT_END_TEXTURE
}


export { Texture, Sprite, TILE_TEXTURE, PLAYER_BODY_SPRITE, PLAYER_HEAD_SPRITE }
