import { describe, expect, it } from 'vitest'
import { calculateLaser, qualityFactor, scaleSpeedForPower } from '@/engine/laser'
import { laserFamilyForCategory } from '@/data/laser/regimes'
import { roundTo } from '@/engine/units'

describe('laser families', () => {
  it('maps mill materials onto laser process families', () => {
    expect(laserFamilyForCategory('steel', 'st3')).toBe('mild_steel')
    expect(laserFamilyForCategory('stainless', 'aisi304')).toBe('stainless')
    expect(laserFamilyForCategory('aluminum', 'amg6')).toBe('aluminum')
    expect(laserFamilyForCategory('nonferrous', 'copper')).toBe('copper')
    expect(laserFamilyForCategory('plastic', 'acrylic')).toBe('acrylic')
    expect(laserFamilyForCategory('plastic', 'pvc')).toBe('plastic')
  })
})

describe('speed scaling', () => {
  it('raises speed sublinearly with power', () => {
    const v = scaleSpeedForPower(3800, 3000, 1500)
    expect(v).toBeGreaterThan(3800)
    expect(v).toBeLessThan(3800 * 2)
  })

  it('slows fine quality relative to standard', () => {
    expect(qualityFactor('fine')).toBeLessThan(qualityFactor('standard'))
    expect(qualityFactor('coarse')).toBeGreaterThan(1)
  })
})

describe('fiber mild steel 1.5 kW', () => {
  it('returns O2 cut speed, mm/s and pierce time for 3 mm Ст3', () => {
    const result = calculateLaser({
      materialId: 'st3',
      thicknessMm: 3,
      cutLengthMm: 1000,
      sourceKind: 'fiber',
      powerW: 1500,
      operation: 'cut',
      quality: 'standard',
      gasMode: 'auto',
      paramMode: 'auto',
      overrides: {},
    })
    expect(result.gas).toBe('O2')
    expect(result.speedMmMin).toBeGreaterThan(2500)
    expect(result.speedMmMin).toBeLessThan(5000)
    expect(roundTo(result.speedMmS, 2)).toBe(roundTo(result.speedMmMin / 60, 2))
    expect(result.pierceTimeMs).toBeGreaterThan(200)
    expect(result.powerPct).toBeGreaterThan(50)
    expect(result.status).toBe('ok')
  })

  it('uses nitrogen for stainless', () => {
    const result = calculateLaser({
      materialId: 'aisi304',
      thicknessMm: 2,
      cutLengthMm: 500,
      sourceKind: 'fiber',
      powerW: 1500,
      operation: 'cut',
      quality: 'standard',
      gasMode: 'auto',
      paramMode: 'auto',
      overrides: {},
    })
    expect(result.gas).toBe('N2')
    expect(result.pressureBar).toBeGreaterThan(8)
  })

  it('flags CO2 on steel as an error', () => {
    const result = calculateLaser({
      materialId: 'st3',
      thicknessMm: 3,
      cutLengthMm: 1000,
      sourceKind: 'co2',
      powerW: 100,
      operation: 'cut',
      quality: 'standard',
      gasMode: 'auto',
      paramMode: 'auto',
      overrides: {},
    })
    expect(result.status).toBe('error')
    expect(result.checks.some((item) => item.id === 'co2-metal')).toBe(true)
  })

  it('forbids PVC cutting', () => {
    const result = calculateLaser({
      materialId: 'pvc',
      thicknessMm: 3,
      cutLengthMm: 200,
      sourceKind: 'co2',
      powerW: 100,
      operation: 'cut',
      quality: 'standard',
      gasMode: 'auto',
      paramMode: 'auto',
      overrides: {},
    })
    expect(result.checks.some((item) => item.id === 'pvc')).toBe(true)
    expect(result.status).toBe('error')
  })

  it('rejects invalid thickness', () => {
    expect(() =>
      calculateLaser({
        materialId: 'st3',
        thicknessMm: 0,
        cutLengthMm: 100,
        sourceKind: 'fiber',
        powerW: 1500,
        operation: 'cut',
        quality: 'standard',
        gasMode: 'auto',
        paramMode: 'auto',
        overrides: {},
      }),
    ).toThrow(/0\.2 до 40/)
  })
})
