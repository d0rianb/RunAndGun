// Author : D0rian <dorian.beauchesne@icloud.com>

import * as Matter from 'matter-js'

import { Env } from './env.ts'
import { Map } from './map.ts'


const main: HTMLElement = document.querySelector('main')
const canvas: HTMLCanvasElement = document.createElement('canvas')
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

const engine: Matter.Engine = Matter.Engine.create({
	enableSleeping: true
})

const map1: Map = new Map('./ressources/map1.json')

let env = new Env(canvas, map1, engine)

env.update()
