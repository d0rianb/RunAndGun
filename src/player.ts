import * as Matter from 'matter-js'
import * as kd from 'keydrown'
import { SolidObject, Vector } from './object'
import { Env } from './Env'
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

class Player extends SolidObject {
	id: number
	name: string
	cursor: Vector
	texture: string
	direction: string

	constructor(name: string, grid_x: number, grid_y: number, grid_width: number, grid_height: number, env: Env, ...options) {
		super('rect', grid_x, grid_y, grid_width, grid_height, false, env, ...options)
		this.name = name
		this.cursor = this.env.cursorPosition
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
				kd_key.down(() => this.move({ x: .01, y: 0 }))
				break
			case 'move_backward':
				kd_key.down(() => this.move({ x: -.01, y: 0 }))
				break
			case 'jump':
				kd_key.down(() => this.move({ x: 0, y: -.01 }))
				break
			case 'crouch':
				kd_key.down(() => console.log('s'))
				break
			case 'dash':
				kd_key.down(() => console.log('shift'))
				break
			case 'reload':
				kd_key.down(() => console.log('r'))
				break

		}
	}

	update(): void {
		this.cursor = this.env.cursorPosition
	}

	render(): void { }
}

export { Player }
