export type TelemetryName = 'page_view' | 'calculate'

export interface TelemetryEvent {
  visitorId: string
  sessionId: string
  path: string
  name: TelemetryName
  module?: string
  at: string
}

export interface VisitorRecord {
  firstAt: string
  lastAt: string
  views: number
}

export interface TelemetryStore {
  events: TelemetryEvent[]
}

export interface DayStat {
  date: string
  visitors: number
  views: number
  calculates: number
}

export interface TelemetrySummary {
  uniqueVisitors: number
  sessions: number
  pageviews: number
  calculates: number
  byModule: { id: string; label: string; calculates: number }[]
  last7Days: DayStat[]
}

const MODULE_LABELS: Record<string, string> = {
  milling: 'Фрезерование',
  turning: 'Токарка',
  threading: 'Резьба',
  laser: 'Лазер',
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

export function summarizeTelemetry(events: TelemetryEvent[], now = new Date()): TelemetrySummary {
  const visitors = new Set<string>()
  const sessions = new Set<string>()
  let pageviews = 0
  let calculates = 0
  const moduleCounts: Record<string, number> = {}

  const days: DayStat[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, visitors: 0, views: 0, calculates: 0 })
  }
  const dayIndex = new Map(days.map((item, index) => [item.date, index]))
  const dayVisitors: Record<string, Set<string>> = {}
  for (const day of days) dayVisitors[day.date] = new Set()

  for (const event of events) {
    visitors.add(event.visitorId)
    sessions.add(event.sessionId)
    const key = dayKey(event.at)
    const idx = dayIndex.get(key)
    if (event.name === 'page_view') {
      pageviews += 1
      if (idx != null) {
        days[idx].views += 1
        dayVisitors[key].add(event.visitorId)
      }
    }
    if (event.name === 'calculate') {
      calculates += 1
      const moduleId = event.module ?? 'other'
      moduleCounts[moduleId] = (moduleCounts[moduleId] ?? 0) + 1
      if (idx != null) days[idx].calculates += 1
    }
  }

  for (const day of days) {
    day.visitors = dayVisitors[day.date].size
  }

  const byModule = Object.entries(moduleCounts)
    .map(([id, count]) => ({ id, label: MODULE_LABELS[id] ?? id, calculates: count }))
    .sort((a, b) => b.calculates - a.calculates)

  return {
    uniqueVisitors: visitors.size,
    sessions: sessions.size,
    pageviews,
    calculates,
    byModule,
    last7Days: days,
  }
}
