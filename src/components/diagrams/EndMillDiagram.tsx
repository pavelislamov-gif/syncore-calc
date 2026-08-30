import type { EndMillType } from '@/types/tool'
import { formatMm } from '@/utils/toolGeometry'
import { DimensionChips } from './DimensionChips'

interface Props {
  diameterMm: number
  flutes: number
  type: EndMillType
  typeName: string
}

const artcamType: Record<EndMillType, string> = {
  endmill: 'Slot Drill',
  slot: 'Slot Drill',
  ball: 'Ball Nose',
  corner_radius: 'Radiused Slot Drill',
  chamfer: 'V-Bit',
  drill: 'Drill',
  special: 'Slot Drill',
}

export function EndMillDiagram({ diameterMm, flutes, type, typeName }: Props) {
  const d = Number.isFinite(diameterMm) && diameterMm > 0 ? diameterMm : 6
  const z = Number.isFinite(flutes) && flutes > 0 ? Math.min(12, Math.round(flutes)) : 2
  const corner = type === 'corner_radius' ? Math.min(1.5, d * 0.12) : 0
  const included = type === 'chamfer' ? 90 : type === 'drill' ? 118 : null
  const fluteLen = d * 4
  const tipR = type === 'ball' ? d / 2 : type === 'corner_radius' ? corner : 0

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-[#ece9e0]">
      <div className="flex items-baseline justify-between gap-3 px-3 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Профиль инструмента</p>
        <p className="text-[11px] text-muted">
          {typeName} · {artcamType[type]}
        </p>
      </div>
      <svg viewBox="0 0 420 216" className="h-auto w-full" role="img" aria-label={`${typeName} Ø${d} мм`}>
        <title>{`${artcamType[type]}, Ø ${d} мм`}</title>
        <ArtcamProfile type={type} d={d} corner={corner} included={included} fluteLen={fluteLen} />
        <ParamColumn d={d} z={z} tipR={tipR} included={included} fluteLen={fluteLen} type={type} />
      </svg>
      <div className="border-t border-line bg-paper px-3 pb-3">
        <DimensionChips
          items={[
            { label: 'Ø D', value: formatMm(d, d < 3 ? 2 : 1) },
            { label: 'z', value: String(z) },
            { label: 'Тип', value: typeName },
            ...(tipR > 0 ? [{ label: 'r', value: formatMm(tipR, 2) }] : []),
            ...(included != null ? [{ label: 'α', value: `${included}° (схема)` }] : []),
          ]}
        />
      </div>
    </div>
  )
}

function ArtcamProfile({
  type,
  d,
  corner,
  included,
  fluteLen,
}: {
  type: EndMillType
  d: number
  corner: number
  included: number | null
  fluteLen: number
}) {
  const cx = 128
  const scale = 7.2
  const cutR = Math.min(34, Math.max(14, (d / 2) * scale))
  const shankR = cutR * (type === 'drill' ? 1 : 0.62)
  const top = 18
  const shoulder = 52
  const flute = type === 'chamfer' || type === 'drill' || type === 'ball' ? 108 : 128
  const rPx = type === 'corner_radius' ? Math.max(5, Math.min(cutR * 0.35, corner * scale)) : 0
  const tipY =
    type === 'ball'
      ? flute + cutR
      : type === 'chamfer'
        ? flute + cutR / Math.tan(((included ?? 90) / 2) * (Math.PI / 180))
        : type === 'drill'
          ? flute + cutR / Math.tan(((included ?? 118) / 2) * (Math.PI / 180))
          : flute + 6

  const outline = profilePath(type, cx, cutR, shankR, top, shoulder, flute, tipY, rPx)

  return (
    <g>
      <path d={outline} fill="#c5c5c5" stroke="#111" strokeWidth="1.6" strokeLinejoin="miter" />
      <line x1={cx} y1={top + 2} x2={cx} y2={tipY} stroke="#888" strokeWidth="0.6" strokeDasharray="3 3" />

      <DimH x1={cx - cutR} x2={cx + cutR} y={tipY + 16} label={`D  ${formatMm(d, d < 3 ? 2 : 1)}`} />
      {type === 'ball' ? (
        <>
          <path
            d={`M ${cx} ${flute} A ${cutR} ${cutR} 0 0 0 ${cx + cutR} ${flute}`}
            fill="none"
            stroke="#111"
            strokeWidth="0.7"
            strokeDasharray="2 2"
          />
          <text x={cx + cutR + 10} y={flute + cutR * 0.45} fill="#111" fontSize="11" fontWeight="600">
            {`r ${formatMm(d / 2, 2)}`}
          </text>
        </>
      ) : null}
      {type === 'corner_radius' ? (
        <text x={cx + cutR + 8} y={tipY - 4} fill="#111" fontSize="11" fontWeight="600">
          {`r ${formatMm(corner, 2)}`}
        </text>
      ) : null}
      {included != null ? (
        <text x={cx + 10} y={flute + (tipY - flute) * 0.55} fill="#111" fontSize="11" fontWeight="600">
          {`α ${included}°`}
        </text>
      ) : null}
      <DimV x={cx - cutR - 22} y1={shoulder} y2={type === 'ball' ? flute : flute} label={`L ≈ ${formatMm(fluteLen, 0)}`} />
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
  if (type === 'corner_radius') {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${tipY - rPx} Q ${cr} ${tipY} ${cr - rPx} ${tipY} L ${cl + rPx} ${tipY} Q ${cl} ${tipY} ${cl} ${tipY - rPx} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  if (type === 'chamfer' || type === 'drill') {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${flute} L ${cx} ${tipY} L ${cl} ${flute} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${tipY} L ${cl} ${tipY} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
}

function ParamColumn({
  d,
  z,
  tipR,
  included,
  fluteLen,
  type,
}: {
  d: number
  z: number
  tipR: number
  included: number | null
  fluteLen: number
  type: EndMillType
}) {
  const rows: [string, string][] = [
    ['Tool Type', artcamType[type]],
    ['Diameter', formatMm(d, d < 3 ? 2 : 1)],
    ['Flute Length', `${formatMm(fluteLen, 0)} (4×D)`],
    ['Flutes', String(z)],
  ]
  if (tipR > 0) rows.splice(2, 0, ['Tip Radius', formatMm(tipR, 2)])
  if (included != null) rows.splice(tipR > 0 ? 3 : 2, 0, ['Included Angle', `${included}°`])

  return (
    <g>
      {rows.map(([label, value], i) => {
        const y = 28 + i * 28
        return (
          <g key={label}>
            <text x="248" y={y} fill="#5c564c" fontSize="10">
              {label}
            </text>
            <rect x="248" y={y + 4} width="154" height="18" fill="#fff" stroke="#b9b3a6" />
            <text x="256" y={y + 17} fill="#111" fontSize="11" fontWeight="600">
              {value}
            </text>
          </g>
        )
      })}
    </g>
  )
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
