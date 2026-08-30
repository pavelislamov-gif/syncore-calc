import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { LaserResult } from '@/types/laser'
import { formatNumber, formatRpm } from '@/utils/format'

const rows: { ru: string; en: string; value: (r: LaserResult) => string }[] = [
  { ru: 'Скорость', en: 'Speed', value: (r) => `${formatNumber(r.speedMmS, 2)} мм/с` },
  { ru: 'Мощность', en: 'Power', value: (r) => `${formatRpm(r.powerPct)} %` },
  { ru: 'Частота', en: 'Frequency', value: (r) => `${formatRpm(r.frequencyHz)} Гц` },
  { ru: 'Скважность', en: 'Duty cycle', value: (r) => `${formatRpm(r.dutyPct)} %` },
  { ru: 'Газ', en: 'Gas', value: (r) => r.gas },
  { ru: 'Давление', en: 'Pressure', value: (r) => `${formatNumber(r.pressureBar, 2)} бар` },
  { ru: 'Фокус', en: 'Focus', value: (r) => `${formatNumber(r.focusMm, 2)} мм` },
  { ru: 'Сопло', en: 'Nozzle', value: (r) => `${formatNumber(r.nozzleMm, 2)} мм` },
  { ru: 'Высота резки', en: 'Cutting height', value: (r) => `${formatNumber(r.cutHeightMm, 2)} мм` },
  { ru: 'Высота пробивки', en: 'Pierce height', value: (r) => `${formatNumber(r.pierceHeightMm, 2)} мм` },
  { ru: 'Время пробивки', en: 'Pierce time', value: (r) => `${formatRpm(r.pierceTimeMs)} мс` },
  { ru: 'Мощность пробивки', en: 'Pierce power', value: (r) => `${formatRpm(r.piercePowerPct)} %` },
]

function rowLabel(row: { ru: string; en: string }) {
  return `${row.ru} / ${row.en}`
}

export function LaserLayerSettings({ result }: { result: LaserResult }) {
  const [copied, setCopied] = useState(false)
  const text = rows.map((row) => `${rowLabel(row)}: ${row.value(result)}`).join('\n')

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
          <p className="text-sm font-semibold">Настройки слоя / Layer settings</p>
          <p className="mt-1 text-sm text-ink-soft">
            Подписи как в контроллере (часто только английский): скорость, мощность, газ, фокус и пробивка.
          </p>
        </div>
        <Button variant="outline" onClick={() => void copy()}>
          {copied ? 'Скопировано' : 'Скопировать слой'}
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[16rem] text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="pb-2 font-medium">Параметр / Parameter</th>
              <th className="pb-2 text-right font-medium">Значение / Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.en} className="border-t border-line/80">
                <td className="py-2 pr-3">
                  {row.ru}
                  <span className="text-muted"> / {row.en}</span>
                </td>
                <td className="py-2 text-right font-mono font-semibold tabular-nums">{row.value(result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
