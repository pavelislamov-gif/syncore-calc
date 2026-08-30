import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'
import type { ThreadingResult } from '@/types/threading'
import type { Material } from '@/types/material'
import { formatNumber, formatRpm } from '@/utils/format'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface Props {
  result: ThreadingResult
  material: Material
  onSaveHistory: () => void
  onSaveFavorite: () => void
}

export function ThreadingResultView({ result, material, onSaveHistory, onSaveFavorite }: Props) {
  const [showMath, setShowMath] = useState(false)
  return (
    <div id="threading-result" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-graphite text-white">
          <p className="text-sm text-white/70">{result.designation}</p>
          <p className="mt-1 font-mono text-3xl font-semibold">{formatNumber(result.nominalDiameterMm, 1)}</p>
          <p className="text-sm text-white/70">мм · шаг {formatNumber(result.pitchMm, 2)}</p>
        </Card>
        <Card className="bg-graphite text-white">
          <p className="text-xs font-bold tracking-[0.2em] text-accent">S</p>
          <p className="mt-1 font-mono text-3xl font-semibold">{formatRpm(result.rpm)}</p>
          <p className="mt-1 text-sm text-white/70">об/мин</p>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Metric label="Отверстие под резьбу" value={`${formatNumber(result.tapDrillMm, 2)} мм`} />
        <Metric label="Глубина резьбы" value={`${formatNumber(result.threadDepthMm, 3)} мм`} />
        <Metric label="Проходы" value={`${result.passes}`} />
        <Metric label="F · подача = шаг" value={`${formatNumber(result.feedMmRev, 2)} мм/об`} />
        <Metric label="F · минутная подача" value={`${formatNumber(result.feedMmMin, 0)} мм/мин`} />
        <Metric label="Vc" value={`${formatNumber(result.vc, 0)} м/мин`} />
      </div>
      <StatusBanner status={result.status} title={result.statusTitle}>
        {result.explanation}
      </StatusBanner>
      {result.checks.map((check) => (
        <Card key={check.id} className="p-4">
          <Badge tone={check.severity === 'error' ? 'error' : 'warning'}>{check.title}</Badge>
          <p className="mt-2 text-sm text-ink-soft">{check.detail}</p>
        </Card>
      ))}
      <Card>
        <p className="text-sm font-semibold">Почему?</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{result.why}</p>
        <p className="mt-3 text-xs text-muted">Справочно для {material.name}. Дюймовая резьба — на следующем шаге.</p>
      </Card>
      <button type="button" className="text-sm font-semibold text-accent-2" onClick={() => setShowMath(!showMath)}>
        {showMath ? 'Скрыть расчёт' : 'Показать расчёт'}
      </button>
      {showMath
        ? result.steps.map((step) => (
            <div key={step.id} className="rounded-xl bg-paper-2 p-3">
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="mt-1 font-mono text-sm">{step.formula}</p>
              <p className="mt-1 text-sm">{step.substitution}</p>
              <p className="mt-1 font-medium">{step.result}</p>
            </div>
          ))
        : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onSaveHistory} fullWidth>
          Сохранить в историю
        </Button>
        <Button variant="outline" onClick={onSaveFavorite} fullWidth>
          <Star className="h-4 w-4" />В избранное
        </Button>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </Card>
  )
}
