import type { CheckResult, CheckSeverity, FormulaStep, ParamMode } from './milling'

export type LaserSourceKind = 'fiber' | 'co2'
export type AssistGas = 'O2' | 'N2' | 'Air'
export type LaserQuality = 'fine' | 'standard' | 'coarse'
export type LaserOperation = 'cut' | 'engrave'

export type LaserFamily =
  | 'mild_steel'
  | 'stainless'
  | 'aluminum'
  | 'brass'
  | 'copper'
  | 'cast_iron'
  | 'acrylic'
  | 'plastic'
  | 'wood'

export interface LaserSourcePreset {
  id: string
  name: string
  kind: LaserSourceKind
  powerW: number
  notes: string
}

export interface LaserInput {
  materialId: string
  thicknessMm: number
  cutLengthMm: number
  sourceKind: LaserSourceKind
  powerW: number
  operation: LaserOperation
  quality: LaserQuality
  gasMode: 'auto' | 'manual'
  gas?: AssistGas
  paramMode: ParamMode
  overrides: {
    speedMmMin?: number
    powerPct?: number
  }
}

export interface LaserResult {
  family: LaserFamily
  speedMmMin: number
  speedMmS: number
  powerPct: number
  gas: AssistGas
  pressureBar: number
  focusMm: number
  nozzleMm: number
  pierceTimeMs: number
  piercePowerPct: number
  pierceHeightMm: number
  cutHeightMm: number
  frequencyHz: number
  dutyPct: number
  timeMin: number
  kerfMm: number
  minPowerW: number
  status: CheckSeverity
  statusTitle: string
  checks: CheckResult[]
  explanation: string
  why: string
  steps: FormulaStep[]
  usedRecommendedRanges: {
    speedMmMin: { min: number; max: number; recommended: number }
  }
}
