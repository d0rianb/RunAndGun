import * as Matter from 'matter-js'
import { Env } from './env'
import { Map } from './map'
import { Grid, Cell } from './grid'
import { TILE_TEXTURE } from './texture'

import { Renderer, Texture, Vector2 } from 'unrail-engine'


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
*/

class Tile extends Cell {
    texture: Texture
    side: string

    constructor(x: number, y: number, parent: MapElement) {
        super(x, y, 1, 1)
        const cell: Cell = parent.map.grid.getCell(this.x, this.y)
        this.neighboor = cell.neighboor
        this.texture = null
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
        }
        if (!this.texture) {
            console.error(`Missing texture : ${this.side}`)
        }
    }

}

class MapElement {
    id: number
    type: string
    map: Map
    pos: Vector2
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
        this.pos = new Vector2(gridX * this.env.relToAbs, gridY * this.env.relToAbs)

        switch (this.type) {
            case 'rect':
                // ISSUE SOLVED: Convert from centered rect to top-left corner rect
                this.body = Matter.Bodies.rectangle(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width, this.height, options)
                for (let i = 0; i < gridWidth; i++) {
                    for (let j = 0; j < gridHeight; j++) {
                        let gridCell = this.map.grid.getCell(gridX + i, gridY + j)
                        gridCell.toggleActive(true)
                        this.tiles.push(new Tile(gridCell.x, gridCell.y, this))
                    }
                }
                this.id = this.body.id
                break
            case 'circle':
                this.body = Matter.Bodies.circle(this.pos.x, this.pos.y, (this.width + this.height) / 2, Object.assign({ isStatic: this.isStatic }, options))
                this.id = this.body.id
                break
        }
        this.env.addObject(this)
    }

    render(): void {
        // @ts-ignore
        // Renderer.rectFromPoints(this.body.bounds.min.x, this.body.bounds.min.y, this.body.bounds.max.x, this.body.bounds.max.y, { strokeStyle: 'red' })
        this.tiles.forEach(tile => {
            Renderer.rect(
                tile.x * this.env.relToAbs,
                tile.y * this.env.relToAbs,
                tile.width * this.env.relToAbs,
                tile.height * this.env.relToAbs, { lineWidth: 1 })
            Renderer.rectSprite(tile.x * this.env.relToAbs,
                tile.y * this.env.relToAbs,
                tile.width * this.env.relToAbs,
                tile.height * this.env.relToAbs,
                tile.texture)
        })
        if (this.type === 'circle') {
            Renderer.circle(this.pos.x, this.pos.y, (this.width + this.height) / 2)
        }
    }

    update(): void {
        if (!this.isStatic) this.pos = new Vector2(this.body.position.x, this.body.position.y)
    }

}


export { MapElement, ObjectRenderOptions, ObjectOptions }
