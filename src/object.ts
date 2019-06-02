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

class Object {
	id: number
	pos: Vector
	width: number
	height: number
	isStatic: boolean
	weight: number = 1
	velocity: Vector = new Vector(0, 0)

	constructor(id: number, pos: Vector, width: number, height: number, isStatic: boolean, weight: number = 1) {
		this.id = id
		this.pos = pos
		this.width = width
		this.height = height
		this.isStatic = isStatic
		this.weight = !this.isStatic ? weight : Infinity
	}

	update() { }

	render() { }
}

export { Object, Vector }
