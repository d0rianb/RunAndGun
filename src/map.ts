import { SolidObject, RelativeObject } from './object'
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
	public objects: Array<SolidObject>
	private file: MapFile
	public grid: SizeObject
	public dimensions: SizeObject

	constructor(file: MapFile) {
		this.file = file
		this.grid = <SizeObject>{
			width: parseInt(this.file.grid.width),
			height: parseInt(this.file.grid.height)
		}
		this.objects = this.parseData(this.file.objects)

		// TODO : recuperer les objects, calculer leurs tailles relatives, puis leur taille absolue et
		// la communiquer à l'Env; uniquement la taille absolue changera lorsque la fenetre sera redimensionnée
	}

	parseData(objects: Array<String>): Array<SolidObject | any> {
		let relativeObjects: RelativeObject[] = []
		for (let [index, object] of objects.entries()) {
			let parseObject: string[] = object.split(' ')
			let relativeObj = new RelativeObject(index, parseObject[0], parseObject[1], parseObject[2], parseObject[3], parseObject[4])
			relativeObjects.push(relativeObj)
		}
		return relativeObjects
	}
}

export { Map }
