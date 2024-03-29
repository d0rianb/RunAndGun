import * as Matter from 'matter-js'

import { Env } from './env'
import { Player } from './player'
import { Cooldown, Point, Renderer, Texture } from 'unrail-engine'

import { constants } from '../ressources/static/constants.js'

import { default as SHOT } from '../ressources/assets/sprite/bullet.png'

const COLLISION = constants.physics.collision

const shotIDPrefix: number = 1000
var lastID: number = 0

class Weapon {
    public player: Player
    public name: string

    protected fireRange: number // grid unit
    protected fireRate: number // [0 - 10]
    protected spread: number // angle
    protected nbShoot: number
    public shootDamage: number // [0 - 100]
    public shootSpeed: number

    public maxAmmo: number
    public nbAmmo: number
    public ammoSize: number // [1 - 4]
    public reloadTime: number // ms
    public recoil: number

    public isReloading: boolean
    protected canShoot: boolean
    protected autofire: boolean

    constructor(player: Player) {
        this.player = player
        this.name = 'Unknown'
        this.fireRange = Infinity
        this.fireRate = 5
        this.spread = Math.PI / 20
        this.nbShoot = 1
        this.shootSpeed = 30
        this.shootDamage = 20
        this.maxAmmo = 20
        this.ammoSize = 2
        this.reloadTime = 1000
        this.nbAmmo = this.maxAmmo
        this.isReloading = false
        this.canShoot = true
        this.autofire = false
    }

    shoot(auto: boolean = false): Shot {
        if (this.isReloading || !this.canShoot) return
        if (auto && !this.autofire) return
        if (this.nbAmmo == 0) {
            this.reload()
            return null
        }
        let { x, y } = this.player.playerArm.vertices[2]
        this.recoil = this.shootDamage * this.nbShoot / 175
        Matter.Body.applyForce(this.player.body, this.player.pos, <Matter.Vector>{ x: -this.recoil * Math.cos(this.player.angle), y: -this.recoil * Math.sin(this.player.angle) })
        const shot = new Shot(x, y, this.player.angle, this.shootDamage, this.shootSpeed, this.ammoSize, this)
        this.nbAmmo -= 1
        this.canShoot = false
        let shotCooldown: Cooldown = new Cooldown(1000 / this.fireRate, () => this.canShoot = true)
        if (!auto) this.autofire = true
        if (this.autofire) new Cooldown(1000 / this.fireRate, () => this.shoot(true))
        return shot
    }

    stopShoot(): void {
        this.autofire = false
    }

    singleShoot(): void {
        this.shoot()
        this.stopShoot()
    }


    reload(): void {
        this.isReloading = true
        let reloadCooldown: Cooldown = new Cooldown(this.reloadTime, () => {
            this.nbAmmo = this.maxAmmo
            this.isReloading = false
        })
    }
}

class Shot {
    public id: number
    public x: number
    public y: number
    public dir: number
    public damage: number
    public speed: number
    public width: number
    public height: number
    public weapon: Weapon
    public player: Player
    public env: Env
    public body: Matter.Body
    private texture: Texture

    constructor(x, y, dir, dmg, speed, size, weapon) {
        this.id = shotIDPrefix + lastID
        lastID++
        this.dir = dir
        this.damage = dmg
        this.speed = speed
        this.weapon = weapon
        this.player = this.weapon.player
        this.env = this.player.env
        this.width = size * this.env.relToAbs / 3
        this.height = 6
        this.x = x + this.width / 2
        this.y = y - this.height
        this.body = Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, {
            label: 'Shot',
            id: this.id,
            friction: 0,
            angle: this.dir,
            collisionFilter: {
                group: COLLISION.collisionGroup.shot,
                category: COLLISION.collisionCategory.shot,
                mask: COLLISION.collisionMask.shot
            }
        })
        this.texture = new Texture(SHOT, { rotation: this.dir })
        Matter.Body.setInertia(this.body, Infinity)
        this.env.addShot(this)
    }

    update(): void {
        const speed: number = this.speed * this.env.timescale
        Matter.Body.translate(this.body, <Matter.Vector>{ x: Math.cos(this.dir) * speed, y: Math.sin(this.dir) * speed })
        this.x = this.body.position.x
        this.y = this.body.position.y
        if (this.x > this.env.mapWidth
            || this.x < -500
            || this.y > this.env.mapHeight
            || this.y < 0
            || this.speed === 0) {
            this.destroy()
        }
    }

    destroy(): void {
        this.env.shots = this.env.shots.filter(shot => shot.id !== this.id)
        Matter.World.remove(this.env.world, this.body)
    }

    render(): void {
        // const pointArray: Array<Point> = this.body.vertices.map(vertice => new Point(vertice.x, vertice.y))
        // Renderer.poly(pointArray)
        Renderer.rectSprite(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, this.texture)
    }
}

class AR extends Weapon {
    constructor(player) {
        super(player)
        this.name = 'AR'
        this.fireRange = Infinity
        this.fireRate = 5
        this.spread = Math.PI / 20
        this.nbShoot = 1
        this.shootSpeed = 30
        this.shootDamage = 20
        this.maxAmmo = 10
        this.ammoSize = 2
        this.reloadTime = 800
    }
}

class SMG extends Weapon {
    constructor(player) {
        super(player)
        this.name = 'SMG'
        this.fireRange = 900
        this.fireRate = 10
        this.spread = Math.PI / 10
        this.nbShoot = 1
        this.shootSpeed = 50
        this.shootDamage = 15
        this.maxAmmo = 30
        this.ammoSize = 1
        this.reloadTime = 750
    }
}

export { Weapon, Shot, AR, SMG }
