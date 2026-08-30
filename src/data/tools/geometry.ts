import type { EndMillType } from '@/types/tool'

export const artcamToolTypeName: Record<EndMillType, string> = {
  endmill: 'Slot Drill',
  slot: 'Slot Drill',
  ball: 'Ball Nose',
  corner_radius: 'Radiused Slot Drill',
  chamfer: 'V-Bit',
  drill: 'Drill',
  special: 'Slot Drill',
}

export interface ToolGeometryDefaults {
  fluteLengthMm: number
  shankDiameterMm: number
  tipRadiusMm: number
  includedAngleDeg: number | null
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function defaultToolGeometry(type: EndMillType, diameterMm: number): ToolGeometryDefaults {
  const d = Number.isFinite(diameterMm) && diameterMm > 0 ? diameterMm : 6
  return {
    fluteLengthMm: round(type === 'drill' ? d * 5 : d * 4, 1),
    shankDiameterMm: d <= 6 ? 6 : d,
    tipRadiusMm: type === 'ball' ? round(d / 2, 3) : type === 'corner_radius' ? round(Math.min(1, d * 0.1), 2) : 0,
    includedAngleDeg: type === 'chamfer' ? 90 : type === 'drill' ? 118 : null,
  }
}

export function toolGeometryFields(type: EndMillType): {
  tipRadius: boolean
  tipRadiusLocked: boolean
  includedAngle: boolean
} {
  return {
    tipRadius: type === 'ball' || type === 'corner_radius' || type === 'chamfer' || type === 'special',
    tipRadiusLocked: type === 'ball',
    includedAngle: type === 'chamfer' || type === 'drill',
  }
}

export function geometryToFormFields(type: EndMillType, diameterMm: number): {
  fluteLength: string
  shankDiameter: string
  tipRadius: string
  includedAngle: string
} {
  const g = defaultToolGeometry(type, diameterMm)
  return {
    fluteLength: String(g.fluteLengthMm),
    shankDiameter: String(g.shankDiameterMm),
    tipRadius: String(g.tipRadiusMm),
    includedAngle: g.includedAngleDeg == null ? '' : String(g.includedAngleDeg),
  }
}
