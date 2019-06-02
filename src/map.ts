import { Object } from './object'
import * as fs from 'fs'
import * as path from 'path'

/*
* fs ne marche pas avec TypeScript : impssible de récupérer map1.json
*/

class Map {
	public objects: Array<Object>
	private filename: string

	constructor(filename: string) {
		this.filename = filename
		console.log(fs)
		// const fileContent = fs.readFileSync(this.filename, { encoding: 'utf8', flag: 'r' })
		// console.log(JSON.parse(fileContent))

		// TODO : recuperer les objects, calculer leurs tailles relatives, puis leur taille absolue et
		// la communiquer à l'Env; uniquement la taille absolue changera lorsque la fenetre sera redimensionnée

	}
}

export { Map }
