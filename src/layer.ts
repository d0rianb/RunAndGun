class Layer {
    name: string
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    zIndex: number

    constructor(name: string, zIndex) {
        this.name = name
        this.canvas = document.querySelector(`#${name}`)
        this.ctx = this.canvas.getContext('2d')
        this.zIndex = zIndex
    }
    hide(): void {
        this.canvas.style.display = 'none'
    }

    show(): void {
        this.canvas.style.display = 'inherit'
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}


export { Layer }
