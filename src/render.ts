interface RenderOptions {
	width?: number,
	height?: number,
	radius?: number,
	color?: string,
	content?: string | string[],
	font?: string,
	rounded?: boolean,
	roundRadius?: number // px
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
				this.options.rounded = true
				this.options.roundRadius = 7.5
				break
		}
	}

	render(ctx: CanvasRenderingContext2D, wireframe: boolean = false): void {
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
				}
				break
			case 'circle':
				ctx.beginPath()
				ctx.arc(this.x, this.y, this.options.radius, 0, 2 * Math.PI)
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
		}
		ctx.stroke()
		if (!wireframe) ctx.fill()

	}
}

class Renderer {
	static render(ctx: CanvasRenderingContext2D, object: RenderObject, wireframe: boolean = false) {
		object.render(ctx, wireframe)
	}
}

export { Renderer, RenderObject, RenderOptions }
