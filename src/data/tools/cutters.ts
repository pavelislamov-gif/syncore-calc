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
    hint: 'Основной резец для наружного точения. Негатив: CNMG, WNMG, TNMG.',
    vcFactor: 1,
    feedFactor: 1,
    needsInsert: true,
    insertGroups: ['negative'],
  },
  {
    id: 'od_bent',
    name: 'Проходной отогнутый',
    hint: 'Удобнее подрезать торец и уступ. Часто CNMG или DNMG 55°.',
    vcFactor: 0.98,
    feedFactor: 0.95,
    needsInsert: true,
    insertGroups: ['negative'],
  },
  {
    id: 'od_shoulder',
    name: 'Упорный',
    hint: 'Точение до уступа. TNMG 60° и CNMG 80°.',
    vcFactor: 0.95,
    feedFactor: 0.9,
    needsInsert: true,
    insertGroups: ['negative'],
  },
  {
    id: 'facing',
    name: 'Подрезной',
    hint: 'Торец от наружного диаметра к центру. CNMG / DNMG.',
    vcFactor: 0.9,
    feedFactor: 0.95,
    needsInsert: true,
    insertGroups: ['negative'],
  },
  {
    id: 'copy',
    name: 'Копировальный',
    hint: 'Конусы и контуры. Негатив DNMG 55° или позитив DCMT.',
    vcFactor: 0.85,
    feedFactor: 0.8,
    needsInsert: true,
    insertGroups: ['negative', 'positive'],
  },
  {
    id: 'boring',
    name: 'Расточной',
    hint: 'Внутреннее точение. Позитив CCMT / DCMT / TCMT — меньше отжим.',
    vcFactor: 0.75,
    feedFactor: 0.75,
    needsInsert: true,
    insertGroups: ['positive'],
  },
  {
    id: 'boring_shoulder',
    name: 'Расточной упорный',
    hint: 'Расточка до внутреннего уступа. Позитивные CCMT / TCMT.',
    vcFactor: 0.7,
    feedFactor: 0.7,
    needsInsert: true,
    insertGroups: ['positive'],
  },
  {
    id: 'grooving',
    name: 'Канавочный',
    hint: 'Прямоугольные MGMN 200 / 300 / 400. Цифра — ширина реза.',
    vcFactor: 0.55,
    feedFactor: 0.5,
    needsInsert: true,
    insertGroups: ['groove'],
  },
  {
    id: 'parting',
    name: 'Отрезной',
    hint: 'Отрезка прутка пластинами MGMN. Ширина 2–4 мм.',
    vcFactor: 0.45,
    feedFactor: 0.45,
    needsInsert: true,
    insertGroups: ['groove'],
  },
  {
    id: 'threading_ext',
    name: 'Резьбовой наружный',
    hint: '16ER AG60 — универсальный метрический профиль 60°. Подача = шаг.',
    vcFactor: 0.3,
    feedFactor: 1,
    needsInsert: true,
    insertGroups: ['thread_ext'],
  },
  {
    id: 'threading_int',
    name: 'Резьбовой внутренний',
    hint: '16IR AG60 для внутренней метрической резьбы.',
    vcFactor: 0.28,
    feedFactor: 1,
    needsInsert: true,
    insertGroups: ['thread_int'],
  },
  {
    id: 'chamfer',
    name: 'Фасочный',
    hint: 'Фаска кромкой 55–80°. DNMG или DCMT.',
    vcFactor: 0.85,
    feedFactor: 0.8,
    needsInsert: true,
    insertGroups: ['negative', 'positive'],
  },
  {
    id: 'fillet',
    name: 'Галтельный',
    hint: 'Радиусные MRMN 200 / 300 для галтелей и скруглений.',
    vcFactor: 0.8,
    feedFactor: 0.75,
    needsInsert: true,
    insertGroups: ['fillet'],
  },
  {
    id: 'form',
    name: 'Фасонный',
    hint: 'Сложный профиль. Старт с DNMG 55° или позитива DCMT.',
    vcFactor: 0.65,
    feedFactor: 0.55,
    needsInsert: true,
    insertGroups: ['negative', 'positive'],
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
