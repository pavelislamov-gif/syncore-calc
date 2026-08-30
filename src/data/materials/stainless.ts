import type { Material } from '@/types/material'
import { fzBands, range } from './helpers'

const stainlessFz = fzBands([
  { maxD: 3, hss: [0.005, 0.012, 0.008], carbide: [0.008, 0.02, 0.012] },
  { maxD: 6, hss: [0.01, 0.025, 0.016], carbide: [0.015, 0.04, 0.025] },
  { maxD: 12, hss: [0.018, 0.04, 0.028], carbide: [0.025, 0.06, 0.04] },
  { maxD: 25, hss: [0.03, 0.06, 0.045], carbide: [0.04, 0.09, 0.06] },
  { maxD: 100, hss: [0.04, 0.08, 0.055], carbide: [0.05, 0.12, 0.08] },
])

export const stainlessMaterials: Material[] = [
  {
    id: 'aisi304',
    name: 'AISI 304',
    shortName: '304',
    category: 'stainless',
    subCategory: 'аустенитная нержавеющая',
    hardness: '~150 HB',
    densityKgM3: 8000,
    machinability: 0.4,
    plan: 'free',
    notes: 'Справочные режимы. Наклёп и нагрев кромки — типичные риски. Предпочтительны жёсткий станок, охлаждение и умеренный fz.',
    milling: {
      vc: {
        hss: range(10, 25, 16),
        carbide: range(40, 90, 60),
      },
      fzBands: stainlessFz,
      specificCuttingForceKc: 2500,
      apToDiameter: { hobby: 0.1, industrial: 0.25 },
      aeToDiameter: { hobby: 0.2, industrial: 0.4 },
    },
  },
  {
    id: 'aisi316',
    name: 'AISI 316',
    shortName: '316',
    category: 'stainless',
    subCategory: 'аустенитная нержавеющая',
    hardness: '~160 HB',
    densityKgM3: 8000,
    machinability: 0.35,
    plan: 'pro',
    notes: 'Справочные режимы. 316 обычно тяжелее 304 в обработке; держите запас по мощности и не завышайте ae.',
    milling: {
      vc: {
        hss: range(8, 22, 14),
        carbide: range(35, 80, 55),
      },
      fzBands: stainlessFz,
      specificCuttingForceKc: 2600,
      apToDiameter: { hobby: 0.08, industrial: 0.22 },
      aeToDiameter: { hobby: 0.18, industrial: 0.35 },
    },
  },
]
