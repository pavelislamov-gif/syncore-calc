import type { CoatingDefinition, ToolDefinition } from '@/types/tool'

export const endMillTypes: ToolDefinition[] = [
  { id: 'endmill', name: 'Концевая', type: 'endmill' },
  { id: 'ball', name: 'Сферическая', type: 'ball' },
  { id: 'corner_radius', name: 'Радиусная', type: 'corner_radius' },
  { id: 'slot', name: 'Пазовая', type: 'slot' },
  { id: 'chamfer', name: 'Фасочная', type: 'chamfer' },
  { id: 'drill', name: 'Сверло', type: 'drill' },
  { id: 'special', name: 'Специальная', type: 'special' },
]

export const coatings: CoatingDefinition[] = [
  {
    id: 'none',
    name: 'Без покрытия',
    vcMultiplier: 1,
    notes: 'Базовый коэффициент. Для алюминия часто предпочтительна острая полированная кромка без покрытия.',
  },
  {
    id: 'TiAlN',
    name: 'TiAlN',
    vcMultiplier: 1.12,
    notes: 'Справочный коэффициент. Обычно повышает допустимую Vc на сталях; на алюминии эффект неоднозначен.',
  },
  {
    id: 'AlTiN',
    name: 'AlTiN',
    vcMultiplier: 1.18,
    notes: 'Справочный коэффициент. Ориентирован на более высокие температуры резания (стали, нержавейка).',
  },
  {
    id: 'DLC',
    name: 'DLC',
    vcMultiplier: 1.08,
    notes: 'Справочный коэффициент. Полезен против налипания на цветных сплавах и пластиках.',
  },
  {
    id: 'other',
    name: 'Другое',
    vcMultiplier: 1,
    notes: 'Коэффициент не применяется автоматически — режим считайте как для инструмента без покрытия.',
  },
]

export function getCoating(id: CoatingDefinition['id']): CoatingDefinition {
  const found = coatings.find((item) => item.id === id)
  if (found) return found
  const fallback = coatings[0]
  if (!fallback) {
    throw new Error('Coatings catalog is empty')
  }
  return fallback
}

export const cutterMaterials = [
  { id: 'HSS' as const, name: 'HSS' },
  { id: 'Carbide' as const, name: 'Carbide' },
]

export { artcamToolTypeName, defaultToolGeometry, geometryToFormFields, toolGeometryFields } from './geometry'
