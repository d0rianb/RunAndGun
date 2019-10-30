import * as Matter from 'matter-js'
import { Env } from './env'
import { Player } from './player'

const shotIDPrefix = 1000
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
	public currentAmmo: number
	public ammoSize: number // [1 - 4]

	public isReloading: boolean

	constructor(player) {
		this.player = player
		this.name = 'Unknown'
		this.fireRange = Infinity
		this.fireRate = 5
		this.spread = Math.PI / 20
		this.nbShoot = 1
		this.shootSpeed = 30
		this.maxAmmo = 20
		this.ammoSize = 2
		this.currentAmmo = this.maxAmmo
		this.isReloading = false
	}

	shoot(): void {
		let { x, y } = this.player.playerArm.vertices[2]
		new Shot(x, y, this.player.angle, this.shootDamage, this.shootSpeed, this.ammoSize, this)
	}

	reload(): void {

	}
}

class Shot {
	public id: number
	public x: number
	public y: number
	public dir: number
	public damage: number
	public speed: number
	public size: number
	public weapon: Weapon
	public env: Env
	public body: Matter.Body

	constructor(x, y, dir, dmg, speed, size, weapon) {
		this.id = shotIDPrefix + lastID
		lastID++
		this.x = x
		this.y = y
		this.dir = dir
		this.damage = dmg
		this.speed = speed
		this.size = size
		this.weapon = weapon
		this.env = this.weapon.player.env
		this.body = Matter.Bodies.rectangle(this.x, this.y, this.size * this.env.relToAbs.x / 3, 6, {
			label: 'Shot',
			id: this.id,
			friction: 0.95,
			angle: this.dir
		})
		Matter.Body.setInertia(this.body, Infinity)
		this.env.addShot(this)
	}

	update(): void {
		Matter.Body.translate(this.body, <Matter.Vector>{ x: Math.cos(this.dir) * this.speed, y: Math.sin(this.dir) * this.speed })
		this.x = this.body.position.x
		this.y = this.body.position.y
		if (this.x > this.env.mapWidth || this.x < 0 || this.y > this.env.mapHeight || this.y < 0) this.destroy()
	}

	destroy(): void {
		this.env.shots = this.env.shots.filter(shot => shot.id !== this.id)
		Matter.Composite.remove(this.env.world, this.body)
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
		this.maxAmmo = 20
		this.ammoSize = 2
	}
}

export { Weapon, Shot, AR }
