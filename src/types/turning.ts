import type { NumericRange } from './material'
import type { ParamMode, CheckSeverity, CheckResult, FormulaStep } from './milling'
import type { MachineLimits } from './machine'

export type TurningOperation =
  | 'rough_od'
  | 'finish_od'
  | 'face'
  | 'bore'
  | 'groove'
  | 'cutoff'
  | 'drill'

export interface TurningMaterialParams {
  vcCarbide: NumericRange
  feedRough: NumericRange
  feedFinish: NumericRange
  depthRough: NumericRange
  depthFinish: NumericRange
  kc: number
}

export interface TurningOverrides {
  vc?: number
  feedMmRev?: number
  ap?: number
}

export interface TurningInput {
  materialId: string
  operation: TurningOperation
  diameterMm: number
  lengthMm: number
  stockMm: number
  insertId: string | null
  paramMode: ParamMode
  machine: MachineLimits
  overrides: TurningOverrides
}

export interface TurningResult {
  rpm: number
  feedMmRev: number
  feedMmMin: number
  vc: number
  ap: number
  passes: number
  powerKw: number
  timeMin: number
  status: CheckSeverity
  statusTitle: string
  checks: CheckResult[]
  explanation: string
  why: string
  steps: FormulaStep[]
  usedRecommendedRanges: {
    vc: { min: number; max: number; recommended: number }
    feed: { min: number; max: number; recommended: number }
  }
  clamped: { rpm: boolean; feed: boolean }
}
