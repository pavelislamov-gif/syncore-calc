import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { summarizeTelemetry, type TelemetryEvent, type TelemetryStore } from './src/services/telemetry/summary'

const MAX_EVENTS = 8000

function readStore(file: string): TelemetryStore {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw) as TelemetryStore
    if (!Array.isArray(parsed.events)) return { events: [] }
    return parsed
  } catch {
    return { events: [] }
  }
}

function writeStore(file: string, store: TelemetryStore) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(store))
}

function isEvent(value: unknown): value is TelemetryEvent {
  if (!value || typeof value !== 'object') return false
  const item = value as TelemetryEvent
  return (
    typeof item.visitorId === 'string' &&
    typeof item.sessionId === 'string' &&
    typeof item.path === 'string' &&
    (item.name === 'page_view' || item.name === 'calculate') &&
    typeof item.at === 'string'
  )
}

function attach(server: { middlewares: { use: (fn: (req: import('http').IncomingMessage, res: import('http').ServerResponse, next: () => void) => void) => void } }, file: string) {
  server.middlewares.use((req, res, next) => {
    const url = req.url ?? ''
    if (url.split('?')[0] === '/api/stats' && req.method === 'GET') {
      const store = readStore(file)
      const summary = summarizeTelemetry(store.events)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(summary))
      return
    }
    if (url.split('?')[0] === '/api/telemetry' && req.method === 'POST') {
      const chunks: Buffer[] = []
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      req.on('end', () => {
        try {
          const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          if (!isEvent(parsed)) {
            res.statusCode = 400
            res.end('{"ok":false}')
            return
          }
          const store = readStore(file)
          store.events.push(parsed)
          if (store.events.length > MAX_EVENTS) store.events = store.events.slice(-MAX_EVENTS)
          writeStore(file, store)
          res.setHeader('Content-Type', 'application/json')
          res.end('{"ok":true}')
        } catch {
          res.statusCode = 400
          res.end('{"ok":false}')
        }
      })
      return
    }
    next()
  })
}

export function telemetryPlugin(root: string): Plugin {
  const file = path.join(root, '.data', 'telemetry.json')
  return {
    name: 'syncore-telemetry',
    configureServer(server) {
      attach(server, file)
    },
    configurePreviewServer(server) {
      attach(server, file)
    },
  }
}
