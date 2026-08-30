import type { MetricThread } from '@/types/threading'

export const metricThreads: MetricThread[] = [
  { designation: 'M3', diameterMm: 3, coarsePitchMm: 0.5, pitchesMm: [0.5, 0.35] },
  { designation: 'M4', diameterMm: 4, coarsePitchMm: 0.7, pitchesMm: [0.7, 0.5] },
  { designation: 'M5', diameterMm: 5, coarsePitchMm: 0.8, pitchesMm: [0.8, 0.5] },
  { designation: 'M6', diameterMm: 6, coarsePitchMm: 1, pitchesMm: [1, 0.75] },
  { designation: 'M8', diameterMm: 8, coarsePitchMm: 1.25, pitchesMm: [1.25, 1] },
  { designation: 'M10', diameterMm: 10, coarsePitchMm: 1.5, pitchesMm: [1.5, 1.25, 1] },
  { designation: 'M12', diameterMm: 12, coarsePitchMm: 1.75, pitchesMm: [1.75, 1.5, 1.25] },
  { designation: 'M14', diameterMm: 14, coarsePitchMm: 2, pitchesMm: [2, 1.5] },
  { designation: 'M16', diameterMm: 16, coarsePitchMm: 2, pitchesMm: [2, 1.5] },
  { designation: 'M18', diameterMm: 18, coarsePitchMm: 2.5, pitchesMm: [2.5, 2, 1.5] },
  { designation: 'M20', diameterMm: 20, coarsePitchMm: 2.5, pitchesMm: [2.5, 2, 1.5] },
  { designation: 'M22', diameterMm: 22, coarsePitchMm: 2.5, pitchesMm: [2.5, 2, 1.5] },
  { designation: 'M24', diameterMm: 24, coarsePitchMm: 3, pitchesMm: [3, 2] },
  { designation: 'M27', diameterMm: 27, coarsePitchMm: 3, pitchesMm: [3, 2] },
  { designation: 'M30', diameterMm: 30, coarsePitchMm: 3.5, pitchesMm: [3.5, 2] },
]

export function getMetricThread(designation: string): MetricThread | undefined {
  return metricThreads.find((item) => item.designation === designation)
}

export const threadingFormulas = {
  tapDrill: 'd1 ≈ D − P (метрическая внутренняя, приближение)',
  depth: 'H1 = 0.54127 × P',
  feed: 'f = P (подача резца = шаг за оборот)',
  spindle: 'n = (Vc × 1000) / (π × D)',
} as const
