import { describe, expect, it } from 'vitest'
import { summarizeTelemetry, type TelemetryEvent } from '@/services/telemetry/summary'

function event(partial: Partial<TelemetryEvent> & Pick<TelemetryEvent, 'name' | 'at'>): TelemetryEvent {
  return {
    visitorId: 'v1',
    sessionId: 's1',
    path: '/milling',
    ...partial,
  }
}

describe('telemetry summary', () => {
  it('counts unique visitors and calculate clicks', () => {
    const now = new Date('2026-08-30T12:00:00.000Z')
    const events: TelemetryEvent[] = [
      event({ visitorId: 'a', sessionId: 's1', name: 'page_view', at: '2026-08-30T10:00:00.000Z' }),
      event({ visitorId: 'b', sessionId: 's2', name: 'page_view', at: '2026-08-30T11:00:00.000Z' }),
      event({
        visitorId: 'a',
        sessionId: 's1',
        name: 'calculate',
        module: 'milling',
        at: '2026-08-30T10:01:00.000Z',
      }),
    ]
    const summary = summarizeTelemetry(events, now)
    expect(summary.uniqueVisitors).toBe(2)
    expect(summary.sessions).toBe(2)
    expect(summary.pageviews).toBe(2)
    expect(summary.calculates).toBe(1)
    expect(summary.byModule[0]).toEqual({ id: 'milling', label: 'Фрезерование', calculates: 1 })
    const today = summary.last7Days.find((day) => day.date === '2026-08-30')
    expect(today?.visitors).toBe(2)
    expect(today?.calculates).toBe(1)
  })
})
