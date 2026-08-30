import { CalculationError } from '../errors'

export function calculateTurningSpindleSpeed(vc: number, diameterMm: number): number {
  if (diameterMm <= 0) {
    throw new CalculationError('diameter', 'Введите диаметр заготовки от 1 до 800 мм.')
  }
  if (vc <= 0) {
    throw new CalculationError('vc', 'Скорость резания должна быть больше нуля.')
  }
  return (vc * 1000) / (Math.PI * diameterMm)
}

export function calculateTurningCuttingSpeed(rpm: number, diameterMm: number): number {
  if (diameterMm <= 0 || rpm <= 0) {
    throw new CalculationError('vc', 'Для расчёта Vc нужны положительные обороты и диаметр.')
  }
  return (Math.PI * diameterMm * rpm) / 1000
}

export function calculateTurningFeedRate(rpm: number, feedMmRev: number): number {
  if (rpm <= 0 || feedMmRev <= 0) {
    throw new CalculationError('feed', 'Подача и обороты должны быть больше нуля.')
  }
  return rpm * feedMmRev
}

export function calculateTurningPower(input: {
  kc: number
  ap: number
  feedMmRev: number
  vc: number
  efficiency?: number
}): number {
  const { kc, ap, feedMmRev, vc } = input
  if (kc <= 0 || ap <= 0 || feedMmRev <= 0 || vc <= 0) {
    throw new CalculationError('power', 'Для оценки мощности нужны положительные kc, ap, f и Vc.')
  }
  const efficiency = input.efficiency ?? 0.75
  return (kc * ap * feedMmRev * vc) / (60_000 * efficiency)
}

export function calculatePasses(stockMm: number, ap: number): number {
  if (ap <= 0) {
    throw new CalculationError('ap', 'Глубина резания должна быть больше нуля.')
  }
  if (stockMm <= 0) return 1
  return Math.max(1, Math.ceil(stockMm / ap - 1e-9))
}

export function calculateMachiningTimeMin(lengthMm: number, feedMmMin: number, passes: number): number {
  if (feedMmMin <= 0) {
    throw new CalculationError('time', 'Подача должна быть больше нуля для оценки времени.')
  }
  return (Math.max(lengthMm, 1) * passes) / feedMmMin
}
