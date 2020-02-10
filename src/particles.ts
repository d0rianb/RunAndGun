import { Env } from './env'
import { Vector } from './object'
import { Cooldown } from './events'
import { RenderObject, RenderOptions } from './render'

const GRAVITY: number = 1 // N
const MAX_SPEED: number = 5

class Particle {
    id: number
    pos: Vector
    velocity: Vector
    env: Env
    color: string
    angle: number
    radius: number
    opacity: number

    constructor(pos: Vector, env: Env) {
        this.id = env.particles.length + 1
        this.env = env
        this.pos = { x: pos.x, y: pos.y }
        this.angle = Math.PI / 2 + Math.random() * Math.PI
        this.velocity = new Vector(Math.random() * MAX_SPEED * Math.cos(this.angle), Math.random() * MAX_SPEED * Math.sin(this.angle))
        this.color = 'red'
        this.opacity = Math.random() * 255
        this.radius = 3
        this.env.particles.push(this)
    }

    update(): void {
        this.velocity.y += GRAVITY
        this.pos.x += this.velocity.x * this.env.timescale
        this.pos.y += this.velocity.y * this.env.timescale
    }

    render(env: Env): void {
        let renderObject: RenderObject = new RenderObject('circle', this.pos.x, this.pos.y, <RenderOptions>{ radius: this.radius })
        env.addToRenderingStack(renderObject)
    }
}

class Blood extends Particle {
    constructor(pos: Vector, env: Env) {
        super(pos, env)
    }
}

class ParticuleGenerator {
    pos: Vector
    lifeDuration: number
    particles: Array<Particle>
    env: Env

    constructor(nbParticles: number, pos: Vector, lifeDuration: number, env: Env) {
        this.pos = pos
        this.lifeDuration = lifeDuration
        this.particles = []
        this.env = env
        for (let i = 0; i < nbParticles; i++) {
            let particles: Particle = new Particle(this.pos, this.env)
            this.particles.push(particles)

        }
        let cd: Cooldown = new Cooldown(this.lifeDuration * this.env.timescale, () => this.destroy())
    }

    destroy(): void {
        const particlesId: Array<number> = this.particles.map(particle => particle.id)
        this.env.particles = this.env.particles.filter(particle => !particlesId.includes(particle.id))
    }
}


export { Particle, Blood, ParticuleGenerator }
