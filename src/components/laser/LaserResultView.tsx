import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { LaserLayerSettings } from '@/components/laser/LaserLayerSettings'
import type { LaserResult } from '@/types/laser'
import type { Material } from '@/types/material'
import { formatNumber, formatRpm } from '@/utils/format'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface Props {
  result: LaserResult
  material: Material
  onSaveHistory: () => void
  onSaveFavorite: () => void
}

export function LaserResultView({ result, material, onSaveHistory, onSaveFavorite }: Props) {
  const [showMath, setShowMath] = useState(false)
  const tone = result.status === 'ok' ? 'ok' : result.status === 'warning' ? 'warning' : 'error'

  return (
    <div id="laser-result" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Hero code="F" value={formatRpm(result.speedMmMin)} unit="мм/мин" />
        <Hero code="P" value={`${formatRpm(result.powerPct)}`} unit="% мощности" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Metric label="Скорость" value={`${formatNumber(result.speedMmS, 2)} мм/с`} />
        <Metric label="Газ" value={result.gas} />
        <Metric label="Давление" value={`${formatNumber(result.pressureBar, 2)} бар`} />
        <Metric label="Фокус" value={`${formatNumber(result.focusMm, 2)} мм`} />
        <Metric label="Пробивка" value={`${formatRpm(result.pierceTimeMs)} мс`} />
        <Metric label="Время контура" value={`${formatNumber(result.timeMin, 2)} мин`} />
        <Metric label="Керф (оценка)" value={`${formatNumber(result.kerfMm, 2)} мм`} />
        <Metric label="Мин. мощность" value={`${formatRpm(result.minPowerW)} Вт`} />
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

      <LaserLayerSettings result={result} />

      <Card>
        <p className="text-sm font-semibold">Почему?</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{result.why}</p>
        <p className="mt-3 text-xs text-muted">
          Справочное значение для {material.name}. Фактический режим зависит от головы, сопла, чистоты оптики и газа.
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
      <Badge tone={tone}>Единицы: мм · мм/мин · мм/с · % · бар · Вт</Badge>
    </div>
  )
}

function Hero({ code, value, unit }: { code: string; value: string; unit: string }) {
  return (
    <Card className="min-w-0 bg-graphite text-white">
      <p className="text-xs font-bold tracking-[0.2em] text-accent">{code}</p>
      <p className="mt-1 whitespace-nowrap font-mono text-2xl font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-white/70">{unit}</p>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="min-w-0 p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 whitespace-nowrap font-mono text-lg font-semibold tabular-nums">{value}</p>
    </Card>
  )
}
