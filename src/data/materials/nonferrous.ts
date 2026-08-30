import type { Material } from '@/types/material'
import { fzBands, range } from './helpers'

const brassFz = fzBands([
  { maxD: 3, hss: [0.01, 0.025, 0.016], carbide: [0.012, 0.03, 0.02] },
  { maxD: 6, hss: [0.02, 0.05, 0.03], carbide: [0.025, 0.07, 0.045] },
  { maxD: 12, hss: [0.04, 0.08, 0.055], carbide: [0.05, 0.12, 0.07] },
  { maxD: 25, hss: [0.06, 0.12, 0.08], carbide: [0.07, 0.16, 0.1] },
  { maxD: 100, hss: [0.08, 0.16, 0.11], carbide: [0.1, 0.22, 0.14] },
])

const copperFz = fzBands([
  { maxD: 3, hss: [0.008, 0.02, 0.012], carbide: [0.01, 0.028, 0.016] },
  { maxD: 6, hss: [0.015, 0.04, 0.025], carbide: [0.02, 0.055, 0.035] },
  { maxD: 12, hss: [0.03, 0.07, 0.045], carbide: [0.04, 0.1, 0.06] },
  { maxD: 25, hss: [0.05, 0.1, 0.07], carbide: [0.06, 0.14, 0.09] },
  { maxD: 100, hss: [0.07, 0.13, 0.09], carbide: [0.08, 0.18, 0.12] },
])

export const nonferrousMaterials: Material[] = [
  {
    id: 'brass',
    name: 'Латунь',
    shortName: 'Латунь',
    category: 'nonferrous',
    subCategory: 'медные сплавы',
    hardness: '~80 HB',
    densityKgM3: 8500,
    machinability: 0.9,
    plan: 'free',
    notes: 'Справочные режимы. Латунь обычно даёт короткую стружку; уточняйте марку (ЛС59 и т.п.) при промышленных работах.',
    milling: {
      vc: {
        hss: range(60, 160, 110),
        carbide: range(150, 350, 220),
      },
      fzBands: brassFz,
      specificCuttingForceKc: 900,
      apToDiameter: { hobby: 0.25, industrial: 0.5 },
      aeToDiameter: { hobby: 0.45, industrial: 0.6 },
    },
  },
  {
    id: 'copper',
    name: 'Медь',
    shortName: 'Медь',
    category: 'nonferrous',
    subCategory: 'цветные металлы',
    hardness: '~50 HB',
    densityKgM3: 8960,
    machinability: 0.55,
    plan: 'pro',
    notes: 'Справочные режимы. Чистая медь вязкая и склонна к налипанию. Острые зубья, достаточный fz, избегать затирания.',
    milling: {
      vc: {
        hss: range(40, 120, 80),
        carbide: range(80, 220, 140),
      },
      fzBands: copperFz,
      specificCuttingForceKc: 1100,
      apToDiameter: { hobby: 0.2, industrial: 0.4 },
      aeToDiameter: { hobby: 0.35, industrial: 0.5 },
    },
  },
]
