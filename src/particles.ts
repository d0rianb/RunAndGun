import { Env } from './env'

import { Renderer, Cooldown, Vector2 } from 'unrail-engine'

const GRAVITY: number = 1 // N
const MAX_SPEED: number = 5

class Particle {
    id: number
    pos: Vector2
    velocity: Vector2
    env: Env
    color: string
    angle: number
    radius: number
    opacity: number

    constructor(pos: Vector2, env: Env) {
        this.id = env.particles.length + 1
        this.env = env
        this.pos = new Vector2(pos.x, pos.y)
        this.angle = Math.PI / 2 + Math.random() * Math.PI
        this.velocity = new Vector2(Math.random() * MAX_SPEED * Math.cos(this.angle), Math.random() * MAX_SPEED * Math.sin(this.angle))
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

    render(): void {
        Renderer.circle(this.pos.x, this.pos.y, this.radius)
    }
}

class Blood extends Particle {
    constructor(pos: Vector2, env: Env) {
        super(pos, env)
    }
}

class ParticuleGenerator {
    pos: Vector2
    lifeDuration: number
    particles: Array<Particle>
    env: Env

    constructor(nbParticles: number, pos: Vector2, lifeDuration: number, env: Env) {
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
