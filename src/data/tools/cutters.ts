export type CutterKindId =
  | 'od_straight'
  | 'od_bent'
  | 'od_shoulder'
  | 'facing'
  | 'copy'
  | 'boring'
  | 'boring_shoulder'
  | 'grooving'
  | 'parting'
  | 'threading_ext'
  | 'threading_int'
  | 'chamfer'
  | 'fillet'
  | 'form'
  | 'hss_od'

export interface CutterKind {
  id: CutterKindId
  name: string
  hint: string
  vcFactor: number
  feedFactor: number
  needsInsert: boolean
  insertGroups: string[]
}

export const cutterKinds: CutterKind[] = [
  {
    id: 'od_straight',
    name: 'Проходной прямой',
    hint: 'Основной резец для наружного точения вдоль оси. Обычно CNMG / SNMG / WNMG.',
    vcFactor: 1,
    feedFactor: 1,
    needsInsert: true,
    insertGroups: ['od', 'negative'],
  },
  {
    id: 'od_bent',
    name: 'Проходной отогнутый',
    hint: 'Резцу удобнее подрезать торец и проходить уступ. Часто DNMG / CNMG.',
    vcFactor: 0.98,
    feedFactor: 0.95,
    needsInsert: true,
    insertGroups: ['od', 'copy'],
  },
  {
    id: 'od_shoulder',
    name: 'Упорный',
    hint: 'Точение до уступа 90°. Справочно чуть ниже подача, чем у проходного.',
    vcFactor: 0.95,
    feedFactor: 0.9,
    needsInsert: true,
    insertGroups: ['od', 'shoulder'],
  },
  {
    id: 'facing',
    name: 'Подрезной',
    hint: 'Обработка торца от наружного диаметра к центру.',
    vcFactor: 0.9,
    feedFactor: 0.95,
    needsInsert: true,
    insertGroups: ['od', 'copy'],
  },
  {
    id: 'copy',
    name: 'Копировальный',
    hint: 'Профили, радиусы, конусы. Пластины 55° / 35°.',
    vcFactor: 0.85,
    feedFactor: 0.8,
    needsInsert: true,
    insertGroups: ['copy', 'profile'],
  },
  {
    id: 'boring',
    name: 'Расточной',
    hint: 'Внутреннее точение. Жёсткость оправки ниже — режимы снижены.',
    vcFactor: 0.75,
    feedFactor: 0.75,
    needsInsert: true,
    insertGroups: ['bore', 'positive'],
  },
  {
    id: 'boring_shoulder',
    name: 'Расточной упорный',
    hint: 'Расточка до внутреннего уступа. Ещё консервативнее по нагрузке.',
    vcFactor: 0.7,
    feedFactor: 0.7,
    needsInsert: true,
    insertGroups: ['bore', 'positive'],
  },
  {
    id: 'grooving',
    name: 'Канавочный',
    hint: 'Узкая пластина (MGMN и аналоги). Vc и подача снижены.',
    vcFactor: 0.55,
    feedFactor: 0.5,
    needsInsert: true,
    insertGroups: ['groove'],
  },
  {
    id: 'parting',
    name: 'Отрезной',
    hint: 'Отрезка в упор. Подача малая, охлаждение важно.',
    vcFactor: 0.45,
    feedFactor: 0.45,
    needsInsert: true,
    insertGroups: ['groove', 'part'],
  },
  {
    id: 'threading_ext',
    name: 'Резьбовой наружный',
    hint: 'Пластина 16ER / аналоги. Подача за оборот равна шагу — удобнее модуль «Резьба».',
    vcFactor: 0.3,
    feedFactor: 1,
    needsInsert: true,
    insertGroups: ['thread_ext'],
  },
  {
    id: 'threading_int',
    name: 'Резьбовой внутренний',
    hint: 'Пластина 16IR. Для полного расчёта шага откройте раздел «Резьба».',
    vcFactor: 0.28,
    feedFactor: 1,
    needsInsert: true,
    insertGroups: ['thread_int'],
  },
  {
    id: 'chamfer',
    name: 'Фасочный',
    hint: 'Снятие фаски кромкой 35–55°. Не путать с фасонным резцом.',
    vcFactor: 0.85,
    feedFactor: 0.8,
    needsInsert: true,
    insertGroups: ['profile', 'copy'],
  },
  {
    id: 'fillet',
    name: 'Галтельный',
    hint: 'Выпуклый радиус / галтель. Справочные режимы ближе к копировальным.',
    vcFactor: 0.8,
    feedFactor: 0.75,
    needsInsert: true,
    insertGroups: ['profile'],
  },
  {
    id: 'form',
    name: 'Фасонный',
    hint: 'Сложный профиль. Режимы сильно зависят от ширины профиля — старт консервативный.',
    vcFactor: 0.65,
    feedFactor: 0.55,
    needsInsert: true,
    insertGroups: ['profile'],
  },
  {
    id: 'hss_od',
    name: 'Резец HSS (напайной / цельный)',
    hint: 'Без сменной пластины. Vc заметно ниже твердосплава. Типоразмер пластины не выбирается.',
    vcFactor: 0.35,
    feedFactor: 0.7,
    needsInsert: false,
    insertGroups: [],
  },
]

export function getCutterKind(id: string): CutterKind | undefined {
  return cutterKinds.find((item) => item.id === id)
}

export function defaultCutter(): CutterKind {
  const first = cutterKinds[0]
  if (!first) throw new Error('Cutter catalog is empty')
  return first
}
