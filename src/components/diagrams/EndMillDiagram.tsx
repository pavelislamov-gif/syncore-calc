import type { EndMillType } from '@/types/tool'
import { formatMm } from '@/utils/toolGeometry'
import { DimensionChips } from './DimensionChips'

interface Props {
  diameterMm: number
  flutes: number
  type: EndMillType
  typeName: string
}

export function EndMillDiagram({ diameterMm, flutes, type, typeName }: Props) {
  const d = Number.isFinite(diameterMm) && diameterMm > 0 ? diameterMm : 6
  const z = Number.isFinite(flutes) && flutes > 0 ? Math.min(12, Math.round(flutes)) : 2
  const corner = type === 'corner_radius' ? Math.min(1.5, d * 0.12) : 0
  const ballR = d / 2
  const length = d * 4
  const shank = Math.max(d, 6)

  return (
    <div className="mt-4 rounded-2xl bg-paper-2 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Схема инструмента</p>
      <svg viewBox="0 0 320 168" className="mt-2 h-auto w-full" role="img" aria-label={`Фреза ${typeName} Ø${d} мм, ${z} зубьев`}>
        <title>{`${typeName}, диаметр ${d} мм`}</title>
        <TopView cx={64} cy={84} z={z} type={type} />
        <SideView x={130} y={28} d={d} type={type} corner={corner} />
        <text x="64" y="18" textAnchor="middle" className="fill-ink" fontSize="11" fontWeight="600">
          Вид сверху
        </text>
        <text x="210" y="18" textAnchor="middle" className="fill-ink" fontSize="11" fontWeight="600">
          Вид сбоку
        </text>
        <text x="64" y="160" textAnchor="middle" className="fill-ink-soft" fontSize="11">
          Ø {formatMm(d, d < 3 ? 2 : 1)}
        </text>
        <text x="210" y="160" textAnchor="middle" className="fill-ink-soft" fontSize="11">
          L ≈ {formatMm(length, 0)} (ориентир 4×D)
        </text>
      </svg>
      <DimensionChips
        items={[
          { label: 'Ø D', value: formatMm(d, d < 3 ? 2 : 1) },
          { label: 'z', value: String(z) },
          { label: 'Тип', value: typeName },
          ...(type === 'ball' ? [{ label: 'r', value: formatMm(ballR, 2) }] : []),
          ...(type === 'corner_radius' ? [{ label: 'r угла', value: `${formatMm(corner, 2)} (схема)` }] : []),
          ...(type === 'chamfer' ? [{ label: 'Фаска', value: '45° (схема)' }] : []),
          { label: 'Хвостовик', value: `≈ ${formatMm(shank, 0)}` },
        ]}
      />
    </div>
  )
}

function TopView({ cx, cy, z, type }: { cx: number; cy: number; z: number; type: EndMillType }) {
  const r = 38
  const gullet = type === 'slot' ? 0.55 : 0.72
  const teeth = Array.from({ length: z }, (_, i) => {
    const a0 = (i / z) * Math.PI * 2 - Math.PI / 2
    const a1 = a0 + (Math.PI * 2) / z
    const outer = polar(cx, cy, r, a0 + 0.08)
    const inner = polar(cx, cy, r * gullet, (a0 + a1) / 2)
    const outer2 = polar(cx, cy, r, a1 - 0.08)
    return `L ${outer.x} ${outer.y} L ${inner.x} ${inner.y} L ${outer2.x} ${outer2.y}`
  }).join(' ')
  const start = polar(cx, cy, r, -Math.PI / 2)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 8} className="fill-white" />
      <path
        d={`M ${start.x} ${start.y} ${teeth} Z`}
        className="fill-accent/20 stroke-graphite"
        strokeWidth="1.4"
      />
      <circle cx={cx} cy={cy} r={4} className="fill-graphite" />
      {type === 'ball' ? <circle cx={cx} cy={cy} r={r} className="fill-none stroke-accent" strokeDasharray="3 3" strokeWidth="1" /> : null}
    </g>
  )
}

function SideView({
  x,
  y,
  d,
  type,
  corner,
}: {
  x: number
  y: number
  d: number
  type: EndMillType
  corner: number
}) {
  const w = 48
  const h = 110
  const tip = type === 'ball' ? w / 2 : type === 'chamfer' || type === 'drill' ? 18 : 8
  const left = x + 40
  const right = left + w
  const shankTop = y
  const fluteStart = y + 28
  const tipY = y + h
  const rPx = type === 'corner_radius' ? Math.max(5, Math.min(12, corner * 8)) : 0

  let tipPath = `L ${left} ${tipY - tip} L ${left + w / 2} ${tipY} L ${right} ${tipY - tip}`
  if (type === 'ball') {
    tipPath = `L ${left} ${tipY - w / 2} A ${w / 2} ${w / 2} 0 0 0 ${right} ${tipY - w / 2}`
  } else if (type === 'corner_radius') {
    tipPath = `L ${left} ${tipY - 6 - rPx} Q ${left} ${tipY - 4} ${left + rPx} ${tipY - 4} L ${right - rPx} ${tipY - 4} Q ${right} ${tipY - 4} ${right} ${tipY - 6 - rPx}`
  }

  return (
    <g>
      <path
        d={`M ${left + 6} ${shankTop} L ${right - 6} ${shankTop} L ${right - 6} ${fluteStart} L ${right} ${fluteStart} ${tipPath} L ${left} ${fluteStart} L ${left + 6} ${fluteStart} Z`}
        className="fill-accent/20 stroke-graphite"
        strokeWidth="1.4"
      />
      <path d={`M ${left} ${fluteStart} L ${right} ${fluteStart}`} className="stroke-ink/30" strokeDasharray="4 3" />
      <text x={right + 14} y={fluteStart + (tipY - fluteStart) / 2} className="fill-ink-soft" fontSize="10">
        Ø {d} мм
      </text>
    </g>
  )
}

function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
}
