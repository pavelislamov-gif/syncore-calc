import type { Material } from '@/types/material'
import { fzBands, range } from './helpers'

const plasticFz = fzBands([
  { maxD: 3, hss: [0.02, 0.05, 0.03], carbide: [0.025, 0.06, 0.04] },
  { maxD: 6, hss: [0.04, 0.08, 0.055], carbide: [0.05, 0.1, 0.07] },
  { maxD: 12, hss: [0.06, 0.12, 0.08], carbide: [0.08, 0.16, 0.1] },
  { maxD: 25, hss: [0.08, 0.16, 0.1], carbide: [0.1, 0.2, 0.14] },
  { maxD: 100, hss: [0.1, 0.2, 0.13], carbide: [0.12, 0.25, 0.16] },
])

function plastic(
  id: string,
  name: string,
  shortName: string,
  notes: string,
  plan: Material['plan'] = 'free',
  kc = 250,
): Material {
  return {
    id,
    name,
    shortName,
    category: 'plastic',
    subCategory: 'конструкционные пластики',
    densityKgM3: 1200,
    machinability: 0.9,
    plan,
    notes,
    milling: {
      vc: {
        hss: range(80, 250, 150),
        carbide: range(150, 500, 280),
      },
      fzBands: plasticFz,
      specificCuttingForceKc: kc,
      apToDiameter: { hobby: 0.35, industrial: 0.7 },
      aeToDiameter: { hobby: 0.5, industrial: 0.8 },
    },
  }
}

export const plasticMaterials: Material[] = [
  plastic('pom', 'POM (полиацеталь)', 'POM', 'Справочные режимы. Хорошая стружка, следите за оплавлением кромки на малых подачах.'),
  plastic('pa', 'PA (полиамид, нейлон)', 'PA', 'Справочные режимы. Вязкий, может тянуть заусенцы. Острый инструмент, достаточный fz.'),
  plastic('pvc', 'PVC', 'PVC', 'Справочные режимы. Избегайте перегрева. Не используйте как данные для токсикологической оценки.'),
  plastic('uhmw', 'UHMW-PE', 'UHMW', 'Справочные режимы. Скользкий материал, фиксируйте заготовку. Склонен к оплавлению.', 'pro', 200),
  plastic(
    'acrylic',
    'Оргстекло (PMMA)',
    'Оргстекло',
    'Справочные режимы. Однозубые/O-flute предпочтительны для прозрачных кромок. Не путать с режимами для поликарбоната.',
  ),
]
