import * as Matter from 'matter-js'
import { Env } from './env'
import { Map } from './map'
import { RenderObject, RenderOptions } from './render'

function isNumber(value: any): boolean {
	return (value != null) && !isNaN(Number(value.toString()))
}

class Vector {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}
}

interface ObjectOptions extends Matter.IChamferableBodyDefinition {
	zIndex?: number
}

interface ObjectRenderOptions extends Matter.IBodyRenderOptions {
	zIndex?: number
}

class SolidObject {
	id: number
	type: string
	pos: Vector
	velovity: Vector
	width: number
	height: number
	isStatic: boolean
	body: Matter.Body
	env: Env
	grid_width: number
	grid_height: number
	round: number | boolean

	/* Initalize the object with relative position and size */
	constructor(type: string, grid_x: number, grid_y: number, grid_width: number, grid_height: number, isStatic: boolean, env: Env, options?: ObjectOptions) {
		this.type = type
		this.isStatic = isStatic
		this.env = env

		this.width = grid_width * this.env.relToAbs.x
		this.height = grid_height * this.env.relToAbs.y
		this.pos = new Vector(grid_x * this.env.relToAbs.x + this.width / 2, grid_y * this.env.relToAbs.y + this.height / 2)
		this.velovity = new Vector(0, 0)

		this.grid_width = grid_width
		this.grid_height = grid_height

		this.round = <number>options.chamfer.radius || false

		switch (this.type) {
			case 'rect':
				this.body = Matter.Bodies.rectangle(this.pos.x, this.pos.y, this.width, this.height, Object.assign({ isStatic: this.isStatic }, options));
				(<ObjectRenderOptions>this.body.render).zIndex = this.isStatic ? 2 : 1
				this.id = this.body.id
				break
			case 'circle':
				this.body = Matter.Bodies.circle(this.pos.x, this.pos.y, (this.width + this.height) / 2, Object.assign({ isStatic: this.isStatic }, options));
				(<ObjectRenderOptions>this.body.render).zIndex = this.isStatic ? 2 : 1
				this.id = this.body.id
				break
		}
		this.env.objects.push(this)
		Matter.World.add(this.env.world, this.body)
		// console.log(this)
	}

	move(vec: Vector): void {
		Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, vec)
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
			switch (this.type) {
				case 'rect':
					return new RenderObject(
						'poly',
						this.body.position.x,
						this.body.position.y,
						<RenderOptions>{
							vertices: this.body.vertices,
							zIndex: this.isStatic ? 2 : 1
						}
					)
					break
				case 'circle':
					return new RenderObject(
						'circle',
						this.body.position.x,
						this.body.position.y,
						<RenderOptions>{ radius: (<any>this.body).circleRadius }
					)
					break
			}
		}
		return false
	}

	update(): void {
		this.pos = <Vector>this.body.position
		this.velovity = <Vector>this.body.velocity
	}
}

export { SolidObject, Vector, ObjectRenderOptions }
