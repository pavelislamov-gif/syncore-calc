import type { InsertCategory, InsertDefinition, InsertDuty } from '@/types/insert'

export const insertCategories: { id: InsertCategory; title: string; blurb: string }[] = [
  {
    id: 'negative',
    title: 'Черновая и получистовая наружная обработка',
    blurb: 'Негативные пластины. Прочная кромка, съём большого объёма металла.',
  },
  {
    id: 'positive',
    title: 'Чистовая обработка и растачивание',
    blurb: 'Позитивные пластины с задним углом. Меньше отжим и вибрации.',
  },
  {
    id: 'groove',
    title: 'Отрезка прутка и точение канавок',
    blurb: 'Прямоугольные пластины врезанием. Цифра — ширина реза в мм × 0.1 (200 = 2 мм).',
  },
  {
    id: 'fillet',
    title: 'Галтели и скругления',
    blurb: 'Радиусные канавочные пластины MRMN.',
  },
  {
    id: 'thread_ext',
    title: 'Наружная резьба резцом',
    blurb: 'Профиль 60° для метрической резьбы. Подача за оборот равна шагу.',
  },
  {
    id: 'thread_int',
    title: 'Внутренняя резьба резцом',
    blurb: 'Тот же профиль 60°, для отверстия. Дюймовый 55° — позже.',
  },
]

function insert(input: {
  iso: string
  duty: InsertDuty
  ic: number
  thickness: number
  re: number
  notes: string
  shape: string
  category: InsertCategory
  geometry: string
  polished?: boolean
  coating?: string
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
    coating: input.coating ?? 'TiAlN',
    notes: input.notes,
    category: input.category,
    geometry: input.geometry,
    polished: input.polished ?? false,
  }
}

export const inserts: InsertDefinition[] = [
  insert({
    iso: 'CNMG 120408',
    duty: 'roughing',
    ic: 12.7,
    thickness: 4.76,
    re: 0.8,
    shape: 'CNMG',
    category: 'negative',
    geometry: 'Ромб 80°',
    notes: 'Мировой лидер для проходных и торцовых резцов. Самая универсальная негативная пластина. 4 рабочие кромки.',
  }),
  insert({
    iso: 'CNMG 120404',
    duty: 'general',
    ic: 12.7,
    thickness: 4.76,
    re: 0.4,
    shape: 'CNMG',
    category: 'negative',
    geometry: 'Ромб 80°',
    notes: 'Тот же ромб 80°, меньший радиус — получистовая наружная обработка.',
  }),
  insert({
    iso: 'WNMG 080408',
    duty: 'roughing',
    ic: 12.7,
    thickness: 4.76,
    re: 0.8,
    shape: 'WNMG',
    category: 'negative',
    geometry: 'Тригон 80°',
    notes: 'Ломаный треугольник, 6 рабочих кромок вместо 4 у CNMG. Экономичная альтернатива для проходного точения.',
  }),
  insert({
    iso: 'WNMG 080404',
    duty: 'general',
    ic: 12.7,
    thickness: 4.76,
    re: 0.4,
    shape: 'WNMG',
    category: 'negative',
    geometry: 'Тригон 80°',
    notes: 'Тригон, re 0.4 мм — получистовые проходы при той же державке WNMG 08.',
  }),
  insert({
    iso: 'DNMG 150408',
    duty: 'roughing',
    ic: 12.7,
    thickness: 4.76,
    re: 0.8,
    shape: 'DNMG',
    category: 'negative',
    geometry: 'Ромб 55°',
    notes: 'Контуры, конусы и подрезка уступов. 55° даёт лучший доступ, чем 80°.',
  }),
  insert({
    iso: 'DNMG 150404',
    duty: 'general',
    ic: 12.7,
    thickness: 4.76,
    re: 0.4,
    shape: 'DNMG',
    category: 'negative',
    geometry: 'Ромб 55°',
    notes: 'Ромб 55° с малым радиусом — получистовой контур и торец.',
  }),
  insert({
    iso: 'TNMG 160408',
    duty: 'roughing',
    ic: 9.525,
    thickness: 4.76,
    re: 0.8,
    shape: 'TNMG',
    category: 'negative',
    geometry: 'Треугольник 60°',
    notes: 'Классическая прочная пластина, 6 рабочих кромок. Наружные и часть внутренних работ.',
  }),
  insert({
    iso: 'CCMT 060204',
    duty: 'finishing',
    ic: 6.35,
    thickness: 2.38,
    re: 0.4,
    shape: 'CCMT',
    category: 'positive',
    geometry: 'Ромб 80°',
    notes: 'Позитив, малый размер. Получистовая и чистовая расточка небольших отверстий.',
  }),
  insert({
    iso: 'CCMT 09T304',
    duty: 'finishing',
    ic: 9.525,
    thickness: 3.97,
    re: 0.4,
    shape: 'CCMT',
    category: 'positive',
    geometry: 'Ромб 80°',
    notes: 'Главная пластина для получистовой и чистовой расточки внутренних отверстий.',
  }),
  insert({
    iso: 'DCMT 070204',
    duty: 'finishing',
    ic: 6.35,
    thickness: 2.38,
    re: 0.4,
    shape: 'DCMT',
    category: 'positive',
    geometry: 'Ромб 55°',
    notes: 'Тонкая чистовая обработка сложных внутренних и наружных контуров, малый размер.',
  }),
  insert({
    iso: 'DCMT 11T304',
    duty: 'finishing',
    ic: 9.525,
    thickness: 3.97,
    re: 0.4,
    shape: 'DCMT',
    category: 'positive',
    geometry: 'Ромб 55°',
    notes: 'Ромб 55° позитив — чистовой контур внутри и снаружи.',
  }),
  insert({
    iso: 'TCMT 110204',
    duty: 'finishing',
    ic: 6.35,
    thickness: 2.38,
    re: 0.4,
    shape: 'TCMT',
    category: 'positive',
    geometry: 'Треугольник 60°',
    notes: 'Недорогой позитивный треугольник для расточных резцов малого диаметра.',
  }),
  insert({
    iso: 'TCMT 16T304',
    duty: 'finishing',
    ic: 9.525,
    thickness: 3.97,
    re: 0.4,
    shape: 'TCMT',
    category: 'positive',
    geometry: 'Треугольник 60°',
    notes: 'Популярный вариант для расточных резцов среднего диаметра.',
  }),
  insert({
    iso: 'CCGT 09T304-AL',
    duty: 'finishing',
    ic: 9.525,
    thickness: 3.97,
    re: 0.4,
    shape: 'CCGT',
    category: 'positive',
    geometry: 'Ромб 80°, полированная',
    polished: true,
    coating: 'polished',
    notes: 'Супер-острая полированная кромка для алюминия, меди и пластиков. Не для стали.',
  }),
  insert({
    iso: 'DCGT 11T304-AK',
    duty: 'finishing',
    ic: 9.525,
    thickness: 3.97,
    re: 0.4,
    shape: 'DCGT',
    category: 'positive',
    geometry: 'Ромб 55°, полированная',
    polished: true,
    coating: 'polished',
    notes: 'Полированный позитив 55° для цветных сплавов и пластиков, включая Д16 / алюминий.',
  }),
  insert({
    iso: 'MGMN 200',
    duty: 'grooving',
    ic: 2,
    thickness: 2,
    re: 0.2,
    shape: 'MGMN',
    category: 'groove',
    geometry: 'Прямоугольная, ширина 2 мм',
    notes: 'Популярный стандарт для прорезки канавок и отрезки. Ширина реза 2 мм.',
  }),
  insert({
    iso: 'MGMN 300',
    duty: 'grooving',
    ic: 3,
    thickness: 3,
    re: 0.3,
    shape: 'MGMN',
    category: 'groove',
    geometry: 'Прямоугольная, ширина 3 мм',
    notes: 'Самый ходовой типоразмер канавочной / отрезной пластины. Ширина реза 3 мм.',
  }),
  insert({
    iso: 'MGMN 400',
    duty: 'grooving',
    ic: 4,
    thickness: 4,
    re: 0.4,
    shape: 'MGMN',
    category: 'groove',
    geometry: 'Прямоугольная, ширина 4 мм',
    notes: 'Канавка и отрезка шириной 4 мм.',
  }),
  insert({
    iso: 'MRMN 200',
    duty: 'grooving',
    ic: 2,
    thickness: 2,
    re: 1,
    shape: 'MRMN',
    category: 'fillet',
    geometry: 'Радиусная, 2 мм',
    notes: 'Круглый профиль для галтелей и скруглений. Не путать с прямоугольной MGMN.',
  }),
  insert({
    iso: 'MRMN 300',
    duty: 'grooving',
    ic: 3,
    thickness: 3,
    re: 1.5,
    shape: 'MRMN',
    category: 'fillet',
    geometry: 'Радиусная, 3 мм',
    notes: 'Радиусная канавочная 3 мм для галтелей большего радиуса.',
  }),
  insert({
    iso: '16ER AG60',
    duty: 'threading',
    ic: 16,
    thickness: 3.5,
    re: 0.1,
    shape: '16ER',
    category: 'thread_ext',
    geometry: 'Метрическая 60°, наружная',
    notes: 'Хит для наружной метрической резьбы с разным шагом. Универсальный профиль AG60. Подача = шаг.',
  }),
  insert({
    iso: '16IR AG60',
    duty: 'threading',
    ic: 16,
    thickness: 3.5,
    re: 0.1,
    shape: '16IR',
    category: 'thread_int',
    geometry: 'Метрическая 60°, внутренняя',
    notes: 'Внутренняя метрическая резьба в отверстии. Для отверстия под резьбу см. модуль «Резьба».',
  }),
]

export function getInsert(id: string): InsertDefinition | undefined {
  return inserts.find((item) => item.id === id || item.iso === id)
}

export function insertsForCategories(categories: string[]): InsertDefinition[] {
  if (categories.length === 0) return []
  const matched = inserts.filter((item) => categories.includes(item.category))
  return matched.length > 0 ? matched : inserts
}

export function groupedInserts(list: InsertDefinition[]) {
  return insertCategories
    .map((category) => ({
      ...category,
      items: list.filter((item) => item.category === category.id),
    }))
    .filter((group) => group.items.length > 0)
}
