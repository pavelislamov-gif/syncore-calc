import { CalculationError } from '../errors'

export function calculateFeedRate(rpm: number, flutes: number, fz: number): number {
  if (rpm <= 0) {
    throw new CalculationError('rpm', 'Обороты должны быть больше нуля.')
  }
  if (flutes < 1) {
    throw new CalculationError('flutes', 'Количество зубьев должно быть от 1 до 12.')
  }
  if (fz <= 0) {
    throw new CalculationError('fz', 'Подача на зуб должна быть больше нуля.')
  }
  return rpm * flutes * fz
}

export function calculateFeedPerTooth(feedMmMin: number, rpm: number, flutes: number): number {
  if (rpm <= 0 || flutes < 1) {
    throw new CalculationError('fz', 'Невозможно рассчитать fz: обороты и число зубьев должны быть больше нуля.')
  }
  if (feedMmMin <= 0) {
    throw new CalculationError('feed', 'Подача должна быть больше нуля.')
  }
  return feedMmMin / (rpm * flutes)
}
