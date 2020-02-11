import * as Matter from 'matter-js'
import { Env } from './env'
import { Map } from './map'
import { Grid, Cell } from './grid'
import { RenderObject, RenderOptions } from './render'
import { Texture, TILE_TEXTURE } from './texture'


function isNumber(value: any): boolean {
    return (value != null) && !isNaN(Number(value.toString()))
}

class Vector {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

interface ObjectOptions extends Matter.IChamferableBodyDefinition {
    zIndex?: number
    isStatic?: boolean
}

interface ObjectRenderOptions extends Matter.IBodyRenderOptions {
    zIndex?: number
}

/*
Texture type :
   ____________________
   |     |      |      |
   |     |  UP  |      |
   ____________________
   |     |      |      |
   |LEFT |MIDDLE| RIGHT|
   ____________________
   |     | DOWN |      |
   |     |      |      |
   ____________________

 - UP
 - DOWN
 - RIGHT
 - LEFT
 - MIDDLE
 - UP_RIGHT
 - UP_LEFT
 - DOWN-RIGHT
 - DOWN-LEFT
*/

class Tile extends Cell {
    parent: MapElement
    texture: Texture
    side: string

    constructor(x: number, y: number, parent: MapElement) {
        super(x, y, 1, 1)
        this.parent = parent
        let cell: Cell = this.parent.map.grid.getCell(this.x, this.y)
        this.neighboor = cell.neighboor
    }

    defineTexture(): void {
        let n = this.neighboor
        let possibleFlags = ['up', 'down', 'right', 'left', 'middle']
        if (n.top && n.top.active) {
            possibleFlags = possibleFlags.filter(el => !el.includes('up'))
        }
        if (n.bottom && n.bottom.active) {
            possibleFlags = possibleFlags.filter(el => !el.includes('down'))
        }
        if (n.right && n.right.active) {
            possibleFlags = possibleFlags.filter(el => !el.includes('right'))
        }
        if (n.left && n.left.active) {
            possibleFlags = possibleFlags.filter(el => !el.includes('left'))
        }
        if (possibleFlags.length === 1) {
            this.side = 'MIDDLE'
        }
        else {
            possibleFlags = possibleFlags.filter(el => !el.includes('middle'))
            this.side = possibleFlags.join('-').toUpperCase()
        }

        switch (this.side) {
            case 'UP':
                this.texture = TILE_TEXTURE.UP
                break
            case 'DOWN':
                this.texture = TILE_TEXTURE.DOWN
                break
            case 'LEFT':
                this.texture = TILE_TEXTURE.LEFT
                break
            case 'RIGHT':
                this.texture = TILE_TEXTURE.RIGHT
                break
            case 'MIDDLE':
                this.texture = TILE_TEXTURE.MIDDLE
                break
            case 'UP-DOWN':
                this.texture = TILE_TEXTURE.HPIPE
                break
            case 'RIGHT-LEFT':
                this.texture = TILE_TEXTURE.VPIPE
                break
            case 'UP-DOWN-LEFT':
                this.texture = TILE_TEXTURE.LEFT_END
                break
            case 'UP-DOWN-RIGHT':
                this.texture = TILE_TEXTURE.RIGHT_END
                break
            case 'UP-RIGHT-LEFT':
                this.texture = TILE_TEXTURE.TOP_END
                break
            case 'DOWN-RIGHT-LEFT':
                this.texture = TILE_TEXTURE.BOTTOM_END
                break
            case 'UP-DOWN-RIGHT-LEFT':
                this.texture = TILE_TEXTURE.CUBE
                break
            case 'UP-LEFT':
                this.texture = TILE_TEXTURE.UP_LEFT
                break
            case 'UP-RIGHT':
                this.texture = TILE_TEXTURE.UP_RIGHT
                break
            case 'DOWN-LEFT':
                this.texture = TILE_TEXTURE.DOWN_LEFT
                break
            case 'DOWN-RIGHT':
                this.texture = TILE_TEXTURE.DOWN_RIGHT
                break
			/* MISS :
				UP-DOWN-RIGHT-LEFT
				CORNERS
			*/
        }
        if (!this.texture) {
            console.log(this.side)
        }
    }

}

class MapElement {
    id: number
    type: string
    map: Map
    pos: Vector
    width: number
    height: number
    isStatic: boolean
    tiles: Array<Tile>
    body: Matter.Body
    env: Env

    /* Initalize the object with relative position and size */
    constructor(map: Map, type: string, gridX: number, gridY: number, gridWidth: number, gridHeight: number, env: Env, options: ObjectOptions) {
        this.type = type
        this.map = map
        this.isStatic = options.isStatic
        this.env = env

        this.width = gridWidth * this.env.relToAbs
        this.height = gridHeight * this.env.relToAbs

        this.tiles = []
        this.pos = new Vector(gridX * this.env.relToAbs + this.width / 2, gridY * this.env.relToAbs + this.height / 2)

        switch (this.type) {
            case 'rect':
                this.body = Matter.Bodies.rectangle(this.pos.x, this.pos.y, this.width, this.height, Object.assign({ isStatic: this.isStatic }, options));
                for (let i = 0; i < gridWidth; i++) {
                    for (let j = 0; j < gridHeight; j++) {
                        let gridCell = this.map.grid.getCell(gridX + i, gridY + j)
                        gridCell.toggleActive(true)
                        this.tiles.push(new Tile(gridCell.x, gridCell.y, this))
                    }
                }
                (<ObjectRenderOptions>this.body.render).zIndex = this.isStatic ? 2 : 1
                this.id = this.body.id
                break
            case 'circle':
                this.body = Matter.Bodies.circle(this.pos.x, this.pos.y, (this.width + this.height) / 2, Object.assign({ isStatic: this.isStatic }, options));
                (<ObjectRenderOptions>this.body.render).zIndex = this.isStatic ? 2 : 1
                this.id = this.body.id
                break
        }
        this.env.objects.push(this)
        Matter.World.add(this.env.world, this.body)
    }

    tileRender(): RenderObject[] {
        let renderObjects: RenderObject[] = []
        this.tiles.forEach(tile => {
            renderObjects.push(new RenderObject(
                'rect',
                (tile.x + tile.width / 2) * this.env.relToAbs,
                (tile.y + tile.height / 2) * this.env.relToAbs,
                <RenderOptions>{
                    width: tile.width * this.env.relToAbs,
                    height: tile.height * this.env.relToAbs,
                    texture: tile.texture
                }
            ))
        })
        return renderObjects
    }

    toRender(): RenderObject | boolean {
        switch (this.type) {
            case 'rect':
                return new RenderObject(
                    'poly',
                    this.body.position.x,
                    this.body.position.y,
                    <RenderOptions>{
                        vertices: this.body.vertices,
                        zIndex: this.isStatic ? 2 : 1
                    }
                )
                break
            case 'circle':
                return new RenderObject(
                    'circle',
                    this.body.position.x,
                    this.body.position.y,
                    <RenderOptions>{ radius: (<any>this.body).circleRadius }
                )
                break
        }

        return false
    }

    update(): void { }

}


export { MapElement, Vector, ObjectRenderOptions, ObjectOptions }
