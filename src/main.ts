// Author : D0rian <dorian.beauchesne@icloud.com>
import * as Matter from 'matter-js'

import { Env } from './env'
import { Map } from './map'
import { Player } from './player'

import { default as map1_file } from '../ressources/map/map1.json'

const main: HTMLElement = document.querySelector('main')
const canvas: HTMLCanvasElement = document.createElement('canvas')
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

const map1: Map = new Map(map1_file)

let env: Env = new Env(canvas, map1)
let player: Player = new Player('Dorian', 12, 7, 1, 2, env)

env.update()
