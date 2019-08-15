class RenderObject {
	type: string
	x: number
	y: number
	width?: number
	height?: number
	radius?: number

	constructor(type: string, x: number, y: number, width?: number, height?: number) {
		this.type = type
		this.x = x
		this.y = y

		switch (this.type) {
			case 'rect':
				this.width = width
				this.height = height
				break;
		}
	}

	render(ctx: CanvasRenderingContext2D): void {
		switch (this.type) {
			case 'rect':
				ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
				break;
		}
	}
}

class Renderer {
	static render(ctx: CanvasRenderingContext2D, object: RenderObject) {
		object.render(ctx)
	}
}

export { Renderer, RenderObject }
