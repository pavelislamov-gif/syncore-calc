import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { summarizeTelemetry, type TelemetryEvent, type TelemetryStore } from './src/services/telemetry/summary.ts'

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

function loadStatsToken(root: string): string {
  if (process.env.STATS_TOKEN && process.env.STATS_TOKEN.length > 0) return process.env.STATS_TOKEN
  try {
    const text = fs.readFileSync(path.join(root, '.env'), 'utf8')
    const line = text.split('\n').find((item) => item.startsWith('STATS_TOKEN='))
    if (!line) return ''
    return line.slice('STATS_TOKEN='.length).trim().replace(/^["']|["']$/g, '')
  } catch {
    return ''
  }
}

function tokensMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  if (a.length === 0 || a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function requestToken(req: IncomingMessage): string {
  const header = req.headers.authorization ?? ''
  if (header.startsWith('Bearer ')) return header.slice('Bearer '.length).trim()
  return ''
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function attach(
  server: { middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } },
  file: string,
  root: string,
) {
  server.middlewares.use((req, res, next) => {
    const url = req.url ?? ''
    const pathname = url.split('?')[0]
    if (pathname === '/api/stats' && req.method === 'GET') {
      const expected = loadStatsToken(root)
      if (!expected) {
        sendJson(res, 503, { error: 'unconfigured' })
        return
      }
      if (!tokensMatch(expected, requestToken(req))) {
        sendJson(res, 401, { error: 'unauthorized' })
        return
      }
      const store = readStore(file)
      sendJson(res, 200, summarizeTelemetry(store.events))
      return
    }
    if (pathname === '/api/telemetry' && req.method === 'POST') {
      const chunks: Buffer[] = []
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      req.on('end', () => {
        try {
          const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          if (!isEvent(parsed)) {
            sendJson(res, 400, { ok: false })
            return
          }
          const store = readStore(file)
          store.events.push(parsed)
          if (store.events.length > MAX_EVENTS) store.events = store.events.slice(-MAX_EVENTS)
          writeStore(file, store)
          sendJson(res, 200, { ok: true })
        } catch {
          sendJson(res, 400, { ok: false })
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
      attach(server, file, root)
    },
    configurePreviewServer(server) {
      attach(server, file, root)
    },
  }
}
