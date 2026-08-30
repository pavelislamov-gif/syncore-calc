import type { InsertDefinition } from '@/types/insert'

function insert(
  iso: string,
  duty: InsertDefinition['duty'],
  inscribedCircleMm: number,
  thicknessMm: number,
  noseRadiusMm: number,
  notes: string,
): InsertDefinition {
  const compact = iso.replace(/\s+/g, '')
  return {
    id: compact,
    iso,
    shape: iso.slice(0, 4) as InsertDefinition['shape'],
    sizeCode: iso.slice(5),
    inscribedCircleMm,
    thicknessMm,
    noseRadiusMm,
    duty,
    grade: 'Carbide',
    coating: 'TiAlN',
    notes,
  }
}

export const inserts: InsertDefinition[] = [
  insert('CNMG 120408', 'roughing', 12.7, 4.76, 0.8, 'Справочный типоразмер. 80° негатив, радиус 0.8 мм — черновое/общее точение.'),
  insert('CNMG 120412', 'roughing', 12.7, 4.76, 1.2, 'Справочный типоразмер. Больший радиус — выше прочность кромки, грубее чистота.'),
  insert('DNMG 150608', 'general', 12.7, 6.35, 0.8, 'Справочный типоразмер. 55° — копирование и подрезка при ограниченном доступе.'),
  insert('VNMG 160408', 'general', 9.525, 4.76, 0.8, 'Справочный типоразмер. 35° — профили и канавки с острым носом.'),
  insert('WNMG 080408', 'roughing', 12.7, 4.76, 0.8, 'Справочный типоразмер. Шестигранник 80°, много кромок.'),
  insert('TNMG 160408', 'general', 9.525, 4.76, 0.8, 'Справочный типоразмер. Треугольник 60°, универсальное точение.'),
  insert('CCMT 09T304', 'finishing', 9.525, 3.97, 0.4, 'Справочный типоразмер. Позитив 7°, чистовая обработка и малые диаметры.'),
  insert('DCMT 11T304', 'finishing', 9.525, 3.97, 0.4, 'Справочный типоразмер. 55° позитив — чистовая расточка и копир.'),
  insert('VBMT 160404', 'finishing', 9.525, 3.97, 0.4, 'Справочный типоразмер. 35° позитив — тонкий профиль, малый радиус.'),
]

export function getInsert(id: string): InsertDefinition | undefined {
  return inserts.find((item) => item.id === id || item.iso === id)
}

export function insertsForOperation(duty: InsertDefinition['duty'] | 'any'): InsertDefinition[] {
  if (duty === 'any') return inserts
  const preferred = inserts.filter((item) => item.duty === duty || item.duty === 'general')
  return preferred.length > 0 ? preferred : inserts
}
