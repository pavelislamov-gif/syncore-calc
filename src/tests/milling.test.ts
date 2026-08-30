import { describe, expect, it } from 'vitest'
import {
  calculateCuttingSpeed,
  calculateFeedPerTooth,
  calculateFeedRate,
  calculateHelicalPlungeFeed,
  calculateMilling,
  calculatePlungeFeed,
  calculatePower,
  calculateSpindleSpeed,
  plungeRatio,
} from '@/engine'
import { CalculationError } from '@/engine/errors'
import { inchToMm, mmToInch, roundTo, wToKw } from '@/engine/units'
import { validateDiameter, validateFlutes } from '@/engine/validation'

describe('spindle speed', () => {
  it('computes n = (Vc × 1000) / (π × D)', () => {
    const n = calculateSpindleSpeed(339.292, 6)
    expect(roundTo(n, 0)).toBe(18000)
  })

  it('round-trips with cutting speed', () => {
    const vc = calculateCuttingSpeed(18000, 6)
    expect(roundTo(vc, 1)).toBe(339.3)
  })

  it('rejects non-positive diameter', () => {
    expect(() => calculateSpindleSpeed(100, 0)).toThrow(CalculationError)
  })
})

describe('feed', () => {
  it('computes Vf = n × z × fz', () => {
    expect(calculateFeedRate(18000, 2, 0.04)).toBe(1440)
  })

  it('computes fz from feed', () => {
    expect(calculateFeedPerTooth(1440, 18000, 2)).toBe(0.04)
  })

  it('computes Z plunge as a fraction of XY feed', () => {
    const k = plungeRatio(0.85, 'endmill')
    expect(k).toBeGreaterThanOrEqual(0.12)
    expect(k).toBeLessThanOrEqual(0.5)
    expect(calculatePlungeFeed(1440, k)).toBeLessThan(1440)
    expect(roundTo(calculateHelicalPlungeFeed(1440), 0)).toBe(792)
    expect(plungeRatio(0.85, 'drill')).toBeGreaterThan(plungeRatio(0.85, 'endmill'))
    expect(plungeRatio(0.85, 'ball')).toBeLessThan(plungeRatio(0.85, 'endmill'))
  })
})

describe('power', () => {
  it('estimates milling power from kc', () => {
    const p = calculatePower({
      ap: 1.5,
      ae: 3,
      feedMmMin: 1440,
      kc: 800,
      machineClass: 'hobby',
    })
    expect(p).toBeGreaterThan(0.05)
    expect(p).toBeLessThan(0.2)
  })
})

describe('units', () => {
  it('converts mm and inches', () => {
    expect(roundTo(inchToMm(1), 2)).toBe(25.4)
    expect(roundTo(mmToInch(25.4), 4)).toBe(1)
    expect(wToKw(1500)).toBe(1.5)
  })
})

describe('validation', () => {
  it('rejects diameter outside 0.1–100 mm', () => {
    expect(validateDiameter(0).length).toBeGreaterThan(0)
    expect(validateDiameter(120)[0]?.message).toContain('0.1 до 100')
    expect(validateDiameter(6)).toEqual([])
  })

  it('rejects invalid flute count', () => {
    expect(validateFlutes(0).length).toBeGreaterThan(0)
    expect(validateFlutes(2)).toEqual([])
  })
})

describe('milling engine AMg6 Ø6 2Z', () => {
  const base = {
    materialId: 'amg6',
    tool: {
      diameterMm: 6,
      flutes: 2,
      type: 'endmill' as const,
      cutterMaterial: 'Carbide' as const,
      coating: 'none' as const,
    },
    machine: {
      class: 'hobby' as const,
      name: 'Hobby',
      maxRpm: 18000,
      maxFeedMmMin: 2000,
      spindlePowerKw: 0.8,
      maxDepthMm: 5,
      colletDiameterMm: 6,
    },
    paramMode: 'auto' as const,
    machineClass: 'hobby' as const,
    expert: false,
    overrides: {},
  }

  it('clamps RPM to 18000 and yields ~339 m/min and fz ~0.04', () => {
    const result = calculateMilling(base)
    expect(result.rpm).toBe(18000)
    expect(roundTo(result.feedMmMin, 0)).toBe(1440)
    expect(roundTo(result.fz, 3)).toBe(0.04)
    expect(roundTo(result.vc, 0)).toBe(339)
    expect(roundTo(result.ap, 1)).toBe(1.5)
    expect(roundTo(result.ae, 1)).toBe(3)
    expect(result.clamped.rpm).toBe(true)
    expect(result.plungeMmMin).toBeLessThan(result.feedMmMin)
    expect(roundTo(result.plungeRatio, 3)).toBe(roundTo(plungeRatio(0.85, 'endmill'), 3))
    expect(roundTo(result.plungeMmMin, 1)).toBe(roundTo(1440 * result.plungeRatio, 1))
    expect(roundTo(result.helicalPlungeMmMin, 0)).toBe(792)
    expect(result.steps.some((step) => step.id === 'plunge')).toBe(true)
  })

  it('uses a higher Z plunge ratio for drills than for end mills', () => {
    const mill = calculateMilling(base)
    const drill = calculateMilling({
      ...base,
      tool: { ...base.tool, type: 'drill' },
    })
    expect(drill.plungeRatio).toBeGreaterThan(mill.plungeRatio)
    expect(drill.plungeMmMin).toBeGreaterThan(mill.plungeMmMin)
  })

  it('warns when theoretical RPM exceeds the machine', () => {
    const result = calculateMilling(base)
    expect(result.status === 'warning' || result.clamped.rpm).toBe(true)
    expect(result.checks.some((item) => item.detail.includes('18'))).toBe(true)
  })

  it('errors when tool is larger than the collet', () => {
    const result = calculateMilling({
      ...base,
      tool: { ...base.tool, diameterMm: 8 },
    })
    expect(result.status).toBe('error')
    expect(result.checks.some((item) => item.id === 'collet')).toBe(true)
  })

  it('uses manual overrides', () => {
    const result = calculateMilling({
      ...base,
      paramMode: 'manual',
      overrides: { vc: 100, fz: 0.03, ap: 1, ae: 2 },
    })
    expect(result.rpm).toBeLessThan(18000)
    expect(roundTo(result.fz, 3)).toBe(0.03)
  })

  it('throws a human-readable error for missing diameter range', () => {
    expect(() =>
      calculateMilling({
        ...base,
        tool: { ...base.tool, diameterMm: 0 },
      }),
    ).toThrow(/диаметр/i)
  })
})
