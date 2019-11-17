/* Run&Gun v0.0.1-dev
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
 * NOTE: le grappin sera à faire après le systeme de tir et sera juste un projectile avec une contrainte
 * BUG:
 *     - arm angle only change when mouse move not when camera is updated
 */

import * as Matter from 'matter-js'

import { Env } from './env'
import { Map } from './map'
import { Player } from './player'
import { Enemy } from './enemy'

import { default as map1_file } from '../ressources/map/map1.json'

const DEBUG: boolean = false

const main: HTMLElement = document.querySelector('main')
const canvas: HTMLCanvasElement = document.createElement('canvas')
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

const map1: Map = new Map(map1_file)

let env: Env = new Env(canvas, map1, 'matter-js')
let player: Player = new Player('Dorian', 300, 200, 40, 88, env, true)
let enemy1: Enemy = new Enemy('Bad Guy', 200, 200, 40, 88, env) //1090
let enemy2: Enemy = new Enemy('Bad Guy 2 ', 2200, 200, 40, 88, env) //1090

env.update();

(<any>window).env = env;
(<any>window).player = player;
(<any>window).enemy1 = enemy1;

canvas.focus()

export { DEBUG }
