import { SolidObject } from './object'
import path from 'path'

interface SizeObject {
	width: string,
	height: string
}

interface MapFile {
	name: string,
	dimensions: SizeObject,
	grid: SizeObject,
	objects: Array<string>
}

class Map {
	public objects: Array<SolidObject>
	private file: MapFile

	constructor(file: MapFile) {
		this.file = file

		// TODO : recuperer les objects, calculer leurs tailles relatives, puis leur taille absolue et
		// la communiquer à l'Env; uniquement la taille absolue changera lorsque la fenetre sera redimensionnée
	}

	parseData(json: JSON): Array<SolidObject | any> {
		console.log(json)
		return []
	}
}

export { Map }
