interface NeihboorObject {
	top?: Cell
	right?: Cell
	bottom?: Cell
	left?: Cell
}

class Grid {
	rows: number
	cols: number
	cells: Array<Cell>

	constructor(cols: number, rows: number) {
		this.rows = rows
		this.cols = cols
		this.cells = []
		this.createCells()
		this.defineNeighboors()
	}

	createCells(): void {
		for (let col = 0; col < this.cols; col++) {
			for (let row = 0; row < this.rows; row++) {
				this.cells.push(new Cell(row, col))
			}
		}
	}

	getCell(x: number, y: number): Cell {
		let cell = this.cells.filter(cell => {
			return cell.x === x && cell.y === y
		})
		if (cell.length !== 0) {
			return cell[0]
		} else {
			console.error(`La cellule (x: ${x}, y: ${y}) n'existe pas`)
		}
	}

	updateCell(newCell: Cell): void {
		if (!this.cells.includes(newCell)) return
		this.defineNeighboors()
		this.cells[this.cells.indexOf(newCell)] = newCell
	}

	defineNeighboors(): void {
		this.cells.forEach(cell => {
			cell.neighboor.top = cell.y >= 1 ? this.cells.filter(othercell => othercell.x <= cell.x && othercell.x + othercell.width > cell.x && othercell.y === cell.y - cell.height)[0] : null
			cell.neighboor.bottom = cell.y <= this.rows - 1 ? this.cells.filter(othercell => othercell.x <= cell.x && othercell.x + othercell.width > cell.x && othercell.y === cell.y + cell.height)[0] : null
			cell.neighboor.left = cell.x >= 1 ? this.cells.filter(othercell => othercell.y <= cell.y && othercell.y + othercell.height > cell.y && othercell.x === cell.x - cell.width)[0] : null
			cell.neighboor.right = cell.x <= this.cols - 1 ? this.cells.filter(othercell => othercell.y <= cell.y && othercell.y + othercell.height > cell.y && othercell.x === cell.x + cell.width)[0] : null
		})
	}

}

class Cell {
	x: number
	y: number
	width: number
	height: number
	neighboor: NeihboorObject
	active: boolean

	constructor(x: number, y: number, width = 1, height = 1) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.neighboor = {}
	}

	toggleActive(): void {
		this.active = !this.active
	}

}


export { Grid, Cell }
