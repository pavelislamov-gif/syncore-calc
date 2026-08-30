import { CalculationError } from '../errors'

export function calculateSpindleSpeed(vc: number, diameterMm: number): number {
  if (diameterMm <= 0) {
    throw new CalculationError('diameter', 'Введите диаметр фрезы от 0.1 до 100 мм.')
  }
  if (vc <= 0) {
    throw new CalculationError('vc', 'Скорость резания должна быть больше нуля.')
  }
  return (vc * 1000) / (Math.PI * diameterMm)
}

export function calculateCuttingSpeed(rpm: number, diameterMm: number): number {
  if (diameterMm <= 0) {
    throw new CalculationError('diameter', 'Введите диаметр фрезы от 0.1 до 100 мм.')
  }
  if (rpm <= 0) {
    throw new CalculationError('rpm', 'Обороты должны быть больше нуля.')
  }
  return (Math.PI * diameterMm * rpm) / 1000
}
