import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'
import type { TurningResult } from '@/types/turning'
import type { Material } from '@/types/material'
import { formatNumber, formatRpm } from '@/utils/format'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface Props {
  result: TurningResult
  material: Material
  onSaveHistory: () => void
  onSaveFavorite: () => void
}

export function TurningResultView({ result, material, onSaveHistory, onSaveFavorite }: Props) {
  const [showMath, setShowMath] = useState(false)
  const tone = result.status === 'ok' ? 'ok' : result.status === 'warning' ? 'warning' : 'error'

  return (
    <div id="turning-result" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Hero value={formatRpm(result.rpm)} unit="об/мин" />
        <Hero value={formatNumber(result.feedMmMin, 0)} unit="мм/мин" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Metric label="Подача" value={`${formatNumber(result.feedMmRev, 3)} мм/об`} />
        <Metric label="Скорость резания" value={`${formatNumber(result.vc, 0)} м/мин`} />
        <Metric label="Глубина резания" value={`${formatNumber(result.ap, 2)} мм`} />
        <Metric label="Проходы" value={`${result.passes}`} />
        <Metric label="Мощность (оценка)" value={`${formatNumber(result.powerKw, 2)} кВт`} />
        <Metric label="Время (оценка)" value={`${formatNumber(result.timeMin, 2)} мин`} />
      </div>

      <StatusBanner status={result.status} title={result.statusTitle}>
        {result.explanation}
      </StatusBanner>

      {result.checks.map((check) => (
        <Card key={check.id} className="p-4">
          <Badge tone={check.severity === 'warning' ? 'warning' : check.severity === 'error' ? 'error' : 'ok'}>
            {check.title}
          </Badge>
          <p className="mt-2 text-sm text-ink-soft">{check.detail}</p>
        </Card>
      ))}

      <Card>
        <p className="text-sm font-semibold">Почему?</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{result.why}</p>
        <p className="mt-3 text-xs text-muted">
          Справочное значение для {material.name}. Фактический режим зависит от сплава пластины, СОЖ и жёсткости.
        </p>
      </Card>

      <div>
        <button type="button" className="text-sm font-semibold text-accent-2" onClick={() => setShowMath(!showMath)}>
          {showMath ? 'Скрыть расчёт' : 'Показать расчёт'}
        </button>
        {showMath
          ? result.steps.map((step) => (
              <div key={step.id} className="mt-3 rounded-xl bg-paper-2 p-3">
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="mt-1 font-mono text-sm">{step.formula}</p>
                <p className="mt-1 text-sm text-ink-soft">{step.substitution}</p>
                <p className="mt-1 text-sm font-medium">{step.result}</p>
              </div>
            ))
          : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onSaveHistory} fullWidth>
          Сохранить в историю
        </Button>
        <Button variant="outline" onClick={onSaveFavorite} fullWidth>
          <Star className="h-4 w-4" />В избранное
        </Button>
      </div>
      <Badge tone={tone}>Единицы: мм · мм/об · мм/мин · м/мин · об/мин · кВт</Badge>
    </div>
  )
}

function Hero({ value, unit }: { value: string; unit: string }) {
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
