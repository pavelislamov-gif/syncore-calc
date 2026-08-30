import type { PlanId } from './plan'

export type MaterialCategory =
  | 'aluminum'
  | 'steel'
  | 'stainless'
  | 'nonferrous'
  | 'plastic'
  | 'wood'
  | 'cast_iron'

export type DataProvenance = 'reference' | 'handbook_range' | 'estimated'

export interface NumericRange {
  min: number
  max: number
  recommended: number
  provenance: DataProvenance
}

export interface CutterSpeedTable {
  hss: NumericRange
  carbide: NumericRange
}

export interface FeedByDiameterBand {
  maxDiameterMm: number
  hss: NumericRange
  carbide: NumericRange
}

export interface MillingMaterialParams {
  vc: CutterSpeedTable
  fzBands: FeedByDiameterBand[]
  specificCuttingForceKc: number
  apToDiameter: { hobby: number; industrial: number }
  aeToDiameter: { hobby: number; industrial: number }
}

export interface Material {
  id: string
  name: string
  shortName: string
  category: MaterialCategory
  subCategory?: string
  hardness?: string
  densityKgM3?: number
  machinability: number
  milling: MillingMaterialParams
  notes: string
  plan: PlanId
}
