import path from 'path'

interface JSONSizeObject {
	width: string,
	height: string
}

interface SizeObject {
	width: number,
	height: number
}

interface MapFile {
	name: string,
	dimensions: JSONSizeObject,
	grid: JSONSizeObject,
	objects: Array<string>
}

class Map {
	public objects: Array<String>
	private file: MapFile
	public grid: SizeObject
	public dimensions: SizeObject

	constructor(file: MapFile) {
		this.file = file
		this.grid = <SizeObject>{
			width: parseInt(this.file.grid.width),
			height: parseInt(this.file.grid.height)
		}
		this.objects = this.file.objects

	}
}

export { Map, SizeObject }
