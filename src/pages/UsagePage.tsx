import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { TelemetrySummary } from '@/services/telemetry/summary'

const TOKEN_KEY = 'syncore.calc.stats-token'

async function loadStats(token: string): Promise<{ status: number; data?: TelemetrySummary }> {
  const response = await fetch('/api/stats', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return { status: response.status }
  return { status: response.status, data: (await response.json()) as TelemetrySummary }
}

export function UsagePage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [draft, setDraft] = useState('')
  const [data, setData] = useState<TelemetrySummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]')
    const previous = robots?.getAttribute('content') ?? ''
    if (robots) robots.setAttribute('content', 'noindex,nofollow')
    else {
      const tag = document.createElement('meta')
      tag.name = 'robots'
      tag.content = 'noindex,nofollow'
      document.head.appendChild(tag)
    }
    return () => {
      const current = document.querySelector('meta[name="robots"]')
      if (current) {
        if (previous) current.setAttribute('content', previous)
        else current.remove()
      }
    }
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    if (stored) void unlock(stored)
  }, [])

  async function unlock(nextToken: string) {
    setBusy(true)
    setError(null)
    try {
      const result = await loadStats(nextToken)
      if (result.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY)
        setToken('')
        setData(null)
        setError('Неверный пароль.')
        return
      }
      if (result.status === 503) {
        setError('Задайте STATS_TOKEN в файле .env на сервере.')
        return
      }
      if (!result.data) {
        setError('Счётчик доступен при npm run dev или npm run preview.')
        return
      }
      sessionStorage.setItem(TOKEN_KEY, nextToken)
      setToken(nextToken)
      setData(result.data)
    } catch {
      setError('Счётчик доступен при npm run dev или npm run preview.')
    } finally {
      setBusy(false)
    }
  }

  function lock() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setDraft('')
    setData(null)
    setError(null)
  }

  if (!token || !data) {
    return (
      <div className="mx-auto max-w-md">
        <Badge tone="accent">Только для вас</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Посещаемость</h1>
        <p className="mt-2 text-ink-soft">
          Цифры скрыты от посетителей. Введите пароль из <span className="font-mono text-sm">STATS_TOKEN</span> в файле
          .env.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            void unlock(draft)
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Ключ STATS_TOKEN</span>
            <Input
              type="password"
              autoComplete="off"
              name="stats-token"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              invalid={Boolean(error)}
            />
          </label>
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
          <Button type="submit" variant="primary" fullWidth disabled={busy || draft.length === 0}>
            Открыть
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone="accent">Приватно</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Посещаемость</h1>
        </div>
        <Button variant="outline" onClick={lock}>
          Выйти
        </Button>
      </div>
      <p className="mt-2 text-ink-soft">
        Анонимные браузеры и нажатия «Рассчитать». Нет имён, почты и IP.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Посетители" value={String(data.uniqueVisitors)} hint="уникальные браузеры" />
          <Stat label="Сессии" value={String(data.sessions)} hint="открытия вкладки" />
          <Stat label="Просмотры" value={String(data.pageviews)} />
          <Stat label="Расчёты" value={String(data.calculates)} hint="нажатия «Рассчитать»" />
        </div>

        <Card>
          <p className="text-sm font-semibold">Последние 7 дней</p>
          {data.last7Days.every((day) => day.views === 0 && day.calculates === 0) ? (
            <p className="mt-2 text-sm text-muted">Пока нет данных за эту неделю.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data.last7Days.map((day) => (
                <li key={day.date} className="flex justify-between gap-3 border-t border-line/80 py-2 first:border-t-0">
                  <span className="text-ink-soft">{day.date}</span>
                  <span className="font-mono tabular-nums">
                    {day.visitors} чел. · {day.views} просм. · {day.calculates} расч.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <p className="text-sm font-semibold">Расчёты по модулям</p>
          {data.byModule.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Ещё никто не нажимал «Рассчитать».</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data.byModule.map((item) => (
                <li key={item.id} className="flex justify-between border-t border-line/80 py-2 first:border-t-0">
                  <span>{item.label}</span>
                  <span className="font-mono font-semibold tabular-nums">{item.calculates}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="min-w-0 p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  )
}
