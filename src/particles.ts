import { Env } from './env'
import { Vector } from './object'
import { RenderObject, RenderOptions } from './render'

const GRAVITY: number = 1 // N
const MAX_SPEED: number = 5

class Particles {
	pos: Vector
	velocity: Vector
	color: string
	angle: number
	radius: number
	opacity: number

	constructor(pos: Vector) {
		this.pos = { x: pos.x, y: pos.y }
		this.angle = Math.PI / 2 + Math.random() * Math.PI
		this.velocity = new Vector(Math.random() * MAX_SPEED * Math.cos(this.angle), Math.random() * MAX_SPEED * Math.sin(this.angle))
		this.color = 'red'
		this.opacity = Math.random() * 255
		this.radius = 3
	}

	update(): void {
		this.velocity.y += GRAVITY
		this.pos.x += this.velocity.x
		this.pos.y += this.velocity.y
	}

	render(env: Env): void {
		let renderObject: RenderObject = new RenderObject('circle', this.pos.x, this.pos.y, <RenderOptions>{ radius: this.radius })
		env.addToRenderingStack(renderObject)
	}
}

class Blood extends Particles {

}

class ParticuleGenerator {

}


export { Particles, Blood }
