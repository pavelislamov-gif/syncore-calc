import { ResultFooterBlock } from '@/components/results/ResultFooterBlock'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'
import type { MillingResult } from '@/types/milling'
import type { Material } from '@/types/material'
import { formatNumber, formatRpm } from '@/utils/format'

interface Props {
  result: MillingResult
  material: Material
  onSaveHistory: () => void
  onSaveFavorite: () => void
}

export function MillingResultView({ result, material, onSaveHistory, onSaveFavorite }: Props) {
  const tone = result.status === 'ok' ? 'ok' : result.status === 'warning' ? 'warning' : 'error'

  return (
    <div id="milling-result" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <ResultHero code="S" value={formatRpm(result.rpm)} unit="об/мин" />
        <ResultHero code="F" value={formatRpm(result.feedMmMin)} unit="мм/мин XY" />
        <ResultHero code="Fz" value={formatRpm(result.plungeMmMin)} unit="мм/мин по Z" />
      </div>
      <p className="text-sm leading-6 text-ink-soft">
        Fz — прямолинейное врезание по оси Z (консервативно, k_z {formatNumber(result.plungeRatio, 2)}).
        Винтовое врезание (ramping / helical):{' '}
        <strong className="text-ink">{formatRpm(result.helicalPlungeMmMin)} мм/мин</strong> ≈ 55% подачи XY. Концевой
        фрезой не стоит «сверлить» на полной F.
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Подача на зуб XY" value={`${formatNumber(result.fz, 2)} мм/зуб`} />
        <Metric label="Подача на зуб по Z" value={`${formatNumber(result.fzPlunge, 2)} мм/зуб`} />
        <Metric label="Скорость резания" value={`${formatNumber(result.vc, 2)} м/мин`} />
        <Metric label="Глубина резания" value={`${formatNumber(result.ap, 2)} мм`} />
        <Metric label="Ширина резания" value={`${formatNumber(result.ae, 2)} мм`} />
        <Metric label="Длина режущей части" value={`${formatNumber(result.geometry.fluteLengthMm, 2)} мм`} />
        {result.geometry.tipRadiusMm > 0 ? (
          <Metric label="Радиус r" value={`${formatNumber(result.geometry.tipRadiusMm, 2)} мм`} />
        ) : null}
        {result.geometry.includedAngleDeg != null ? (
          <Metric label="Угол α" value={`${formatNumber(result.geometry.includedAngleDeg, 0)}°`} />
        ) : null}
        <Metric label="Винтовое врезание" value={`${formatRpm(result.helicalPlungeMmMin)} мм/мин`} />
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

      <Badge tone={tone}>Единицы: мм · мм/мин · м/мин · об/мин · кВт</Badge>

      <ResultFooterBlock
        why={result.why}
        disclaimer={`Справочное значение / рекомендуемый диапазон для ${material.name}. Это не гарантированный паспортный режим.`}
        steps={result.steps}
        onSaveHistory={onSaveHistory}
        onSaveFavorite={onSaveFavorite}
      />
    </div>
  )
}

function ResultHero({ code, value, unit }: { code: string; value: string; unit: string }) {
  return (
    <Card className="min-w-0 bg-graphite text-white">
      <p className="text-xs font-bold tracking-[0.2em] text-accent">{code}</p>
      <p className="mt-1 whitespace-nowrap font-mono text-2xl font-semibold leading-none tabular-nums">
        {value}
      </p>
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
