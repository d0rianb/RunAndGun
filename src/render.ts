interface RenderObject {
	type: string,
	x: number,
	y: number
	width?: number,
	height?: number,
	radius?: number
}

class Renderer {
	static render(ctx: CanvasRenderingContext2D, object: RenderObject) {
		switch (object.type) {

		}
	}
}

export { Renderer, RenderObject }
