import type { MachineClass, MachineLimits } from './machine'
import type { MillToolInput } from './tool'

export type ParamMode = 'auto' | 'manual'
export type CheckSeverity = 'ok' | 'warning' | 'error'

export interface MillingOverrides {
  vc?: number
  fz?: number
  ap?: number
  ae?: number
}

export interface MillingInput {
  materialId: string
  tool: MillToolInput
  machine: MachineLimits
  paramMode: ParamMode
  machineClass: MachineClass
  expert: boolean
  overrides: MillingOverrides
}

export interface CheckResult {
  id: string
  severity: CheckSeverity
  title: string
  detail: string
}

export interface FormulaStep {
  id: string
  label: string
  formula: string
  substitution: string
  result: string
}

export interface MillingResult {
  rpm: number
  feedMmMin: number
  vc: number
  fz: number
  ap: number
  ae: number
  powerKw: number
  status: CheckSeverity
  statusTitle: string
  checks: CheckResult[]
  explanation: string
  why: string
  steps: FormulaStep[]
  usedRecommendedRanges: {
    vc: { min: number; max: number; recommended: number }
    fz: { min: number; max: number; recommended: number }
  }
  clamped: {
    rpm: boolean
    feed: boolean
    ap: boolean
    ae: boolean
  }
}
