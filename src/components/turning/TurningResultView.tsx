import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'
import type { TurningResult } from '@/types/turning'
import { formatNumber, formatRpm } from '@/utils/format'

interface Props {
  result: TurningResult
}

export function TurningResultView({ result }: Props) {
  const tone = result.status === 'ok' ? 'ok' : result.status === 'warning' ? 'warning' : 'error'

  return (
    <div id="turning-result" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Hero code="S" value={formatRpm(result.rpm)} unit="об/мин" />
        <Hero code="F" value={formatRpm(result.feedMmMin)} unit="мм/мин" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Metric label="f · подача" value={`${formatNumber(result.feedMmRev, 2)} мм/об`} />
        <Metric label="Скорость резания" value={`${formatNumber(result.vc, 2)} м/мин`} />
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

      <Badge tone={tone}>Единицы: мм · мм/об · мм/мин · м/мин · об/мин · кВт</Badge>
    </div>
  )
}

function Hero({ code, value, unit }: { code: string; value: string; unit: string }) {
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
