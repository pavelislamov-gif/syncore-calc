import type { CheckResult, CheckSeverity, FormulaStep } from './milling'
import type { ParamMode } from './milling'
import type { MachineLimits } from './machine'

export interface MetricThread {
  designation: string
  diameterMm: number
  coarsePitchMm: number
  pitchesMm: number[]
}

export interface ThreadingInput {
  materialId: string
  designation: string
  pitchMm: number
  diameterMm: number
  lengthMm: number
  internal: boolean
  paramMode: ParamMode
  machine: MachineLimits
  vcOverride?: number
}

export interface ThreadingResult {
  designation: string
  nominalDiameterMm: number
  pitchMm: number
  tapDrillMm: number
  threadDepthMm: number
  passes: number
  rpm: number
  feedMmRev: number
  feedMmMin: number
  vc: number
  status: CheckSeverity
  statusTitle: string
  checks: CheckResult[]
  explanation: string
  why: string
  steps: FormulaStep[]
}
