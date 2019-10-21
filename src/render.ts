import { Vector } from './object'
import { Camera } from './env'

interface RenderOptions {
	width?: number,
	height?: number,
	radius?: number,
	color?: string,
	content?: string | string[],
	font?: string,
	rounded?: boolean,
	roundRadius?: number, // px
	x2?: number,
	y2?: number,
	vertices?: Vector[],
	interface?: boolean,
}


class RenderObject {
	type: string
	x: number
	y: number
	options: RenderOptions
	width?: number
	height?: number

	constructor(type: string, x: number, y: number, options: RenderOptions) {
		this.type = type
		this.x = x
		this.y = y
		this.options = options

		switch (this.type) {
			case 'rect':
				this.width = this.options.width
				this.height = this.options.height
				break
		}
	}

	render(ctx: CanvasRenderingContext2D, camera: Camera, wireframe: boolean = false): void {
		if (!this.options.interface) {
			this.x -= camera.x
			this.y -= camera.y
			if (this.options.hasOwnProperty('x2') && this.options.hasOwnProperty('y2')) {
				this.options.x2 -= camera.x
				this.options.y2 -= camera.y
			}
		}
		switch (this.type) {
			case 'rect':
				if (this.options.rounded) {
					ctx.lineJoin = 'round'
					ctx.lineWidth = wireframe ? 1 : this.options.roundRadius
					if (!wireframe) {
						ctx.fillRect(
							this.x - this.width / 2 + (this.options.roundRadius * .5),
							this.y - this.height / 2 + (this.options.roundRadius * .5),
							this.width - this.options.roundRadius,
							this.height - this.options.roundRadius
						)
					}
					ctx.strokeRect(
						this.x - this.width / 2 + (this.options.roundRadius * .5),
						this.y - this.height / 2 + (this.options.roundRadius * .5),
						this.width - this.options.roundRadius,
						this.height - this.options.roundRadius
					)
				} else {
					if (!wireframe) ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
					ctx.strokeRect(
						this.x - this.width / 2,
						this.y - this.height / 2,
						this.width,
						this.height
					)
				}
				break
			case 'circle':
				ctx.beginPath()
				ctx.arc(this.x, this.y, this.options.radius, 0, 2 * Math.PI)
				ctx.closePath()
				break
			case 'poly':
				let vertices = this.options.vertices
				ctx.beginPath()
				ctx.moveTo(vertices[0].x - camera.x, vertices[0].y - camera.y)
				for (var j = 1; j < vertices.length; j++) {
					ctx.lineTo(vertices[j].x - camera.x, vertices[j].y - camera.y)
				}
				ctx.closePath()
				break
			case 'text':
				ctx.font = this.options.font || '16px Roboto'
				if (typeof this.options.content === 'string') {
					ctx.fillText(this.options.content, this.x, this.y)
				} else if (typeof this.options.content === 'object') {
					let i = 0
					const lineSpace = 16
					this.options.content.forEach(text => {
						ctx.fillText(text, this.x, this.y + i * lineSpace)
						i++
					})
				}
			case 'line':
				ctx.beginPath()
				ctx.moveTo(this.x, this.y)
				ctx.lineTo(this.options.x2, this.options.y2)
				ctx.closePath()

		}
		ctx.stroke()
		if (!wireframe) ctx.fill()

	}
}

class Renderer {
	static render(ctx: CanvasRenderingContext2D, object: RenderObject, camera: Camera, wireframe: boolean = false) {
		object.render(ctx, camera, wireframe)
	}
}

export { Renderer, RenderObject, RenderOptions }
