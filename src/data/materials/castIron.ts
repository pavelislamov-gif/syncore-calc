import type { Material } from '@/types/material'
import { fzBands, range } from './helpers'

export const castIronMaterials: Material[] = [
  {
    id: 'sch20',
    name: 'СЧ20 (чугун)',
    shortName: 'СЧ20',
    category: 'cast_iron',
    subCategory: 'серый чугун',
    hardness: '~180 HB',
    densityKgM3: 7200,
    machinability: 0.65,
    plan: 'free',
    notes: 'Справочные режимы для серого чугуна. Стружка короткая, абразивный износ кромки. Не путать с высокопрочным ВЧ.',
    milling: {
      vc: {
        hss: range(15, 35, 22),
        carbide: range(70, 180, 120),
      },
      fzBands: fzBands([
        { maxD: 6, hss: [0.01, 0.03, 0.018], carbide: [0.02, 0.05, 0.03] },
        { maxD: 12, hss: [0.02, 0.05, 0.03], carbide: [0.03, 0.08, 0.05] },
        { maxD: 100, hss: [0.04, 0.09, 0.06], carbide: [0.05, 0.14, 0.08] },
      ]),
      specificCuttingForceKc: 1400,
      apToDiameter: { hobby: 0.15, industrial: 0.4 },
      aeToDiameter: { hobby: 0.3, industrial: 0.5 },
    },
  },
]
