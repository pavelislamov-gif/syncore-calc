import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'
import type { ThreadingResult } from '@/types/threading'
import { formatNumber, formatRpm } from '@/utils/format'

interface Props {
  result: ThreadingResult
}

export function ThreadingResultView({ result }: Props) {
  return (
    <div id="threading-result" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="min-w-0 bg-graphite text-white">
          <p className="text-sm text-white/70">{result.designation}</p>
          <p className="mt-1 whitespace-nowrap font-mono text-2xl font-semibold leading-none tabular-nums">
            {formatNumber(result.nominalDiameterMm, 2)}
          </p>
          <p className="text-sm text-white/70">мм · шаг {formatNumber(result.pitchMm, 2)}</p>
        </Card>
        <Card className="min-w-0 bg-graphite text-white">
          <p className="text-xs font-bold tracking-[0.2em] text-accent">S</p>
          <p className="mt-1 whitespace-nowrap font-mono text-2xl font-semibold leading-none tabular-nums">
            {formatRpm(result.rpm)}
          </p>
          <p className="mt-1 text-sm text-white/70">об/мин</p>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Metric label="Отверстие под резьбу" value={`${formatNumber(result.tapDrillMm, 2)} мм`} />
        <Metric label="Глубина резьбы" value={`${formatNumber(result.threadDepthMm, 2)} мм`} />
        <Metric label="Проходы" value={`${result.passes}`} />
        <Metric label="F · подача = шаг" value={`${formatNumber(result.feedMmRev, 2)} мм/об`} />
        <Metric label="F · минутная подача" value={`${formatRpm(result.feedMmMin)} мм/мин`} />
        <Metric label="Vc" value={`${formatNumber(result.vc, 2)} м/мин`} />
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
    </div>
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
