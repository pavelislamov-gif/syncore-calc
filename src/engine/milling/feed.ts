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

/**
 * Straight Z plunge is much slower than XY feed: poor chip evacuation, few teeth cutting axially.
 * Vf_z = Vf × k, fz_z = fz × k. k is a handbook-range factor, not a catalog guarantee.
 */
export function plungeRatio(machinability: number, millType: string): number {
  const byType: Record<string, number> = {
    endmill: 1,
    slot: 0.9,
    corner_radius: 0.9,
    ball: 0.65,
    chamfer: 0.45,
    drill: 1.15,
    special: 0.8,
  }
  const typeK = byType[millType] ?? 1
  return Math.min(0.5, Math.max(0.12, (0.16 + 0.24 * machinability) * typeK))
}

export function calculatePlungeFeed(feedMmMin: number, ratio: number): number {
  if (feedMmMin <= 0) {
    throw new CalculationError('plunge', 'Подача должна быть больше нуля.')
  }
  return feedMmMin * ratio
}

export function calculateHelicalPlungeFeed(feedMmMin: number): number {
  return feedMmMin * 0.55
}
