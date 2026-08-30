import type { EndMillType } from '@/types/tool'
import { artcamToolTypeName } from '@/data/tools/geometry'
import { formatMm } from '@/utils/toolGeometry'
import { DimensionChips } from './DimensionChips'

interface Props {
  diameterMm: number
  flutes: number
  type: EndMillType
  typeName: string
  fluteLengthMm?: number
  shankDiameterMm?: number
  tipRadiusMm?: number
  includedAngleDeg?: number | null
}

export function EndMillDiagram({
  diameterMm,
  flutes,
  type,
  typeName,
  fluteLengthMm,
  shankDiameterMm,
  tipRadiusMm,
  includedAngleDeg,
}: Props) {
  const d = Number.isFinite(diameterMm) && diameterMm > 0 ? diameterMm : 6
  const z = Number.isFinite(flutes) && flutes > 0 ? Math.min(12, Math.round(flutes)) : 2
  const angle = Number.isFinite(includedAngleDeg) ? (includedAngleDeg as number) : type === 'chamfer' ? 90 : type === 'drill' ? 118 : null
  const fluteLen = Number.isFinite(fluteLengthMm) && (fluteLengthMm as number) > 0 ? (fluteLengthMm as number) : d * 4
  const shankD = Number.isFinite(shankDiameterMm) && (shankDiameterMm as number) > 0 ? (shankDiameterMm as number) : Math.max(d, 6)
  const tipR = type === 'ball' ? d / 2 : Number.isFinite(tipRadiusMm) && (tipRadiusMm as number) > 0 ? (tipRadiusMm as number) : 0

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-[#ece9e0]">
      <div className="flex items-baseline justify-between gap-3 px-3 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Профиль по размерам</p>
        <p className="text-[11px] text-muted">
          {typeName} · {artcamToolTypeName[type]}
        </p>
      </div>
      <svg viewBox="0 0 360 216" className="h-auto w-full" role="img" aria-label={`${typeName} Ø${d} мм`}>
        <title>{`${artcamToolTypeName[type]}, Ø ${d} мм`}</title>
        <ArtcamProfile type={type} d={d} tipR={tipR} included={angle} fluteLen={fluteLen} shankD={shankD} />
      </svg>
      <div className="border-t border-line bg-paper px-3 pb-3">
        <DimensionChips
          items={[
            { label: 'Ø D', value: formatMm(d, d < 3 ? 2 : 1) },
            { label: 'z', value: String(z) },
            { label: 'L', value: formatMm(fluteLen, 1) },
            { label: 'Хвостовик', value: formatMm(shankD, 1) },
            ...(tipR > 0 ? [{ label: 'r', value: formatMm(tipR, 2) }] : []),
            ...(angle != null ? [{ label: 'α', value: `${angle}°` }] : []),
          ]}
        />
      </div>
    </div>
  )
}

function ArtcamProfile({
  type,
  d,
  tipR,
  included,
  fluteLen,
  shankD,
}: {
  type: EndMillType
  d: number
  tipR: number
  included: number | null
  fluteLen: number
  shankD: number
}) {
  const cx = 180
  const scale = 7.2
  const cutR = Math.min(34, Math.max(14, (d / 2) * scale))
  const shankR = Math.max(8, cutR * Math.min(1, shankD / d) * 0.95)
  const top = 18
  const shoulder = 52
  const flute = type === 'chamfer' || type === 'drill' || type === 'ball' ? 108 : 128
  const rPx = tipR > 0 && type !== 'ball' ? Math.max(4, Math.min(cutR * 0.85, (tipR / (d / 2)) * cutR)) : 0
  const half = ((included ?? 90) / 2) * (Math.PI / 180)
  const tipY =
    type === 'ball'
      ? flute + cutR
      : type === 'chamfer' || type === 'drill'
        ? flute + cutR / Math.tan(half)
        : flute + 6

  const outline = profilePath(type, cx, cutR, shankR, top, shoulder, flute, tipY, rPx)

  return (
    <g>
      <path d={outline} fill="#c5c5c5" stroke="#111" strokeWidth="1.6" strokeLinejoin="miter" />
      <line x1={cx} y1={top + 2} x2={cx} y2={tipY} stroke="#888" strokeWidth="0.6" strokeDasharray="3 3" />
      <DimH x1={cx - cutR} x2={cx + cutR} y={Math.min(tipY + 16, 200)} label={`D  ${formatMm(d, d < 3 ? 2 : 1)}`} />
      {tipR > 0 ? (
        <text x={cx + cutR + 10} y={type === 'ball' ? flute + cutR * 0.45 : tipY - 4} fill="#111" fontSize="11" fontWeight="600">
          {`r ${formatMm(tipR, 2)}`}
        </text>
      ) : null}
      {included != null ? (
        <text x={cx + 10} y={flute + (tipY - flute) * 0.55} fill="#111" fontSize="11" fontWeight="600">
          {`α ${included}°`}
        </text>
      ) : null}
      <DimV x={cx - cutR - 22} y1={shoulder} y2={flute} label={`L ${formatMm(fluteLen, 1)}`} />
    </g>
  )
}

function profilePath(
  type: EndMillType,
  cx: number,
  cutR: number,
  shankR: number,
  top: number,
  shoulder: number,
  flute: number,
  tipY: number,
  rPx: number,
): string {
  const sl = cx - shankR
  const sr = cx + shankR
  const cl = cx - cutR
  const cr = cx + cutR
  if (type === 'ball') {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${flute} A ${cutR} ${cutR} 0 0 1 ${cl} ${flute} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  if (type === 'corner_radius' || (rPx > 0 && type !== 'chamfer' && type !== 'drill')) {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${tipY - rPx} Q ${cr} ${tipY} ${cr - rPx} ${tipY} L ${cl + rPx} ${tipY} Q ${cl} ${tipY} ${cl} ${tipY - rPx} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  if (type === 'chamfer' || type === 'drill') {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${flute} L ${cx} ${tipY} L ${cl} ${flute} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${tipY} L ${cl} ${tipY} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
}

function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y - 8} x2={x1} y2={y} stroke="#111" strokeWidth="0.9" />
      <line x1={x2} y1={y - 8} x2={x2} y2={y} stroke="#111" strokeWidth="0.9" />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#111" strokeWidth="0.9" />
      <polygon points={`${x1},${y} ${x1 + 7},${y - 2.5} ${x1 + 7},${y + 2.5}`} fill="#111" />
      <polygon points={`${x2},${y} ${x2 - 7},${y - 2.5} ${x2 - 7},${y + 2.5}`} fill="#111" />
      <text x={(x1 + x2) / 2} y={y + 13} textAnchor="middle" fill="#111" fontSize="11" fontWeight="600">
        {label}
      </text>
    </g>
  )
}

function DimV({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x + 8} y2={y1} stroke="#111" strokeWidth="0.8" />
      <line x1={x} y1={y2} x2={x + 8} y2={y2} stroke="#111" strokeWidth="0.8" />
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#111" strokeWidth="0.8" />
      <polygon points={`${x},${y1} ${x - 2.5},${y1 + 7} ${x + 2.5},${y1 + 7}`} fill="#111" />
      <polygon points={`${x},${y2} ${x - 2.5},${y2 - 7} ${x + 2.5},${y2 - 7}`} fill="#111" />
      <text x={x - 6} y={(y1 + y2) / 2} textAnchor="end" fill="#111" fontSize="10" fontWeight="600">
        {label}
      </text>
    </g>
  )
}
