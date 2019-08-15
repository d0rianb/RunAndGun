class RenderObject {
	type: string
	x: number
	y: number
	width?: number
	height?: number
	radius?: number
	rounded?: boolean
	roundRadius?: number // px

	constructor(type: string, x: number, y: number, width?: number, height?: number) {
		this.type = type
		this.x = x
		this.y = y

		switch (this.type) {
			case 'rect':
				this.width = width
				this.height = height
				this.rounded = true
				this.roundRadius = 7.5
				break
		}
	}

	render(ctx: CanvasRenderingContext2D): void {
		switch (this.type) {
			case 'rect':
				if (this.rounded) {
					ctx.lineJoin = 'round'
					ctx.lineWidth = this.roundRadius
					ctx.fillRect(
						this.x - this.width / 2 + (this.roundRadius * .5),
						this.y - this.height / 2 + (this.roundRadius * .5),
						this.width - this.roundRadius,
						this.height - this.roundRadius
					)
					ctx.strokeRect(
						this.x - this.width / 2 + (this.roundRadius * .5),
						this.y - this.height / 2 + (this.roundRadius * .5),
						this.width - this.roundRadius,
						this.height - this.roundRadius
					)
					ctx.stroke()
					ctx.fill()
				} else {
					ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
				}
				break
		}

	}
}

class Renderer {
	static render(ctx: CanvasRenderingContext2D, object: RenderObject) {
		object.render(ctx)
	}
}

export { Renderer, RenderObject }
