export interface ValidationError {
  field: string
  message: string
}

export function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function validateDiameter(diameterMm: number): ValidationError[] {
  if (!Number.isFinite(diameterMm)) {
    return [{ field: 'diameterMm', message: 'Укажите диаметр фрезы.' }]
  }
  if (diameterMm <= 0) {
    return [{ field: 'diameterMm', message: 'Диаметр фрезы должен быть больше нуля.' }]
  }
  if (diameterMm < 0.1 || diameterMm > 100) {
    return [{ field: 'diameterMm', message: 'Введите диаметр фрезы от 0.1 до 100 мм.' }]
  }
  return []
}

export function validateFlutes(flutes: number): ValidationError[] {
  if (!Number.isInteger(flutes)) {
    return [{ field: 'flutes', message: 'Количество зубьев должно быть целым числом.' }]
  }
  if (flutes < 1 || flutes > 12) {
    return [{ field: 'flutes', message: 'Количество зубьев должно быть от 1 до 12.' }]
  }
  return []
}

export function validateMachineLimits(input: {
  maxRpm: number
  maxFeedMmMin: number
  spindlePowerKw: number
  maxDepthMm: number
  colletDiameterMm: number
}): ValidationError[] {
  const errors: ValidationError[] = []
  if (!isPositive(input.maxRpm) || input.maxRpm > 120000) {
    errors.push({ field: 'maxRpm', message: 'Максимальные обороты станка: от 1 до 120 000 об/мин.' })
  }
  if (!isPositive(input.maxFeedMmMin) || input.maxFeedMmMin > 60000) {
    errors.push({ field: 'maxFeedMmMin', message: 'Максимальная подача: от 1 до 60 000 мм/мин.' })
  }
  if (!isPositive(input.spindlePowerKw) || input.spindlePowerKw > 100) {
    errors.push({ field: 'spindlePowerKw', message: 'Мощность шпинделя: от 0.05 до 100 кВт.' })
  }
  if (!isPositive(input.maxDepthMm) || input.maxDepthMm > 200) {
    errors.push({ field: 'maxDepthMm', message: 'Максимальная глубина резания станка: от 0.1 до 200 мм.' })
  }
  if (!isPositive(input.colletDiameterMm) || input.colletDiameterMm > 50) {
    errors.push({ field: 'colletDiameterMm', message: 'Диаметр цанги: от 0.5 до 50 мм.' })
  }
  return errors
}

export function validateOverride(
  field: string,
  value: number | undefined,
  min: number,
  max: number,
  label: string,
): ValidationError[] {
  if (value === undefined) return []
  if (!Number.isFinite(value)) {
    return [{ field, message: `Укажите ${label}.` }]
  }
  if (value <= 0) {
    return [{ field, message: `${label} должна быть больше нуля.` }]
  }
  if (value < min || value > max) {
    return [{ field, message: `${label}: допустимый ввод ${min}–${max}.` }]
  }
  return []
}
