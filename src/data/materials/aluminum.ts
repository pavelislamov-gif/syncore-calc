import type { Material } from '@/types/material'
import { fzBands, range } from './helpers'

const aluminumFz = fzBands([
  { maxD: 3, hss: [0.008, 0.02, 0.012], carbide: [0.01, 0.03, 0.018] },
  { maxD: 6, hss: [0.015, 0.04, 0.025], carbide: [0.025, 0.06, 0.04] },
  { maxD: 12, hss: [0.03, 0.07, 0.04], carbide: [0.04, 0.1, 0.06] },
  { maxD: 25, hss: [0.05, 0.1, 0.07], carbide: [0.06, 0.16, 0.09] },
  { maxD: 100, hss: [0.07, 0.14, 0.09], carbide: [0.08, 0.22, 0.12] },
])

function aluminum(
  partial: Pick<Material, 'id' | 'name' | 'shortName' | 'subCategory' | 'notes'> & {
    densityKgM3?: number
    hardness?: string
    machinability?: number
    plan?: Material['plan']
    vcHss?: NumericLike
    vcCarbide?: NumericLike
  },
): Material {
  return {
    id: partial.id,
    name: partial.name,
    shortName: partial.shortName,
    category: 'aluminum',
    subCategory: partial.subCategory ?? 'деформируемый алюминиевый сплав',
    hardness: partial.hardness,
    densityKgM3: partial.densityKgM3 ?? 2700,
    machinability: partial.machinability ?? 0.85,
    plan: partial.plan ?? 'free',
    notes: partial.notes,
    milling: {
      vc: {
        hss: range(...(partial.vcHss ?? [80, 200, 140])),
        carbide: range(...(partial.vcCarbide ?? [250, 600, 400])),
      },
      fzBands: aluminumFz,
      specificCuttingForceKc: 800,
      apToDiameter: { hobby: 0.25, industrial: 0.5 },
      aeToDiameter: { hobby: 0.5, industrial: 0.6 },
    },
  }
}

type NumericLike = [number, number, number?]

export const aluminumMaterials: Material[] = [
  aluminum({
    id: 'amg5',
    name: 'АМг5',
    shortName: 'АМг5',
    hardness: '~70 HB',
    notes: 'Справочные режимы для алюминиево-магниевого сплава. Склонен к налипанию — предпочтительны острые зубья и DLC/полировка.',
  }),
  aluminum({
    id: 'amg6',
    name: 'АМг6',
    shortName: 'АМг6',
    hardness: '~70 HB',
    notes: 'Справочные режимы. Вязкий сплав; для Ø6 мм с 2 зубьями типичная отправная точка fz ≈ 0,04 мм/зуб при Vc в диапазоне 250–600 м/мин.',
  }),
  aluminum({
    id: 'd16',
    name: 'Д16',
    shortName: 'Д16',
    hardness: '~105 HB',
    machinability: 0.8,
    vcCarbide: [220, 500, 360],
    notes: 'Справочные режимы для дюралюминия. Прочнее АМг, режимы чуть консервативнее.',
  }),
  aluminum({
    id: '6061',
    name: '6061',
    shortName: '6061',
    subCategory: 'Al-Mg-Si',
    hardness: '~95 HB',
    notes: 'Справочные режимы для 6061-T6. Хорошая обрабатываемость, стабильная стружка при остром инструменте.',
  }),
  aluminum({
    id: '6082',
    name: '6082',
    shortName: '6082',
    subCategory: 'Al-Mg-Si',
    hardness: '~95 HB',
    notes: 'Справочные режимы для 6082. Близки к 6061; уточняйте по фактической твёрдости заготовки.',
  }),
]
