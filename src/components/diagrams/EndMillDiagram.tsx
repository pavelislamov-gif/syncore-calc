import type { CutterMaterial, EndMillType } from '@/types/tool'
import { formatMm } from '@/utils/toolGeometry'
import { useId } from 'react'
import { DimensionChips } from './DimensionChips'

interface Props {
  diameterMm: number
  flutes: number
  type: EndMillType
  typeName: string
  cutterMaterial?: CutterMaterial
}

export function EndMillDiagram({ diameterMm, flutes, type, typeName, cutterMaterial = 'Carbide' }: Props) {
  const uid = useId().replace(/:/g, '')
  const d = Number.isFinite(diameterMm) && diameterMm > 0 ? diameterMm : 6
  const z = Number.isFinite(flutes) && flutes > 0 ? Math.min(12, Math.round(flutes)) : 2
  const corner = type === 'corner_radius' ? Math.min(1.5, d * 0.12) : 0
  const included = type === 'chamfer' ? 90 : type === 'drill' ? 118 : null
  const metal = cutterMaterial === 'HSS' ? 'hss' : 'carbide'

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper-2">
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Инструмент</p>
        <p className="text-[11px] text-muted">Профиль как в CAM · {typeName}</p>
      </div>
      <svg
        viewBox="0 0 420 228"
        className="mt-1 h-auto w-full"
        role="img"
        aria-label={`${typeName} Ø${d} мм, ${z} зубьев`}
      >
        <title>{`${typeName}, диаметр ${d} мм`}</title>
        <defs>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={metal === 'hss' ? '#8a5a18' : '#6d7480'} />
            <stop offset="22%" stopColor={metal === 'hss' ? '#e8c36a' : '#d5dde6'} />
            <stop offset="48%" stopColor={metal === 'hss' ? '#fff3c4' : '#f4f7fa'} />
            <stop offset="72%" stopColor={metal === 'hss' ? '#c9963a' : '#9aa4b2'} />
            <stop offset="100%" stopColor={metal === 'hss' ? '#5c3d0c' : '#3f4650'} />
          </linearGradient>
          <linearGradient id={`${uid}-gold-dark`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={metal === 'hss' ? '#6a4512' : '#4a515a'} />
            <stop offset="50%" stopColor={metal === 'hss' ? '#b8832e' : '#7b8490'} />
            <stop offset="100%" stopColor={metal === 'hss' ? '#4a2c08' : '#2b3038'} />
          </linearGradient>
          <radialGradient id={`${uid}-cap`} cx="38%" cy="38%" r="70%">
            <stop offset="0%" stopColor={metal === 'hss' ? '#fff6d4' : '#ffffff'} />
            <stop offset="55%" stopColor={metal === 'hss' ? '#d7a84a' : '#c2cad4'} />
            <stop offset="100%" stopColor={metal === 'hss' ? '#6b4514' : '#4c5560'} />
          </radialGradient>
          <linearGradient id={`${uid}-block`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d7c49a" />
            <stop offset="100%" stopColor="#9a7d48" />
          </linearGradient>
          <linearGradient id={`${uid}-block-top`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0e2c0" />
            <stop offset="100%" stopColor="#c9ae78" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="232" height="228" fill="#1b2128" />
        <text x="12" y="18" fill="#8b939e" fontSize="10" fontWeight="600">
          3D вид
        </text>
        <Mill3D uid={uid} type={type} z={z} cx={116} />

        <rect x="232" y="0" width="188" height="228" fill="#f4f1ea" />
        <text x="326" y="18" textAnchor="middle" fill="#3d4450" fontSize="10" fontWeight="600">
          Профиль (база инструмента)
        </text>
        <CamProfile type={type} d={d} corner={corner} included={included} />
      </svg>
      <div className="border-t border-line bg-paper px-3 pb-3">
        <DimensionChips
          items={[
            { label: 'Ø D', value: formatMm(d, d < 3 ? 2 : 1) },
            { label: 'z', value: String(z) },
            { label: 'Тип', value: typeName },
            ...(type === 'ball' ? [{ label: 'r', value: formatMm(d / 2, 2) }] : []),
            ...(type === 'corner_radius' ? [{ label: 'r угла', value: `${formatMm(corner, 2)} (схема)` }] : []),
            ...(included != null ? [{ label: 'α', value: `${included}° (схема)` }] : []),
          ]}
        />
      </div>
    </div>
  )
}

function Mill3D({ uid, type, z, cx }: { uid: string; type: EndMillType; z: number; cx: number }) {
  const cutR = type === 'chamfer' ? 26 : 24
  const shankR = 13
  const shankTop = 28
  const shoulder = 78
  const fluteEnd = type === 'ball' ? 168 : type === 'chamfer' || type === 'drill' ? 150 : 178
  const tipY = type === 'ball' ? fluteEnd + cutR * 0.72 : type === 'chamfer' ? 196 : type === 'drill' ? 198 : 186

  const left = cx - cutR
  const right = cx + cutR
  const tipPath = tipOutline(type, cx, cutR, fluteEnd, tipY)

  return (
    <g>
      <ellipse cx={cx} cy={214} rx="70" ry="7" fill="#000" opacity="0.35" />
      <path d="M46 204 L186 204 L200 218 L32 218 Z" fill={`url(#${uid}-block)`} />
      <path d="M46 204 L70 192 L210 192 L186 204 Z" fill={`url(#${uid}-block-top)`} />
      <path d="M186 204 L200 218 L210 192 Z" fill="#7a6238" />

      <ellipse cx={cx} cy={shankTop} rx={shankR} ry="6" fill={`url(#${uid}-cap)`} stroke="#2a3038" strokeWidth="0.6" />
      <path
        d={`M ${cx - shankR} ${shankTop} L ${cx - shankR} ${shoulder} A ${shankR} 6 0 0 0 ${cx + shankR} ${shoulder} L ${cx + shankR} ${shankTop}`}
        fill={`url(#${uid}-gold-dark)`}
      />
      <ellipse cx={cx} cy={shoulder} rx={shankR} ry="6" fill={`url(#${uid}-cap)`} opacity="0.85" />

      <path
        d={`M ${left} ${shoulder + 8} L ${left} ${fluteEnd} ${tipPath} L ${right} ${fluteEnd} L ${right} ${shoulder + 8} A ${cutR} 8 0 0 0 ${left} ${shoulder + 8} Z`}
        fill={`url(#${uid}-gold)`}
        stroke="#2a3038"
        strokeWidth="0.7"
      />
      <ellipse cx={cx} cy={shoulder + 8} rx={cutR} ry="8" fill={`url(#${uid}-cap)`} stroke="#2a3038" strokeWidth="0.5" />

      <HelicalFlutes cx={cx} r={cutR - 1} y0={shoulder + 14} y1={fluteEnd - 4} z={z} type={type} />

      {type === 'ball' ? (
        <ellipse cx={cx} cy={fluteEnd} rx={cutR} ry="7" fill={`url(#${uid}-cap)`} opacity="0.45" />
      ) : null}

      <path
        d={`M ${cx - 4} ${shankTop + 2} L ${cx - 7} ${fluteEnd - 8}`}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.28"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  )
}

function tipOutline(type: EndMillType, cx: number, r: number, fluteEnd: number, tipY: number): string {
  const left = cx - r
  const right = cx + r
  if (type === 'ball') {
    return `A ${r} ${r * 0.92} 0 0 0 ${right} ${fluteEnd}`
  }
  if (type === 'corner_radius') {
    const cr = 8
    return `L ${left} ${tipY - cr} Q ${left} ${tipY} ${left + cr} ${tipY} L ${right - cr} ${tipY} Q ${right} ${tipY} ${right} ${tipY - cr}`
  }
  if (type === 'chamfer') {
    return `L ${cx} ${tipY}`
  }
  if (type === 'drill') {
    return `L ${cx - 3} ${tipY} L ${cx + 3} ${tipY}`
  }
  return `L ${left} ${tipY} L ${right} ${tipY}`
}

function HelicalFlutes({
  cx,
  r,
  y0,
  y1,
  z,
  type,
}: {
  cx: number
  r: number
  y0: number
  y1: number
  z: number
  type: EndMillType
}) {
  if (type === 'chamfer' || type === 'drill') {
    const n = type === 'drill' ? 2 : 1
    return (
      <g opacity="0.35">
        {Array.from({ length: n }, (_, i) => (
          <line
            key={i}
            x1={cx + (i === 0 ? -r * 0.4 : r * 0.4)}
            y1={y0}
            x2={cx}
            y2={y1 + 18}
            stroke="#1a1e24"
            strokeWidth="1.4"
          />
        ))}
      </g>
    )
  }

  const turns = 1.15
  const paths = Array.from({ length: z }, (_, i) => helixPath(cx, r, y0, y1, turns, (i / z) * Math.PI * 2))

  return (
    <g>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#1a1e24" strokeOpacity="0.42" strokeWidth="3.2" strokeLinecap="round" />
      ))}
      {paths.map((d, i) => (
        <path key={`h${i}`} d={d} fill="none" stroke="#fff8e6" strokeOpacity="0.18" strokeWidth="1" />
      ))}
    </g>
  )
}

function helixPath(cx: number, r: number, y0: number, y1: number, turns: number, phase: number): string {
  const n = 48
  let d = ''
  let drawing = false
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const a = phase + t * turns * Math.PI * 2
    const x = cx + r * Math.sin(a)
    const y = y0 + (y1 - y0) * t
    const front = Math.cos(a) > 0.02
    if (front) {
      d += `${drawing ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `
      drawing = true
    } else {
      drawing = false
    }
  }
  return d
}

function CamProfile({
  type,
  d,
  corner,
  included,
}: {
  type: EndMillType
  d: number
  corner: number
  included: number | null
}) {
  const cx = 326
  const cutR = 22
  const shankR = 13
  const top = 32
  const shoulder = 78
  const flute = 150
  const tipY = type === 'ball' ? 172 : type === 'chamfer' ? 188 : type === 'drill' ? 190 : 176
  const outline = camOutline(type, cx, cutR, shankR, top, shoulder, flute, tipY)

  return (
    <g>
      <line x1={cx} y1={top} x2={cx} y2={tipY + 4} stroke="#c5bba8" strokeDasharray="3 3" />
      <path d={outline} fill="#d8dde4" stroke="#2d3340" strokeWidth="1.4" />
      <path d={outline} fill="none" stroke="#c45c9a" strokeWidth="0.7" opacity="0.85" />

      <DimH x1={cx - cutR} x2={cx + cutR} y={tipY + 16} label={`D ${formatMm(d, d < 3 ? 2 : 1)}`} />
      {type === 'ball' ? <DimNote x={cx + cutR + 10} y={flute + 8} text={`r ${formatMm(d / 2, 2)}`} /> : null}
      {type === 'corner_radius' ? <DimNote x={cx + cutR + 10} y={tipY - 6} text={`r ${formatMm(corner, 2)}`} /> : null}
      {included != null ? <DimNote x={cx + 18} y={flute + 18} text={`α ${included}°`} /> : null}
      <text x={cx} y={218} textAnchor="middle" fill="#6b7280" fontSize="9">
        Справочный контур, не чертёж
      </text>
    </g>
  )
}

function camOutline(
  type: EndMillType,
  cx: number,
  cutR: number,
  shankR: number,
  top: number,
  shoulder: number,
  flute: number,
  tipY: number,
): string {
  const sl = cx - shankR
  const sr = cx + shankR
  const cl = cx - cutR
  const cr = cx + cutR
  if (type === 'ball') {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${flute} A ${cutR} ${cutR} 0 0 1 ${cl} ${flute} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  if (type === 'corner_radius') {
    const r = 7
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${tipY - r} Q ${cr} ${tipY} ${cr - r} ${tipY} L ${cl + r} ${tipY} Q ${cl} ${tipY} ${cl} ${tipY - r} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  if (type === 'chamfer') {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cx} ${tipY} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
  }
  if (type === 'drill') {
    return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${flute} L ${cx} ${tipY} L ${sl} ${flute} Z`
  }
  return `M ${sl} ${top} L ${sr} ${top} L ${sr} ${shoulder} L ${cr} ${shoulder} L ${cr} ${tipY} L ${cl} ${tipY} L ${cl} ${shoulder} L ${sl} ${shoulder} Z`
}

function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y - 10} x2={x1} y2={y} stroke="#3d4450" strokeWidth="0.8" />
      <line x1={x2} y1={y - 10} x2={x2} y2={y} stroke="#3d4450" strokeWidth="0.8" />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#3d4450" strokeWidth="0.8" markerStart="" />
      <polygon points={`${x1},${y} ${x1 + 6},${y - 2.4} ${x1 + 6},${y + 2.4}`} fill="#3d4450" />
      <polygon points={`${x2},${y} ${x2 - 6},${y - 2.4} ${x2 - 6},${y + 2.4}`} fill="#3d4450" />
      <text x={(x1 + x2) / 2} y={y + 12} textAnchor="middle" fill="#3d4450" fontSize="10" fontWeight="600">
        {label}
      </text>
    </g>
  )
}

function DimNote({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} fill="#3d4450" fontSize="10" fontWeight="600">
      {text}
    </text>
  )
}
