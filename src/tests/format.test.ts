import { describe, expect, it } from 'vitest'
import { formatDec, formatInt } from '@/engine/units'
import { formatNumber, formatRpm } from '@/utils/format'

describe('display formatting', () => {
  it('shows spindle and feed as integers', () => {
    expect(formatRpm(1031.4)).toBe('1031')
    expect(formatInt(289.2)).toBe('289')
  })

  it('shows feed per rev, cutting speed, and power with two decimals', () => {
    expect(formatNumber(0.2801, 2)).toBe('0.28')
    expect(formatDec(162, 2)).toBe('162.00')
    expect(formatDec(0.641, 2)).toBe('0.64')
  })

  it('shows depth of cut and machining time with two decimals', () => {
    expect(formatNumber(0.25, 2)).toBe('0.25')
    expect(formatNumber(3.321, 2)).toBe('3.32')
  })
})
