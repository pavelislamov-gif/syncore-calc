import { describe, expect, it } from 'vitest'
import { calculatePasses, calculateTurning, calculateTurningFeedRate, calculateTurningPower, calculateTurningSpindleSpeed } from '@/engine/turning'
import { calculateTapDrill, calculateThread, calculateThreadDepth } from '@/engine/threading'
import { roundTo } from '@/engine/units'
import { defaultLathe } from '@/data/machines/lathes'

const lathe = {
  ...defaultLathe(),
  class: 'industrial' as const,
  maxRpm: 3000,
  maxFeedMmMin: 3000,
  spindlePowerKw: 7.5,
  maxDepthMm: 8,
  colletDiameterMm: 400,
}

describe('turning kinematics', () => {
  it('computes n = (Vc × 1000) / (π × D)', () => {
    const n = calculateTurningSpindleSpeed(180, 50)
    expect(roundTo(n, 0)).toBe(1146)
  })

  it('computes Vf = n × f', () => {
    expect(roundTo(calculateTurningFeedRate(1146, 0.28), 0)).toBe(321)
  })

  it('estimates turning power', () => {
    const p = calculateTurningPower({ kc: 2000, ap: 2, feedMmRev: 0.28, vc: 180, efficiency: 0.8 })
    expect(p).toBeGreaterThan(2)
    expect(p).toBeLessThan(5)
  })

  it('computes number of passes', () => {
    expect(calculatePasses(3, 2)).toBe(2)
  })
})

describe('turning Ст45 CNMG 120408', () => {
  it('returns rpm, feed, vc, ap, passes and power', () => {
    const result = calculateTurning({
      materialId: 'st45',
      operation: 'rough_od',
      diameterMm: 50,
      lengthMm: 80,
      stockMm: 3,
      insertId: 'CNMG120408',
      paramMode: 'auto',
      machine: lathe,
      overrides: {},
    })
    expect(result.rpm).toBeGreaterThan(800)
    expect(result.rpm).toBeLessThan(3000)
    expect(result.feedMmRev).toBeGreaterThan(0.1)
    expect(result.feedMmRev).toBeLessThan(0.8)
    expect(result.ap).toBeGreaterThan(0.5)
    expect(result.passes).toBeGreaterThanOrEqual(1)
    expect(result.powerKw).toBeGreaterThan(0)
    expect(result.vc).toBeGreaterThan(50)
  })

  it('rejects invalid diameter', () => {
    expect(() =>
      calculateTurning({
        materialId: 'st45',
        operation: 'rough_od',
        diameterMm: 0,
        lengthMm: 80,
        stockMm: 3,
        insertId: 'CNMG120408',
        paramMode: 'auto',
        machine: lathe,
        overrides: {},
      }),
    ).toThrow(/диаметр/i)
  })
})

describe('metric thread', () => {
  it('computes tap drill ≈ D − P', () => {
    expect(calculateTapDrill(20, 2.5)).toBe(17.5)
  })

  it('computes thread depth H1 = 0.54127 × P', () => {
    expect(roundTo(calculateThreadDepth(2.5), 3)).toBe(1.353)
  })

  it('sets feed per revolution equal to pitch', () => {
    const result = calculateThread({
      materialId: 'st45',
      designation: 'M20',
      pitchMm: 2.5,
      diameterMm: 20,
      lengthMm: 30,
      internal: true,
      paramMode: 'auto',
      machine: lathe,
    })
    expect(result.feedMmRev).toBe(2.5)
    expect(result.tapDrillMm).toBe(17.5)
    expect(result.passes).toBeGreaterThanOrEqual(4)
    expect(result.rpm).toBeGreaterThan(0)
  })
})
