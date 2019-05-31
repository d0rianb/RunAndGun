class Vector {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	add(other: Vector) {
		return Vector(this.x + other.x, this.y + other.y)
	}
}

class Object {
	id: number
	pos: Vector
	width: number
	height: number
	static: boolean
	weight: number = 1
	velocity: Vector = Vector(0, 0)

	constructor(id: number, pos: Vector, width: number, height: number, static: boolean, weight: number = 1) {
		this.id = id
		this.pos = pos
		this.width = width
		this.height = height
		this.static = static
		this.weight = weight ? !this.static : Infinity
	}

	update() { }

	render() { }
}
