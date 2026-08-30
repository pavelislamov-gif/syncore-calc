import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { CypCutParams } from '@/types/laser'
import { formatNumber, formatRpm } from '@/utils/format'

const rows: { ru: string; en: string; value: (p: CypCutParams) => string }[] = [
  { ru: 'Скорость', en: 'Speed', value: (p) => `${formatNumber(p.speedMmS, 2)} mm/s` },
  { ru: 'Мощность', en: 'Power', value: (p) => `${formatRpm(p.powerPct)} %` },
  { ru: 'Частота', en: 'Freq', value: (p) => `${formatRpm(p.frequencyHz)} Hz` },
  { ru: 'Скважность', en: 'Duty', value: (p) => `${formatRpm(p.dutyPct)} %` },
  { ru: 'Газ', en: 'Gas', value: (p) => p.gas },
  { ru: 'Давление', en: 'Pressure', value: (p) => `${formatNumber(p.pressureBar, 2)} bar` },
  { ru: 'Фокус', en: 'Focus', value: (p) => `${formatNumber(p.focusMm, 2)} mm` },
  { ru: 'Сопло', en: 'Nozzle', value: (p) => `${formatNumber(p.nozzleMm, 2)} mm` },
  { ru: 'Высота резки', en: 'Cut height', value: (p) => `${formatNumber(p.cutHeightMm, 2)} mm` },
  { ru: 'Высота пробивки', en: 'Pierce height', value: (p) => `${formatNumber(p.pierceHeightMm, 2)} mm` },
  { ru: 'Время пробивки', en: 'Pierce time', value: (p) => `${formatRpm(p.pierceTimeMs)} ms` },
  { ru: 'Мощность пробивки', en: 'Pierce power', value: (p) => `${formatRpm(p.piercePowerPct)} %` },
]

export function CypCutPanel({ params }: { params: CypCutParams }) {
  const [copied, setCopied] = useState(false)

  const text = rows.map((row) => `${row.en} / ${row.ru}: ${row.value(params)}`).join('\n')

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
          <p className="text-sm font-semibold">CypCut / RDWorks</p>
          <p className="mt-1 text-sm text-ink-soft">Слой резки: русские подписи и английские имена полей контроллера.</p>
        </div>
        <Button variant="outline" onClick={() => void copy()}>
          {copied ? 'Скопировано' : 'Скопировать слой'}
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[18rem] text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="pb-2 font-medium">RU</th>
              <th className="pb-2 font-medium">EN</th>
              <th className="pb-2 text-right font-medium">Значение</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.en} className="border-t border-line/80">
                <td className="py-2 pr-3">{row.ru}</td>
                <td className="py-2 pr-3 text-ink-soft">{row.en}</td>
                <td className="py-2 text-right font-mono font-semibold tabular-nums">{row.value(params)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
