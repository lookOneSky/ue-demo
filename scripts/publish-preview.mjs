import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { build, loadEnv, preview } from 'vite'

const root = process.cwd()
const tempRoot = resolve(tmpdir())
const workspace = mkdtempSync(join(tempRoot, 'ue-demo-publish-'))
process.once('exit', () => {
  if (dirname(workspace) === tempRoot) {
    rmSync(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
})

const config = {
  root,
  configLoader: 'runner',
  cacheDir: join(workspace, 'cache'),
  build: { outDir: join(workspace, 'dist') },
  logLevel: 'error'
}
const signalPath = '/pixel-streaming'
const signalUrl = loadEnv('production', root).VITE_SIGNAL_SERVER_URL?.trim()
const localSignalling = {
  name: 'local-pixel-streaming-signalling',
  config(userConfig) {
    const proxy = {
      ...(userConfig.preview?.proxy ?? userConfig.server?.proxy),
      '^/pixel-streaming(?:\\?|$)': {
        target: 'ws://127.0.0.1:6543',
        ws: true,
        // Vite passes the response only for ordinary HTTP requests.
        bypass: (_request, response) => response ? false : undefined,
        rewrite: path => '/' + path.slice(signalPath.length)
      }
    }
    return { preview: { proxy } }
  }
}
const { promise: stopped, resolve: stop } = Promise.withResolvers()
let stopping = false
function requestStop() {
  stopping = true
  stop()
}
process.stdin.once('end', requestStop)
process.stdin.resume()
process.once('SIGINT', requestStop)
process.once('SIGTERM', requestStop)
if (process.platform === 'win32') process.once('SIGBREAK', requestStop)

let server
try {
  await build({
    ...config,
    define: { 'import.meta.env.VITE_SIGNAL_SERVER_URL': JSON.stringify(signalUrl || signalPath) }
  })
  if (!stopping) {
    server = await preview({
      ...config,
      preview: { host: '127.0.0.1', port: 0, strictPort: true, open: false },
      plugins: !signalUrl || signalUrl === signalPath ? [localSignalling] : []
    })
    const { port } = server.httpServer.address()
    console.log(JSON.stringify({ event: 'ready', url: `http://127.0.0.1:${port}`, port }))
    await stopped
  }
} finally {
  process.stdin.pause()
  await server?.close()
}
