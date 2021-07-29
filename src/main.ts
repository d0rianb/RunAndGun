/* Run&Gun v0.1.1-dev
 * Author : D0rian <dorian.beauchesne@icloud.com>
 * NOTE: https://github.com/landgreen/n-gon/blob/master/js/player.js
 * TODO:
 *     - Swicth to the UnrailEngine
 * BUG:
 *     - arm angle only change when mouse move not when camera is updated
 *     - sometimes shoot stay stacked
 */

import * as Matter from 'matter-js'

import { Env } from './env'
import { Map } from './map'
import { Player } from './player'
import { Enemy } from './enemy'

import { Renderer, Game, getWindowDimensions, createCanvas } from 'unrail-engine'

import { default as mapFile } from '../ressources/static/map/map-1.json'
import { MapElement } from './object'

const game = new Game('RunAndGun')


const { width, height } = getWindowDimensions()
const canvas: HTMLCanvasElement = Renderer.create()

const map1: Map = new Map(mapFile)

window.onload = () => {
    const env: Env = new Env(canvas, map1)

    const player: Player = new Player('Dorian', 300, 200, 50, 80, env, true)
    const enemy1: Enemy = new Enemy('Bad Guy', 200, 200, 40, 88, env)
    const enemy2: Enemy = new Enemy('Bad Guy 2 ', 2200, 200, 40, 88, env);


    (<any>window).env = env;
    (<any>window).player = player;
    (<any>window).enemy1 = enemy1;

    canvas.focus()
    game.setMainLoop(() => env.update())
    game.start()
}
    // const render = Matter.Render.create({
    //     canvas,
    //     engine: env.engine,
    // })
    // Matter.Render.run(render)
    // setTimeout(() => {
    //     Matter.Render.stop(render)
    //     canvas.style.background = 'none'
    // }, 3500)

