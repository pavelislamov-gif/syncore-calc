import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { TelemetrySummary } from '@/services/telemetry/summary'

export function UsagePage() {
  const [data, setData] = useState<TelemetrySummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/stats')
      .then(async (response) => {
        if (!response.ok) throw new Error('offline')
        return (await response.json()) as TelemetrySummary
      })
      .then((summary) => {
        if (!cancelled) setData(summary)
      })
      .catch(() => {
        if (!cancelled) setError('Счётчик доступен при запуске через npm run dev или npm run preview на этом сервере.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="max-w-3xl">
      <Badge tone="accent">Анонимно</Badge>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Посещаемость</h1>
      <p className="mt-2 text-ink-soft">
        Сайт бесплатный, без регистрации. Здесь — сколько браузеров заходили и какие модули считали. Нет имён, почты и
        IP: только случайный идентификатор в браузере.
      </p>

      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">{error}</p>
        </Card>
      ) : null}

      {data ? (
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
      ) : !error ? (
        <p className="mt-6 text-sm text-muted">Загрузка…</p>
      ) : null}
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
