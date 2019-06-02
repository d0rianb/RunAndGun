import { Object, Vector } from './object'

class Player extends Object {
	id: number
	name: string
	pos: Vector
	width: number
	height: number

	constructor(name: string, pos: Vector, width: number, height: number) {
		super(1, pos, width, height, false)
		this.name = name
	}

	update(): void { }

	render(): void { }
}
