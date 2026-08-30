import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { LaserResult } from '@/types/laser'
import { formatNumber, formatRpm } from '@/utils/format'

const rows: { label: string; value: (r: LaserResult) => string }[] = [
  { label: 'Скорость', value: (r) => `${formatNumber(r.speedMmS, 2)} мм/с` },
  { label: 'Мощность', value: (r) => `${formatRpm(r.powerPct)} %` },
  { label: 'Частота', value: (r) => `${formatRpm(r.frequencyHz)} Гц` },
  { label: 'Скважность', value: (r) => `${formatRpm(r.dutyPct)} %` },
  { label: 'Газ', value: (r) => r.gas },
  { label: 'Давление', value: (r) => `${formatNumber(r.pressureBar, 2)} бар` },
  { label: 'Фокус', value: (r) => `${formatNumber(r.focusMm, 2)} мм` },
  { label: 'Сопло', value: (r) => `${formatNumber(r.nozzleMm, 2)} мм` },
  { label: 'Высота резки', value: (r) => `${formatNumber(r.cutHeightMm, 2)} мм` },
  { label: 'Высота пробивки', value: (r) => `${formatNumber(r.pierceHeightMm, 2)} мм` },
  { label: 'Время пробивки', value: (r) => `${formatRpm(r.pierceTimeMs)} мс` },
  { label: 'Мощность пробивки', value: (r) => `${formatRpm(r.piercePowerPct)} %` },
]

export function LaserLayerSettings({ result }: { result: LaserResult }) {
  const [copied, setCopied] = useState(false)
  const text = rows.map((row) => `${row.label}: ${row.value(result)}`).join('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Настройки слоя</p>
          <p className="mt-1 text-sm text-ink-soft">Скорость, мощность, газ, фокус и пробивка для контроллера.</p>
        </div>
        <Button variant="outline" onClick={() => void copy()}>
          {copied ? 'Скопировано' : 'Скопировать слой'}
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[16rem] text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="pb-2 font-medium">Параметр</th>
              <th className="pb-2 text-right font-medium">Значение</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line/80">
                <td className="py-2 pr-3">{row.label}</td>
                <td className="py-2 text-right font-mono font-semibold tabular-nums">{row.value(result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
