class Vector {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	add(other: Vector) {
		return new Vector(this.x + other.x, this.y + other.y)
	}
}

class SolidObject { // extends from Matter object ?
	id: number
	type: string
	pos: Vector
	width: number
	height: number
	isStatic: boolean
	weight: number = 1
	velocity: Vector = new Vector(0, 0)

	constructor(id: number, type: string, pos: Vector, width: number, height: number, isStatic: boolean, weight: number = 1) {
		this.id = id
		this.type = type
		this.pos = pos
		this.width = width
		this.height = height
		this.isStatic = isStatic
		this.weight = !this.isStatic ? weight : Infinity
	}

	update() { }

	render() { }
}

class RelativeObject {
	id: number
	type: string
	x: number
	y: number
	width: number
	height: number
	constructor(id: number, type: string, x: string, y: string, width: string, height: string) {
		this.id = id
		this.type = type
		this.x = parseInt(x)
		this.y = parseInt(y)
		this.width = parseInt(width)
		this.height = parseInt(height)
	}

	toSolid(object: RelativeObject, env: object): SolidObject | any {

	}


}


export { SolidObject, RelativeObject, Vector }
