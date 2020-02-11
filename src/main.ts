/* Run&Gun v0.1.1-dev
 * Author : D0rian <dorian.beauchesne@icloud.com>
 * NOTE: https://github.com/landgreen/n-gon/blob/master/js/player.js
 * TODO:
 *     - Collisions filter and stuff
 *     - interrest in Matter.Runner
 *     - change `typeof` by `instanceof`
 *     - bug when wallSlide
 *     - dash or grapnel ?
 *     - Remove shot when they're out of bounds
 *
 * BUG:
 *     - arm angle only change when mouse move not when camera is updated
 *     - sometimes shoot stay stacked
 */

import * as Matter from 'matter-js'
import JSON5 from 'json5'

import { Env } from './env'
import { Map } from './map'
import { Player } from './player'
import { Enemy } from './enemy'

import { default as map_file } from '../ressources/static/map/map1.json'

const DEBUG: boolean = false

const main: HTMLElement = document.querySelector('main')
const canvas: HTMLCanvasElement = document.createElement('canvas')
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

const map1: Map = new Map(map_file)

let env: Env = new Env(canvas, map1, 'local')
let player: Player = new Player('Dorian', 300, 200, 50, 80, env, true)
let enemy1: Enemy = new Enemy('Bad Guy', 200, 200, 40, 88, env)
let enemy2: Enemy = new Enemy('Bad Guy 2 ', 2200, 200, 40, 88, env);


(<any>window).env = env;
(<any>window).player = player;
(<any>window).enemy1 = enemy1;

window.onload = () => {
    env.update();
    canvas.focus()
}

export { DEBUG }
