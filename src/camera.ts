import { Event, Renderer } from 'unrail-engine'
import { Env } from './env'
import { Player } from './player'

class Camera {
    focus: Player
    x: number
    y: number
    width: number   // screenWidth
    height: number  // screenHeight
    safeZoneSize: number
    safeZone: any
    zoom: number = 1
    env: Env

    follow_x: boolean
    follow_y: boolean

    constructor(x: number, y: number, width: number, height: number, env: Env) {
        this.focus = undefined
        this.env = env
        this.x = x
        this.y = y
        this.zoom = 1
        this.width = width / this.zoom
        this.height = height / this.zoom

        this.safeZoneSize = this.width / 5
        this.safeZone = {
            x1: this.width / 2 - this.safeZoneSize / 2,
            x2: this.width / 2 + this.safeZoneSize / 2,
            y1: this.height,
            y2: this.height / 3

        }
        this.follow_x = true
        this.follow_y = true
        Event.onKeyDown('KeyC', () => this.y += 4)
        Event.onKeyDown('KeyV', () => this.y -= 4)
    }

    setFocus(player: Player): void {
        this.focus = player
    }

    include(obj: Object): boolean {
        return true
    }

    update(): void {
        if (this.focus) {
            let focus_x: number = this.focus.pos.x
            let focus_y: number = this.focus.pos.y
            if (this.follow_x) {
                let delta: number = 0
                if (focus_x <= this.x + this.safeZone.x1) {
                    delta = focus_x - this.x - this.safeZone.x1
                    this.x += delta
                } else if (focus_x >= this.x + this.safeZone.x2) {
                    delta = focus_x - this.x - this.safeZone.x2
                    this.x += delta
                }
            }
            if (this.follow_y) {
                let delta: number = 0
                if (focus_y <= this.safeZone.y2) {
                    delta = focus_y - this.y - this.safeZone.y2
                    this.y += delta
                } else if (focus_y > this.y + this.safeZone.y1) {
                    delta = focus_y - this.y - this.safeZone.y1
                    this.y += delta
                }
            }
        }
    }
}

export { Camera }