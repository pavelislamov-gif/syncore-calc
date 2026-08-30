import { range } from '@/data/materials/helpers'
import type { TurningMaterialParams } from '@/types/turning'
import { getMaterial } from '@/data/materials'

const table: Record<string, TurningMaterialParams> = {
  st3: {
    vcCarbide: range(140, 280, 200),
    feedRough: range(0.2, 0.4, 0.3),
    feedFinish: range(0.08, 0.2, 0.12),
    depthRough: range(1, 4, 2),
    depthFinish: range(0.15, 0.6, 0.3),
    kc: 1800,
  },
  st45: {
    vcCarbide: range(120, 250, 180),
    feedRough: range(0.18, 0.35, 0.28),
    feedFinish: range(0.08, 0.18, 0.12),
    depthRough: range(1, 3.5, 2),
    depthFinish: range(0.15, 0.5, 0.3),
    kc: 2000,
  },
  '40x': {
    vcCarbide: range(100, 220, 150),
    feedRough: range(0.15, 0.3, 0.22),
    feedFinish: range(0.06, 0.15, 0.1),
    depthRough: range(0.8, 3, 1.5),
    depthFinish: range(0.12, 0.45, 0.25),
    kc: 2200,
  },
  aisi304: {
    vcCarbide: range(70, 180, 120),
    feedRough: range(0.12, 0.28, 0.2),
    feedFinish: range(0.06, 0.14, 0.1),
    depthRough: range(0.6, 2.5, 1.2),
    depthFinish: range(0.1, 0.4, 0.2),
    kc: 2500,
  },
  aisi316: {
    vcCarbide: range(60, 160, 100),
    feedRough: range(0.1, 0.25, 0.18),
    feedFinish: range(0.05, 0.12, 0.08),
    depthRough: range(0.5, 2, 1),
    depthFinish: range(0.1, 0.35, 0.2),
    kc: 2600,
  },
  amg5: {
    vcCarbide: range(250, 700, 400),
    feedRough: range(0.2, 0.45, 0.3),
    feedFinish: range(0.08, 0.22, 0.14),
    depthRough: range(1, 5, 2.5),
    depthFinish: range(0.2, 0.8, 0.4),
    kc: 800,
  },
  amg6: {
    vcCarbide: range(240, 650, 380),
    feedRough: range(0.2, 0.42, 0.28),
    feedFinish: range(0.08, 0.2, 0.14),
    depthRough: range(1, 4.5, 2.2),
    depthFinish: range(0.2, 0.7, 0.35),
    kc: 800,
  },
  d16: {
    vcCarbide: range(220, 600, 350),
    feedRough: range(0.18, 0.4, 0.26),
    feedFinish: range(0.08, 0.18, 0.12),
    depthRough: range(1, 4, 2),
    depthFinish: range(0.2, 0.6, 0.3),
    kc: 850,
  },
  '6061': {
    vcCarbide: range(250, 700, 420),
    feedRough: range(0.2, 0.45, 0.3),
    feedFinish: range(0.08, 0.22, 0.14),
    depthRough: range(1, 5, 2.5),
    depthFinish: range(0.2, 0.8, 0.4),
    kc: 800,
  },
  '6082': {
    vcCarbide: range(250, 680, 400),
    feedRough: range(0.2, 0.42, 0.3),
    feedFinish: range(0.08, 0.2, 0.14),
    depthRough: range(1, 5, 2.4),
    depthFinish: range(0.2, 0.7, 0.35),
    kc: 800,
  },
  brass: {
    vcCarbide: range(180, 450, 280),
    feedRough: range(0.15, 0.4, 0.25),
    feedFinish: range(0.06, 0.18, 0.12),
    depthRough: range(1, 4, 2),
    depthFinish: range(0.15, 0.6, 0.3),
    kc: 900,
  },
  copper: {
    vcCarbide: range(80, 250, 140),
    feedRough: range(0.12, 0.3, 0.2),
    feedFinish: range(0.05, 0.15, 0.1),
    depthRough: range(0.8, 3, 1.5),
    depthFinish: range(0.15, 0.5, 0.25),
    kc: 1100,
  },
  sch20: {
    vcCarbide: range(90, 220, 140),
    feedRough: range(0.2, 0.4, 0.28),
    feedFinish: range(0.08, 0.2, 0.12),
    depthRough: range(1, 4, 2),
    depthFinish: range(0.15, 0.5, 0.3),
    kc: 1400,
  },
}

function fromMilling(materialId: string): TurningMaterialParams | undefined {
  const material = getMaterial(materialId)
  if (!material) return undefined
  const vc = material.milling.vc.carbide
  return {
    vcCarbide: range(vc.min * 0.7, vc.max * 0.9, vc.recommended * 0.75),
    feedRough: range(0.12, 0.3, 0.2),
    feedFinish: range(0.05, 0.15, 0.1),
    depthRough: range(0.5, 2.5, 1.2),
    depthFinish: range(0.1, 0.4, 0.2),
    kc: material.milling.specificCuttingForceKc,
  }
}

export function getTurningParams(materialId: string): TurningMaterialParams | undefined {
  return table[materialId] ?? fromMilling(materialId)
}
