import type { Material } from '@/types/material'
import { fzBands, range } from './helpers'

const steelFz = fzBands([
  { maxD: 3, hss: [0.006, 0.015, 0.01], carbide: [0.008, 0.025, 0.014] },
  { maxD: 6, hss: [0.012, 0.03, 0.02], carbide: [0.02, 0.05, 0.03] },
  { maxD: 12, hss: [0.02, 0.05, 0.035], carbide: [0.03, 0.08, 0.05] },
  { maxD: 25, hss: [0.04, 0.08, 0.055], carbide: [0.05, 0.12, 0.08] },
  { maxD: 100, hss: [0.05, 0.1, 0.07], carbide: [0.07, 0.16, 0.1] },
])

export const steelMaterials: Material[] = [
  {
    id: 'st3',
    name: 'Ст3',
    shortName: 'Ст3',
    category: 'steel',
    subCategory: 'конструкционная углеродистая',
    hardness: '~120 HB',
    densityKgM3: 7850,
    machinability: 0.7,
    plan: 'free',
    notes: 'Справочные режимы для низкоуглеродистой стали. На хоббийном станке снижайте ap и следите за вибрациями.',
    milling: {
      vc: {
        hss: range(18, 40, 28),
        carbide: range(80, 180, 120),
      },
      fzBands: steelFz,
      specificCuttingForceKc: 1800,
      apToDiameter: { hobby: 0.15, industrial: 0.4 },
      aeToDiameter: { hobby: 0.3, industrial: 0.5 },
    },
  },
  {
    id: 'st45',
    name: 'Сталь 45 / Ст45',
    shortName: 'Ст45',
    category: 'steel',
    subCategory: 'конструкционная углеродистая',
    hardness: '~180 HB',
    densityKgM3: 7850,
    machinability: 0.6,
    plan: 'free',
    notes: 'Справочные режимы. Прочнее Ст3 — ниже Vc и fz, особенно на HSS.',
    milling: {
      vc: {
        hss: range(15, 35, 24),
        carbide: range(70, 150, 100),
      },
      fzBands: steelFz,
      specificCuttingForceKc: 2000,
      apToDiameter: { hobby: 0.12, industrial: 0.35 },
      aeToDiameter: { hobby: 0.25, industrial: 0.45 },
    },
  },
  {
    id: '40x',
    name: '40Х',
    shortName: '40Х',
    category: 'steel',
    subCategory: 'легированная конструкционная',
    hardness: '~200 HB',
    densityKgM3: 7850,
    machinability: 0.5,
    plan: 'pro',
    notes: 'Справочные режимы в отожжённом/улучшенном состоянии. После закалки диапазоны недействительны — требуется отдельный подбор.',
    milling: {
      vc: {
        hss: range(12, 28, 20),
        carbide: range(60, 140, 90),
      },
      fzBands: steelFz,
      specificCuttingForceKc: 2200,
      apToDiameter: { hobby: 0.1, industrial: 0.3 },
      aeToDiameter: { hobby: 0.2, industrial: 0.4 },
    },
  },
]
