import type { TurningOperation } from '@/types/turning'
import type { TurningMaterialParams } from '@/types/turning'
import type { InsertDefinition } from '@/types/insert'
import type { CutterKind } from '@/data/tools/cutters'

export function recommendTurningVc(
  params: TurningMaterialParams,
  operation: TurningOperation,
  cutter?: CutterKind,
): number {
  const base = params.vcCarbide.recommended
  const factor: Record<TurningOperation, number> = {
    rough_od: 0.9,
    finish_od: 1.05,
    face: 0.9,
    bore: 0.75,
    groove: 0.55,
    cutoff: 0.45,
    drill: 0.55,
  }
  return base * factor[operation] * (cutter?.vcFactor ?? 1)
}

export function recommendTurningFeed(
  params: TurningMaterialParams,
  operation: TurningOperation,
  insert: InsertDefinition | null,
  cutter?: CutterKind,
): number {
  const finish = operation === 'finish_od'
  let feed = finish ? params.feedFinish.recommended : params.feedRough.recommended
  if (operation === 'groove' || operation === 'cutoff') feed = Math.min(feed, 0.12)
  if (operation === 'drill') feed = Math.min(params.feedRough.recommended, 0.2)
  if (insert?.duty === 'grooving') feed = Math.min(feed, 0.12)
  if (insert && insert.duty !== 'threading') {
    const cap = operation === 'finish_od' ? insert.noseRadiusMm * 0.5 : insert.noseRadiusMm * 0.8
    if (cap > 0) feed = Math.min(feed, cap)
  }
  return feed * (cutter?.feedFactor ?? 1)
}

export function recommendTurningAp(params: TurningMaterialParams, operation: TurningOperation, stockMm: number): number {
  if (operation === 'finish_od') return Math.min(params.depthFinish.recommended, stockMm || params.depthFinish.recommended)
  if (operation === 'groove' || operation === 'cutoff') {
    return Math.min(params.depthRough.recommended, stockMm || params.depthRough.recommended)
  }
  const raw = params.depthRough.recommended
  if (stockMm > 0) return Math.min(raw, stockMm)
  return raw
}

export function vcRangeForOperation(params: TurningMaterialParams, operation: TurningOperation, cutter?: CutterKind) {
  const recommended = recommendTurningVc(params, operation, cutter)
  const base = params.vcCarbide.recommended || 1
  const factor = recommended / base
  return {
    min: params.vcCarbide.min * factor,
    max: params.vcCarbide.max * factor,
    recommended,
  }
}
