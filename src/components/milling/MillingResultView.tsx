import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'
import type { MillingResult } from '@/types/milling'
import type { Material } from '@/types/material'
import { formatNumber, formatRpm } from '@/utils/format'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface Props {
  result: MillingResult
  material: Material
  onSaveHistory: () => void
  onSaveFavorite: () => void
}

export function MillingResultView({ result, material, onSaveHistory, onSaveFavorite }: Props) {
  const [showMath, setShowMath] = useState(false)
  const tone = result.status === 'ok' ? 'ok' : result.status === 'warning' ? 'warning' : 'error'

  return (
    <div id="milling-result" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <ResultHero value={formatRpm(result.rpm)} unit="об/мин" />
        <ResultHero value={formatRpm(result.feedMmMin)} unit="мм/мин" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Подача на зуб" value={`${formatNumber(result.fz, 3)} мм/зуб`} />
        <Metric label="Скорость резания" value={`${formatNumber(result.vc, 0)} м/мин`} />
        <Metric label="Глубина резания" value={`${formatNumber(result.ap, 2)} мм`} />
        <Metric label="Ширина резания" value={`${formatNumber(result.ae, 2)} мм`} />
      </div>
      <Metric label="Ориентировочная мощность" value={`${formatNumber(result.powerKw, 2)} кВт`} />

      <StatusBanner status={result.status} title={result.statusTitle}>
        {result.explanation}
      </StatusBanner>

      {result.checks.length > 0 ? (
        <ul className="space-y-2">
          {result.checks.map((check) => (
            <li key={check.id}>
              <Card className="p-4">
                <Badge tone={check.severity === 'ok' ? 'ok' : check.severity === 'warning' ? 'warning' : 'error'}>
                  {check.title}
                </Badge>
                <p className="mt-2 text-sm text-ink-soft">{check.detail}</p>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      <Card>
        <p className="text-sm font-semibold">Почему?</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{result.why}</p>
        <p className="mt-3 text-xs text-muted">
          Справочное значение / рекомендуемый диапазон для {material.name}. Это не гарантированный паспортный режим.
        </p>
      </Card>

      <div>
        <button type="button" className="text-sm font-semibold text-accent-2" onClick={() => setShowMath(!showMath)}>
          {showMath ? 'Скрыть расчёт' : 'Показать расчёт'}
        </button>
        {showMath ? (
          <ol className="mt-3 space-y-3">
            {result.steps.map((step) => (
              <li key={step.id} className="rounded-xl bg-paper-2 p-3">
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="mt-1 font-mono text-sm">{step.formula}</p>
                <p className="mt-1 text-sm text-ink-soft">{step.substitution}</p>
                <p className="mt-1 text-sm font-medium">{step.result}</p>
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onSaveHistory} fullWidth>
          Сохранить в историю
        </Button>
        <Button variant="outline" onClick={onSaveFavorite} fullWidth>
          <Star className="h-4 w-5" />В избранное
        </Button>
      </div>
      <Badge tone={tone}>Единицы: мм · мм/мин · м/мин · об/мин · кВт</Badge>
    </div>
  )
}

function ResultHero({ value, unit }: { value: string; unit: string }) {
  return (
    <Card className="bg-graphite text-white">
      <p className="font-mono text-3xl font-semibold tracking-tight md:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-white/70">{unit}</p>
    </Card>
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
