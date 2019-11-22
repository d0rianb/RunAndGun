import * as Matter from 'matter-js'
import { Env } from './env'
import { Map } from './map'
import { Grid, Cell } from './grid'
import { RenderObject, RenderOptions } from './render'

// @ts-ignore
import tile_middle from '../ressources/assets/tiles/tile_middle.png'

const TILE_TEXTURE = new Image()
TILE_TEXTURE.src = tile_middle
console.log(TILE_TEXTURE)

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

class Tile {
	cell: Cell

	constructor(cell) {
		this.cell = cell
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
						this.tiles.push(new Tile(gridCell))
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
				(tile.cell.x + tile.cell.width / 2) * this.env.relToAbs,
				(tile.cell.y + tile.cell.height / 2) * this.env.relToAbs,
				<RenderOptions>{
					width: tile.cell.width * this.env.relToAbs,
					height: tile.cell.height * this.env.relToAbs,
					sprite: TILE_TEXTURE
				}
			))
		})
		return renderObjects
	}

	toRender(): RenderObject | boolean {
		switch (this.type) {
			case 'rect':
				// return new RenderObject(
				// 	'poly',
				// 	this.body.position.x,
				// 	this.body.position.y,
				// 	<RenderOptions>{
				// 		vertices: this.body.vertices,
				// 		zIndex: this.isStatic ? 2 : 1
				// 	}
				// )
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

	update(): void {

	}
}


export { MapElement, Vector, ObjectRenderOptions, ObjectOptions }
