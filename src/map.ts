import path from 'path'
import { Env } from './env'
import { MapElement, ObjectOptions } from './object'
import { Grid, Cell } from './grid'

const WALL_COLLISION_FILTER = 0x0010

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
    public grid: Grid
    public tileWidth: number
    public dimensions: SizeObject

    constructor(file: MapFile) {
        this.file = file
        this.tileWidth = Math.min(parseInt(this.file.grid.width), parseInt(this.file.grid.height))
        this.objects = this.file.objects
        this.dimensions = <SizeObject>{
            width: parseInt(this.file.dimensions.width),
            height: parseInt(this.file.dimensions.height)
        }
        this.grid = new Grid(this.dimensions.height, this.dimensions.width)
    }

    init(env: Env): void {
        for (let objString of this.objects) {
            let [type, strObjX, strObjY, strObjW, strObjH, ...objOptions] = objString.split(/[\s,]+/);
            if (type != 'format') {
                let [objX, objY, objW, objH] = [parseInt(strObjX), parseInt(strObjY), parseInt(strObjW), parseInt(strObjH)]
                let options: ObjectOptions = {
                    label: 'Wall',
                    friction: 0.0001,
                    chamfer: { radius: 0 },
                    mass: 5,
                    isStatic: objOptions.includes('static'),
                    frictionStatic: 0.1,
                    collisionFilter: {
                        group: 0,
                        category: WALL_COLLISION_FILTER,
                        mask: 0x010011
                    }
                }
                let mapEl: MapElement = new MapElement(this, type, objX, objY, objW, objH, env, options)
            }
        }
        this.grid.defineNeighboors()
    }
}

export { Map, SizeObject }
