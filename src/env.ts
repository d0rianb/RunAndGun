import * as Matter from 'matter-js'

import { MapElement } from './object'
import { Entity, Player } from './player'
import { Map } from './map'
import { DOMEvent } from './events'
import { Shot } from './weapon'
import { Particle } from './particles'
import { Camera } from './camera'

import { Renderer, Point, Vector2 } from 'unrail-engine'

import { default as colors } from '../ressources/static/config/colors.json'
import { constants } from '../ressources/static/constants.js'

const GRAVITY_SCALE = constants.physics.gravity.scale

class Env {
    public canvas: HTMLCanvasElement
    public width: number = 0 // window width in px
    public height: number = 0 // window height in px
    public mapWidth: number
    public mapHeight: number
    public relToAbs: number
    public map: Map
    public camera: Camera
    public dpr: number
    public engine: Matter.Engine
    public engineRunner: Matter.Runner
    public renderer: Matter.Render
    public world: Matter.World
    public events: Array<DOMEvent>
    public cursorPosition: Vector2
    private tick: number = 0
    public timescale: number = 1
    public framerate: number = 60  // fps
    public objects: Array<MapElement>
    public entities: Array<Entity>
    public shots: Array<Shot>
    public particles: Array<Particle>

    constructor(canvas: HTMLCanvasElement, map: Map) {
        this.width = canvas.clientWidth
        this.height = canvas.clientHeight
        this.map = map

        this.engine = Matter.Engine.create({ enableSleeping: true })
        this.engineRunner = Matter.Runner.create({})
        this.world = this.engine.world
        this.world.gravity.scale = 0 //0.0019

        this.entities = []
        this.shots = []
        this.objects = []
        this.particles = []
        this.events = []
        this.cursorPosition = new Vector2(0, 0)
        this.camera = new Camera(0, 0, this.width, this.height, this)
        this.relToAbs = Math.min(this.camera.width / map.tileWidth, this.camera.height / map.tileWidth)
        this.mapWidth = this.map.dimensions.width * this.relToAbs
        this.mapHeight = this.map.dimensions.height * this.relToAbs

        this.events.push(new DOMEvent('mousemove', e => this.updateCursorPosition(e)))
        this.initMatterEngine()
        this.initMap()
    }

    initMatterEngine(): void {
        this.world.gravity.scale = 0 // default: 0.0019
        // Apply gravity
        Matter.Events.on(this.engine, 'beforeUpdate', e => {
            const bodies = Matter.Composite.allBodies(this.engine.world)
            bodies.forEach(body => {
                if (!(body.isStatic || body.isSleeping) && body.label !== 'Shot') {
                    body.force.y += body.mass * GRAVITY_SCALE
                }
            })
        })
        Matter.Events.on(this.engine, 'collisionStart', e => {
            const shotCollision = e.pairs.filter(pair => pair.bodyA.label === 'Shot' || pair.bodyB.label === 'Shot')
            if (shotCollision.length > 0) {
                for (let shot of shotCollision) {
                    const shotBody = shot.bodyA.label === 'Shot' ? shot.bodyA : shot.bodyB
                    const otherBody = shotBody === shot.bodyA ? shot.bodyB : shot.bodyA
                    if (otherBody.label === 'Wall') {
                        const shotObj = this.shots.filter(shot => shot.id === shotBody.id)[0]
                        if (shotObj) shotObj.destroy()
                    } else if (otherBody.label == 'PlayerRect' || otherBody.label == 'PlayerCircle') {
                        this.collision(shotBody, otherBody)
                    }
                }
            }
        })
    }

    initMap(): void {
        this.objects = []
        Matter.World.clear(this.world, false)
        this.map.init(this)
        this.objects.forEach(mapEl => {
            mapEl.tiles.forEach(tile => {
                tile.defineTexture()
            })
        })
    }

    addEntity(entity: Entity): void {
        this.entities.push(entity)
        Matter.World.add(this.world, entity.composite)
        if (entity instanceof Player && entity.cameraFocus) {
            this.camera.setFocus(<Player>entity)
        }
    }

    addObject(obj: MapElement) {
        this.objects.push(obj)
        Matter.World.add(this.world, obj.body)
    }

    addShot(shot: Shot): void {
        this.shots.push(shot)
        Matter.World.add(this.world, shot.body)
    }

    removeShot(shot: Shot): void {
        this.shots = this.shots.filter(envShot => envShot.id === shot.id)
        Matter.World.remove(this.world, shot.body)
    }

    collision(shotBody: Matter.Body, entityBody: Matter.Body): boolean {
        const shot: Shot = this.shots.filter(shot => shot.id === shotBody.id)[0]
        if (shot && shot.player.idArray.includes(entityBody.id)) {
            return false
        }
        const entity: Entity = this.entities.filter(entity => entity.idArray.includes(entityBody.id))[0]
        if (entity && shot) {
            entity.hitBy(shot, entityBody)
        }
        return entity != null
    }

    changeTimeScale(timescale: number): void {
        this.timescale = timescale
        this.engine.timing.timeScale = this.timescale
    }

    updateCursorPosition(evt: any) {
        this.cursorPosition = new Vector2(
            evt.clientX + this.camera.x,
            evt.clientY + this.camera.y
        )
    }

    update(): void {
        // Before Update is handle by the `initMatterEngine` method
        Matter.Runner.tick(this.engineRunner, this.engine, 1 / this.framerate)
        this.objects.forEach(obj => obj.update())
        this.shots.forEach(shot => shot.update())
        this.particles.forEach(particule => particule.update())
        this.entities.forEach(entity => entity.update())
        this.camera.update()
        this.render()
        this.tick++
        requestAnimationFrame(() => this.update())
    }

    render(): void {
        Renderer.beginFrame()

        Renderer.setOffset(0, 0) // For the interface
        // Camera Guide

        Renderer.line(this.camera.safeZone.x1, this.camera.height - 25, this.camera.safeZone.x2, this.camera.height - 25)

        Renderer.setOffset(-this.camera.x, -this.camera.y)
        // Map render
        this.objects.forEach(obj => obj.render())

        // Shot render
        this.shots.forEach(shot => {
            const pos: Matter.Vector = shot.body.position
            const pointArray: Array<Point> = shot.body.vertices.map(vertice => new Point(vertice.x, vertice.y))
            Renderer.poly(pointArray)
        })

        this.particles.forEach(particule => particule.render())

        // Player render
        this.entities.forEach(entity => entity.render())

        Renderer.endFrame()
    }
}


export { Env }
