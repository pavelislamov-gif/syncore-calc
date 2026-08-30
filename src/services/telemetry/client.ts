import type { TelemetryName } from '@/services/telemetry/summary'

const VISITOR_KEY = 'syncore.calc.visitor'
const SESSION_KEY = 'syncore.calc.session'

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `v-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function visitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = uuid()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

function sessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = uuid()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

const recent = new Map<string, number>()

function shouldSkip(key: string, ms: number) {
  const now = Date.now()
  const prev = recent.get(key)
  if (prev && now - prev < ms) return true
  recent.set(key, now)
  return false
}

function endpoint() {
  const custom = import.meta.env.VITE_TELEMETRY_URL as string | undefined
  return custom && custom.length > 0 ? custom : '/api/telemetry'
}

function send(name: TelemetryName, path: string, moduleId?: string) {
  if (typeof window === 'undefined') return
  if (path.startsWith('/usage')) return
  try {
    const payload = {
      visitorId: visitorId(),
      sessionId: sessionId(),
      path,
      name,
      module: moduleId,
      at: new Date().toISOString(),
    }
    const body = JSON.stringify(payload)
    const url = endpoint()
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(url, blob)
      return
    }
    void fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
  } catch {
    /* ignore */
  }
}

export function trackPageView(path: string) {
  if (shouldSkip(`view:${path}`, 2500)) return
  send('page_view', path)
}

export function trackCalculate(moduleId: string) {
  if (shouldSkip(`calc:${moduleId}`, 1500)) return
  send('calculate', window.location.pathname, moduleId)
}
