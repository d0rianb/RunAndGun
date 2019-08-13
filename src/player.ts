import * as kd from 'keydrown'
import { SolidObject, Vector } from './object'
import { default as setup } from '../ressources/config/setup.json'

class Player extends SolidObject {
	id: number
	name: string
	texture: string
	direction: string

	constructor(name: string, grid_x: number, grid_y: number, grid_width: number, grid_height: number, env) {
		super('rect', grid_x, grid_y, grid_width, grid_height, false, env)
		this.name = name
		this.initSetup(setup)
	}

	initSetup(setup): void {
		// kd.Key(setup.keybind.move_forward.charCodeAt(0)).down(e => console.log(e))
	}

	update(): void { }

	render(): void { }
}

export { Player }
