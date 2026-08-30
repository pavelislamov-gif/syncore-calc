import type { InsertDefinition, InsertDuty } from '@/types/insert'

function insert(input: {
  iso: string
  duty: InsertDuty
  ic: number
  thickness: number
  re: number
  notes: string
  shape: string
  groups: string[]
}): InsertDefinition {
  return {
    id: input.iso.replace(/\s+/g, ''),
    iso: input.iso,
    shape: input.shape,
    sizeCode: input.iso.replace(input.shape, '').trim(),
    inscribedCircleMm: input.ic,
    thicknessMm: input.thickness,
    noseRadiusMm: input.re,
    duty: input.duty,
    grade: 'Carbide',
    coating: input.duty === 'threading' ? 'TiAlN' : 'TiAlN',
    notes: input.notes,
    groups: input.groups,
  }
}

export const inserts: InsertDefinition[] = [
  insert({ iso: 'CNMG 120404', duty: 'finishing', ic: 12.7, thickness: 4.76, re: 0.4, shape: 'CNMG', groups: ['od', 'negative', 'shoulder'], notes: '80° негатив, re 0.4 — чистовое / лёгкое точение.' }),
  insert({ iso: 'CNMG 120408', duty: 'roughing', ic: 12.7, thickness: 4.76, re: 0.8, shape: 'CNMG', groups: ['od', 'negative', 'shoulder'], notes: 'Самый ходовой проходной типоразмер, re 0.8 мм.' }),
  insert({ iso: 'CNMG 120412', duty: 'roughing', ic: 12.7, thickness: 4.76, re: 1.2, shape: 'CNMG', groups: ['od', 'negative'], notes: 'Больший радиус — прочность кромки на черновых проходах.' }),
  insert({ iso: 'SNMG 120408', duty: 'roughing', ic: 12.7, thickness: 4.76, re: 0.8, shape: 'SNMG', groups: ['od', 'negative', 'shoulder'], notes: 'Квадрат 90°, уступы и силовое точение.' }),
  insert({ iso: 'WNMG 080408', duty: 'roughing', ic: 12.7, thickness: 4.76, re: 0.8, shape: 'WNMG', groups: ['od', 'negative'], notes: 'Шестигранник 80°, много кромок.' }),
  insert({ iso: 'TNMG 160408', duty: 'general', ic: 9.525, thickness: 4.76, re: 0.8, shape: 'TNMG', groups: ['od', 'negative', 'shoulder'], notes: 'Треугольник 60°, универсальное точение и уступы.' }),
  insert({ iso: 'DNMG 150404', duty: 'finishing', ic: 12.7, thickness: 6.35, re: 0.4, shape: 'DNMG', groups: ['od', 'copy'], notes: '55°, малый радиус — копир и подрезка.' }),
  insert({ iso: 'DNMG 150608', duty: 'general', ic: 12.7, thickness: 6.35, re: 0.8, shape: 'DNMG', groups: ['od', 'copy'], notes: '55° — копирование, конус, торец.' }),
  insert({ iso: 'VNMG 160408', duty: 'general', ic: 9.525, thickness: 4.76, re: 0.8, shape: 'VNMG', groups: ['copy', 'profile'], notes: '35° — тонкий профиль и канавки с острым носом.' }),
  insert({ iso: 'CCMT 060204', duty: 'finishing', ic: 6.35, thickness: 2.38, re: 0.4, shape: 'CCMT', groups: ['bore', 'positive'], notes: 'Малая позитивная пластина для малых отверстий.' }),
  insert({ iso: 'CCMT 09T304', duty: 'finishing', ic: 9.525, thickness: 3.97, re: 0.4, shape: 'CCMT', groups: ['bore', 'positive'], notes: 'Позитив 7°, чистовая расточка и малые диаметры.' }),
  insert({ iso: 'DCMT 11T304', duty: 'finishing', ic: 9.525, thickness: 3.97, re: 0.4, shape: 'DCMT', groups: ['bore', 'copy', 'positive'], notes: '55° позитив — чистовая расточка и копир.' }),
  insert({ iso: 'TCMT 16T304', duty: 'finishing', ic: 9.525, thickness: 3.97, re: 0.4, shape: 'TCMT', groups: ['bore', 'positive', 'shoulder'], notes: 'Треугольник позитив, расточка и уступы.' }),
  insert({ iso: 'VCMT 160404', duty: 'finishing', ic: 9.525, thickness: 3.97, re: 0.4, shape: 'VCMT', groups: ['profile', 'copy', 'positive'], notes: '35° позитив — чистый профиль.' }),
  insert({ iso: 'SCMT 09T304', duty: 'finishing', ic: 9.525, thickness: 3.97, re: 0.4, shape: 'SCMT', groups: ['bore', 'positive', 'shoulder'], notes: 'Квадрат позитив, чистовые уступы.' }),
  insert({ iso: 'VBMT 160404', duty: 'finishing', ic: 9.525, thickness: 3.97, re: 0.4, shape: 'VBMT', groups: ['profile', 'copy', 'positive'], notes: '35° позитив — тонкий контур.' }),
  insert({ iso: 'MGMN 200', duty: 'grooving', ic: 2, thickness: 2, re: 0.2, shape: 'MGMN', groups: ['groove', 'part'], notes: 'Канавочная 2 мм. Ширина пластины задаёт ширину канавки.' }),
  insert({ iso: 'MGMN 300', duty: 'grooving', ic: 3, thickness: 3, re: 0.3, shape: 'MGMN', groups: ['groove', 'part'], notes: 'Канавочная / отрезная 3 мм — ходовой типоразмер.' }),
  insert({ iso: 'MGMN 400', duty: 'grooving', ic: 4, thickness: 4, re: 0.4, shape: 'MGMN', groups: ['groove', 'part'], notes: 'Канавочная 4 мм для более широких пазов и отрезки.' }),
  insert({ iso: '16ER AG60', duty: 'threading', ic: 16, thickness: 3.5, re: 0.1, shape: '16ER', groups: ['thread_ext'], notes: 'Наружная метрическая 60°. Подача за оборот = шаг. Справочный типоразмер.' }),
  insert({ iso: '16IR AG60', duty: 'threading', ic: 16, thickness: 3.5, re: 0.1, shape: '16IR', groups: ['thread_int'], notes: 'Внутренняя метрическая 60°. Для отверстия см. модуль «Резьба».' }),
]

export function getInsert(id: string): InsertDefinition | undefined {
  return inserts.find((item) => item.id === id || item.iso === id)
}

export function insertsForGroups(groups: string[]): InsertDefinition[] {
  if (groups.length === 0) return []
  const matched = inserts.filter((item) => item.groups.some((group) => groups.includes(group)))
  return matched.length > 0 ? matched : inserts
}
