import liveReload from 'vite-plugin-live-reload'

export default {
    plugins: [
        liveReload('./nodes-modules/unrail-engine/dist/unrail-engine.es.js'),
    ]
}