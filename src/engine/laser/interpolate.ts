import type { LaserThicknessPoint } from '@/data/laser/regimes'

export function interpolatePoints(thicknessMm: number, points: LaserThicknessPoint[]): LaserThicknessPoint {
  const sorted = [...points].sort((a, b) => a.thicknessMm - b.thicknessMm)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  if (thicknessMm <= first.thicknessMm) {
    const ratio = first.thicknessMm / Math.max(thicknessMm, 0.05)
    const boost = ratio ** 0.35
    return scalePoint(first, thicknessMm, boost, 0.85)
  }
  if (thicknessMm >= last.thicknessMm) {
    const ratio = thicknessMm / last.thicknessMm
    const slow = ratio ** 1.15
    return scalePoint(last, thicknessMm, 1 / slow, ratio ** 1.1)
  }

  let lo = first
  let hi = last
  for (let i = 0; i < sorted.length - 1; i++) {
    if (thicknessMm >= sorted[i].thicknessMm && thicknessMm <= sorted[i + 1].thicknessMm) {
      lo = sorted[i]
      hi = sorted[i + 1]
      break
    }
  }
  const t = logT(thicknessMm, lo.thicknessMm, hi.thicknessMm)
  return {
    thicknessMm,
    speedMmMin: {
      min: lerp(lo.speedMmMin.min, hi.speedMmMin.min, t),
      max: lerp(lo.speedMmMin.max, hi.speedMmMin.max, t),
      recommended: lerp(lo.speedMmMin.recommended, hi.speedMmMin.recommended, t),
    },
    minPowerW: lerp(lo.minPowerW, hi.minPowerW, t),
  }
}

export function scaleSpeedForPower(speedMmMin: number, powerW: number, referenceW: number): number {
  const ratio = Math.min(2.2, Math.max(0.2, Math.max(powerW, 1) / referenceW))
  return speedMmMin * ratio ** 0.65
}

export function qualityFactor(quality: 'fine' | 'standard' | 'coarse'): number {
  if (quality === 'fine') return 0.72
  if (quality === 'coarse') return 1.15
  return 1
}

function scalePoint(point: LaserThicknessPoint, thicknessMm: number, speedFactor: number, powerFactor: number): LaserThicknessPoint {
  return {
    thicknessMm,
    speedMmMin: {
      min: point.speedMmMin.min * speedFactor,
      max: point.speedMmMin.max * speedFactor,
      recommended: point.speedMmMin.recommended * speedFactor,
    },
    minPowerW: point.minPowerW * powerFactor,
  }
}

function logT(x: number, x0: number, x1: number): number {
  if (x1 === x0) return 0
  return (Math.log(x) - Math.log(x0)) / (Math.log(x1) - Math.log(x0))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
