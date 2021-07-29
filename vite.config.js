import path from 'path'
import liveReload from 'vite-plugin-live-reload'

export default {
    base: './',
    build: {
        outDir: 'docs'
    },
    plugins: [
        liveReload('./nodes-modules/unrail-engine/dist/unrail-engine.es.js'),
    ]
}