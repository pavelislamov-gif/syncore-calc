import type { NumericRange } from '@/types/material'

export function range(
  min: number,
  max: number,
  recommended = (min + max) / 2,
  provenance: NumericRange['provenance'] = 'handbook_range',
): NumericRange {
  return { min, max, recommended, provenance }
}

export function fzBands(
  rows: Array<{
    maxD: number
    hss: [number, number, number?]
    carbide: [number, number, number?]
  }>,
) {
  return rows.map((row) => ({
    maxDiameterMm: row.maxD,
    hss: range(row.hss[0], row.hss[1], row.hss[2]),
    carbide: range(row.carbide[0], row.carbide[1], row.carbide[2]),
  }))
}
