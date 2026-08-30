import type { MachineClass } from '@/types/machine'
import { CalculationError } from '../errors'

const DEFAULT_EFFICIENCY: Record<MachineClass, number> = {
  hobby: 0.6,
  industrial: 0.8,
}

export function calculatePower(input: {
  ap: number
  ae: number
  feedMmMin: number
  kc: number
  efficiency?: number
  machineClass?: MachineClass
}): number {
  const { ap, ae, feedMmMin, kc } = input
  if (ap <= 0 || ae <= 0 || feedMmMin <= 0 || kc <= 0) {
    throw new CalculationError('power', 'Для оценки мощности нужны положительные ap, ae, подача и kc.')
  }
  const efficiency = input.efficiency ?? DEFAULT_EFFICIENCY[input.machineClass ?? 'hobby']
  return (ap * ae * feedMmMin * kc) / (60 * 1e6 * efficiency)
}

export function recommendDepth(diameterMm: number, ratio: number, maxDepthMm: number, fluteLengthMm = Infinity): number {
  return Math.min(diameterMm * ratio, maxDepthMm, fluteLengthMm)
}

export function recommendWidth(diameterMm: number, ratio: number): number {
  return diameterMm * ratio
}
