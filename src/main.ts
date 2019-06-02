// Author : D0rian <dorian.beauchesne@icloud.com>

import { Env } from './env.ts'
import { Map } from './map'

const main: HTMLElement = document.querySelector('main')
const canvas: HTMLCanvasElement = document.createElement('canvas')
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

let env = new Env(canvas, ({} as Map))

env.update()
