// @ts-ignore
import { default as CENTER } from '../ressources/assets/tiles/CENTER.png'
// @ts-ignore
import { default as UP } from '../ressources/assets/tiles/UP.png';
// @ts-ignore
import { default as END } from '../ressources/assets/tiles/END.png';
// @ts-ignore
import { default as HPIPE } from '../ressources/assets/tiles/H-PIPE.png';
// @ts-ignore
import { default as PLAYER } from '../ressources/assets/sprite/player.png';

class Texture {
	image: HTMLImageElement
	rotation: number // radians

	constructor(source: string, rotation: number = 0) {
		this.image = new Image()
		this.image.src = source
		this.rotation = rotation
	}
}

class Sprite extends Texture {
	constructor(source: string) {
		super(source, 0)
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

const PLAYER_SPRITE = new Sprite(PLAYER)

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


export { Texture, Sprite, TILE_TEXTURE, PLAYER_SPRITE }
