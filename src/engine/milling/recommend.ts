import { getCoating } from '@/data/tools'
import type { Material, NumericRange } from '@/types/material'
import type { CoatingId, CutterMaterial } from '@/types/tool'

export function pickFzBand(material: Material, diameterMm: number) {
  const sorted = [...material.milling.fzBands].sort((a, b) => a.maxDiameterMm - b.maxDiameterMm)
  const last = sorted[sorted.length - 1]
  if (!last) {
    throw new Error('Material is missing fz bands')
  }
  return sorted.find((band) => diameterMm <= band.maxDiameterMm) ?? last
}

export function recommendVc(
  material: Material,
  cutterMaterial: CutterMaterial,
  coating: CoatingId,
): NumericRange {
  const base = cutterMaterial === 'HSS' ? material.milling.vc.hss : material.milling.vc.carbide
  const multiplier = getCoating(coating).vcMultiplier
  return {
    min: base.min,
    max: base.max * Math.max(1, multiplier),
    recommended: base.recommended * multiplier,
    provenance: base.provenance,
  }
}

export function recommendFz(material: Material, diameterMm: number, cutterMaterial: CutterMaterial): NumericRange {
  const band = pickFzBand(material, diameterMm)
  return cutterMaterial === 'HSS' ? band.hss : band.carbide
}

export function conservativeVc(range: NumericRange, machineClass: 'hobby' | 'industrial'): number {
  if (machineClass === 'hobby') {
    return range.min + (range.recommended - range.min) * 0.75
  }
  return range.recommended
}
