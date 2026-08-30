import type { InsertDefinition } from '@/types/insert'

export function includedAngleDeg(shape: string): number | null {
  const code = shape.slice(0, 1)
  if (shape.startsWith('16')) return 60
  if (shape === 'MGMN' || shape === 'MRMN') return null
  if (code === 'C' || code === 'W') return 80
  if (code === 'D') return 55
  if (code === 'T') return 60
  if (code === 'S') return 90
  if (code === 'V') return 35
  return null
}

export function insertKindLabel(insert: InsertDefinition): string {
  if (insert.category === 'groove') return 'Канавочная / отрезная'
  if (insert.category === 'fillet') return 'Радиусная канавочная'
  if (insert.category === 'thread_ext') return 'Резьбовая наружная'
  if (insert.category === 'thread_int') return 'Резьбовая внутренняя'
  if (insert.category === 'positive') return 'Позитивная'
  return 'Негативная'
}

export function formatMm(value: number, digits = 2): string {
  const rounded = Number(value.toFixed(digits))
  return `${rounded.toLocaleString('ru-RU')} мм`
}
