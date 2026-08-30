import type { InsertDefinition } from '@/types/insert'
import { formatMm, includedAngleDeg, insertKindLabel } from '@/utils/toolGeometry'
import { DimensionChips } from './DimensionChips'

interface Props {
  insert: InsertDefinition
}

export function InsertDiagram({ insert }: Props) {
  const angle = includedAngleDeg(insert.shape)
  const points = outline(insert, 78)

  return (
    <div className="mt-4 rounded-2xl bg-paper-2 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Схема пластины</p>
      <svg viewBox="0 0 320 176" className="mt-2 h-auto w-full" role="img" aria-label={insert.iso}>
        <title>{insert.iso}</title>
        <text x="78" y="18" textAnchor="middle" className="fill-ink" fontSize="11" fontWeight="600">
          План
        </text>
        <text x="230" y="18" textAnchor="middle" className="fill-ink" fontSize="11" fontWeight="600">
          Толщина
        </text>
        <g transform="translate(78 96)">
          {insert.shape === 'MRMN' ? (
            <circle r="58" className="fill-accent/20 stroke-graphite" strokeWidth="1.5" />
          ) : (
            <polygon points={points} className="fill-accent/20 stroke-graphite" strokeWidth="1.5" />
          )}
          <circle r={26} className="fill-none stroke-accent" strokeDasharray="4 3" strokeWidth="1.2" />
          {insert.noseRadiusMm > 0 && insert.shape !== 'MRMN' ? (
            <circle cx={noseX(insert)} cy={noseY(insert)} r={10} className="fill-none stroke-graphite" strokeWidth="1.2" />
          ) : null}
          <text y="82" textAnchor="middle" className="fill-ink-soft" fontSize="11">
            IC {formatMm(insert.inscribedCircleMm, 2)}
          </text>
        </g>
        <g transform="translate(186 48)">
          <rect width="88" height={Math.max(18, insert.thicknessMm * 8)} rx="3" className="fill-accent/20 stroke-graphite" strokeWidth="1.5" />
          <text x="100" y={Math.max(18, insert.thicknessMm * 8) / 2 + 4} className="fill-ink-soft" fontSize="11">
            s {formatMm(insert.thicknessMm, 2)}
          </text>
          <text x="44" y={Math.max(18, insert.thicknessMm * 8) + 22} textAnchor="middle" className="fill-ink-soft" fontSize="11">
            {insert.iso}
          </text>
        </g>
      </svg>
      <DimensionChips
        items={[
          { label: 'ISO', value: insert.iso },
          { label: 'Форма', value: insert.geometry },
          { label: 'IC', value: formatMm(insert.inscribedCircleMm, 2) },
          { label: 's', value: formatMm(insert.thicknessMm, 2) },
          { label: 're', value: formatMm(insert.noseRadiusMm, 2) },
          ...(angle ? [{ label: 'Угол', value: `${angle}°` }] : []),
          { label: 'Класс', value: insertKindLabel(insert) },
        ]}
      />
    </div>
  )
}

function outline(insert: InsertDefinition, scale: number): string {
  const shape = insert.shape
  if (shape === 'MGMN') {
    const w = 22
    const h = 58
    return `${-w},${-h} ${w},${-h} ${w},${h} ${-w},${h}`
  }
  const angle = includedAngleDeg(shape) ?? 80
  if (shape === 'TNMG' || shape === 'TCMT' || shape.startsWith('16')) {
    return triangle(scale)
  }
  if (shape === 'WNMG') {
    return trigon(scale)
  }
  return rhombus(scale, angle)
}

function rhombus(scale: number, acuteDeg: number): string {
  const acute = (acuteDeg * Math.PI) / 180
  const a = (2 * (scale * 0.45)) / Math.sin(acute)
  const h = a * Math.cos(acute / 2)
  const w = a * Math.sin(acute / 2)
  return `0,${-h} ${w},0 0,${h} ${-w},0`
}

function triangle(scale: number): string {
  const r = scale * 0.85
  return Array.from({ length: 3 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3
    return `${Math.cos(a) * r},${Math.sin(a) * r}`
  }).join(' ')
}

function trigon(scale: number): string {
  const r = scale * 0.82
  const pts: string[] = []
  for (let i = 0; i < 3; i += 1) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3
    const b = a + (2 * Math.PI) / 3
    const cut = 0.18
    pts.push(`${Math.cos(a + cut) * r},${Math.sin(a + cut) * r}`)
    pts.push(`${Math.cos(b - cut) * r},${Math.sin(b - cut) * r}`)
  }
  return pts.join(' ')
}

function noseX(insert: InsertDefinition): number {
  if (insert.shape.startsWith('T') || insert.shape.startsWith('16') || insert.shape === 'WNMG') return 0
  return 0
}

function noseY(insert: InsertDefinition): number {
  if (insert.shape === 'MGMN') return -50
  return -52
}
