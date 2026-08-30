import type { Material } from '@/types/material'
import { fzBands, range } from './helpers'

export const woodMaterials: Material[] = [
  {
    id: 'wood',
    name: 'Дерево (массив / фанера)',
    shortName: 'Дерево',
    category: 'wood',
    subCategory: 'древесина',
    densityKgM3: 650,
    machinability: 0.95,
    plan: 'free',
    notes: 'Справочные режимы усреднены по мягкой/средней древесине. Твёрдые породы и МДФ требуют отдельной коррекции. Не применяйте металлические kc как есть.',
    milling: {
      vc: {
        hss: range(200, 500, 320),
        carbide: range(300, 900, 500),
      },
      fzBands: fzBands([
        { maxD: 3, hss: [0.03, 0.08, 0.05], carbide: [0.04, 0.1, 0.06] },
        { maxD: 6, hss: [0.06, 0.14, 0.09], carbide: [0.08, 0.18, 0.1] },
        { maxD: 12, hss: [0.1, 0.22, 0.14], carbide: [0.1, 0.28, 0.16] },
        { maxD: 25, hss: [0.15, 0.3, 0.2], carbide: [0.16, 0.35, 0.22] },
        { maxD: 100, hss: [0.2, 0.4, 0.28], carbide: [0.18, 0.45, 0.3] },
      ]),
      specificCuttingForceKc: 150,
      apToDiameter: { hobby: 0.4, industrial: 1 },
      aeToDiameter: { hobby: 0.6, industrial: 1 },
    },
  },
]
