import { Vector } from './object'

import { default as CENTER } from '../ressources/assets/tiles/CENTER.png'
import { default as UP } from '../ressources/assets/tiles/UP.png'
import { default as END } from '../ressources/assets/tiles/END.png'
import { default as CORNER } from '../ressources/assets/tiles/CORNER.png'
import { default as HPIPE } from '../ressources/assets/tiles/H-PIPE.png'
import { default as CUBE } from '../ressources/assets/tiles/CUBE.png'
import { default as PLAYER_BODY } from '../ressources/assets/sprite/player/player_body.png'
import { default as PLAYER_HEAD } from '../ressources/assets/sprite/player/player_head.png'
import { default as BULLET } from '../ressources/assets/sprite/bullet.png'

class Vector2 {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

const V_NULL = new Vector2(0, 0)
const V_UNIT = new Vector2(1, 1)

interface TextureOptions {
    rotation?: number, // radians
    offset?: Vector2,
    scale?: Vector2
}


class Texture {
    image: HTMLImageElement
    rotation: number
    offset: Vector2
    scale: Vector2
    options: TextureOptions

    constructor(source: string, options?: TextureOptions) {
        this.image = new Image()
        this.image.src = source
        this.options = options || {}
        this.rotation = this.options.rotation || 0
        this.offset = this.options.offset || V_NULL
        this.scale = this.options.scale || V_UNIT
    }
}

class Sprite extends Texture {
    constructor(source: string, options?: TextureOptions) {
        super(source, options)
    }
}

const UP_TEXTURE = new Texture(UP)
const DOWN_TEXTURE = new Texture(UP, { rotation: Math.PI })
const LEFT_TEXTURE = new Texture(UP, { rotation: -Math.PI / 2 })
const RIGHT_TEXTURE = new Texture(UP, { rotation: Math.PI / 2 })
const MIDDLE_TEXTURE = new Texture(CENTER)
const HPIPE_TEXTURE = new Texture(HPIPE)
const VPIPE_TEXTURE = new Texture(HPIPE, { rotation: Math.PI / 2 })
const TOP_END_TEXTURE = new Texture(END)
const BOTTOM_END_TEXTURE = new Texture(END, { rotation: Math.PI })
const RIGHT_END_TEXTURE = new Texture(END, { rotation: Math.PI / 2 })
const LEFT_END_TEXTURE = new Texture(END, { rotation: -Math.PI / 2 })
const UP_LEFT_TEXTURE = new Texture(CORNER)
const UP_RIGHT_TEXTURE = new Texture(CORNER, { rotation: Math.PI / 2 })
const BOTTOM_LEFT_TEXTURE = new Texture(CORNER, { rotation: -Math.PI / 2 })
const BOTTOM_RIGHT_TEXTURE = new Texture(CORNER, { rotation: Math.PI })
const CUBE_TEXTURE = new Texture(CUBE)

const PLAYER_BODY_SPRITE = new Sprite(PLAYER_BODY)
const PLAYER_HEAD_SPRITE = new Sprite(PLAYER_HEAD, { offset: new Vector2(-7, 0) })

const BULLET_SPRITE = new Sprite(BULLET, { scale: new Vector2(2, 2) })

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
    LEFT_END: LEFT_END_TEXTURE,
    UP_LEFT: UP_LEFT_TEXTURE,
    UP_RIGHT: UP_RIGHT_TEXTURE,
    DOWN_LEFT: BOTTOM_LEFT_TEXTURE,
    DOWN_RIGHT: BOTTOM_RIGHT_TEXTURE,
    CUBE: CUBE_TEXTURE
}


export { Texture, Sprite, TILE_TEXTURE, PLAYER_BODY_SPRITE, PLAYER_HEAD_SPRITE, BULLET_SPRITE }
