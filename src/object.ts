import * as Matter from 'matter-js'
import { Env } from './env'
import { Map } from './map'
import { RenderObject } from './render'

class Vector {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}
}

class SolidObject {
	id: number
	type: string
	pos: Vector
	width: number
	height: number
	isStatic: boolean
	body: Matter.Body
	env: Env
	grid_width: number
	grid_height: number

	/* Initalize the object with relative position and size */
	constructor(type: string, grid_x: number, grid_y: number, grid_width: number, grid_height: number, isStatic: boolean, env: Env) {
		this.type = type
		this.isStatic = isStatic
		this.env = env

		this.pos = new Vector(grid_x * this.env.relToAbs.x, grid_y * this.env.relToAbs.y)
		this.width = grid_width * this.env.relToAbs.x
		this.height = grid_height * this.env.relToAbs.y

		this.grid_width = grid_width
		this.grid_height = grid_height

		switch (this.type) {
			case 'rect':
				this.body = Matter.Bodies.rectangle(this.pos.x, this.pos.y, this.width, this.height, { isStatic: this.isStatic })
				this.id = this.body.id
				break
		}
		this.env.objects.push(this)
		Matter.World.add(this.env.world, this.body)
		console.log(this)
	}

	resize(): void {
		switch (this.type) {
			case 'rect':
				let new_x: number = this.body.position.x / this.env.oldRelToAbs.x * this.env.relToAbs.x
				let new_y: number = this.body.position.y / this.env.oldRelToAbs.y * this.env.relToAbs.y
				this.body = Matter.Bodies.rectangle(
					new_x,
					new_y,
					this.grid_width * this.env.relToAbs.x,
					this.grid_height * this.env.relToAbs.y,
					{ isStatic: this.isStatic })
				break
		}
	}

	toRender(): RenderObject | boolean {
		if (this.body.render.visible) {
			let { min, max } = <any>this.body.bounds
			return new RenderObject(
				this.type,
				this.body.position.x,
				this.body.position.y,
				max.x - min.x,
				max.y - min.y
			)
		}
		return false
	}

	update() { }

	render() { }
}

export { SolidObject, Vector }
