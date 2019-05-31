import { Vector, Object } from './object'

class Env {
	public width: number
	public height: number
	public map: Map
	private scale: number = 1
	private timescale: number = 1

	constructor(width: number, height: number, map: Map) {
		this.width = width
		this.height = height
		this.map = map
	}

	update() { }

	render() { }
}
