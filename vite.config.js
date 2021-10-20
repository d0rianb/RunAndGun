import liveReload from 'vite-plugin-live-reload'

export default {
    base: './',
    build: {
        outDir: 'docs',
        emptyOutDir: false
    },
    plugins: [
        liveReload('./nodes-modules/unrail-engine/dist/unrail-engine.es.js'),
    ]
}