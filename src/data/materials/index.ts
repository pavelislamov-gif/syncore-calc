import type { Material, MaterialCategory } from '@/types/material'
import { aluminumMaterials } from './aluminum'
import { castIronMaterials } from './castIron'
import { nonferrousMaterials } from './nonferrous'
import { plasticMaterials } from './plastics'
import { stainlessMaterials } from './stainless'
import { steelMaterials } from './steel'
import { woodMaterials } from './wood'

export const materials: Material[] = [
  ...aluminumMaterials,
  ...steelMaterials,
  ...stainlessMaterials,
  ...nonferrousMaterials,
  ...castIronMaterials,
  ...plasticMaterials,
  ...woodMaterials,
]

export const materialCategories: { id: MaterialCategory; label: string }[] = [
  { id: 'aluminum', label: 'Алюминий' },
  { id: 'steel', label: 'Сталь' },
  { id: 'stainless', label: 'Нержавеющая сталь' },
  { id: 'nonferrous', label: 'Цветные металлы' },
  { id: 'cast_iron', label: 'Чугун' },
  { id: 'plastic', label: 'Пластики' },
  { id: 'wood', label: 'Дерево' },
]

export function getMaterial(id: string): Material | undefined {
  return materials.find((item) => item.id === id)
}

export function listMaterials(options?: { plan?: 'free' | 'pro' }): Material[] {
  if (!options?.plan || options.plan === 'pro') return materials
  return materials.filter((item) => item.plan === 'free')
}
