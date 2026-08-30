import type { TurningOperation } from '@/types/turning'

export const turningOperations: {
  id: TurningOperation
  label: string
  hint: string
  needsInsert: boolean
  stockLabel: string
  finish: boolean
}[] = [
  {
    id: 'rough_od',
    label: 'Черновое точение',
    hint: 'Наружный съём припуска. Система подберёт консервативные Vc, f и ap из справочного диапазона.',
    needsInsert: true,
    stockLabel: 'Припуск на сторону',
    finish: false,
  },
  {
    id: 'finish_od',
    label: 'Чистовое точение',
    hint: 'Финишный проход по наружному диаметру. Меньше подача и глубина, выше качество поверхности.',
    needsInsert: true,
    stockLabel: 'Остаточный припуск',
    finish: true,
  },
  {
    id: 'face',
    label: 'Подрезка торца',
    hint: 'Диаметр — наружный. Подача и ap как при точении; длина прохода — радиус заготовки.',
    needsInsert: true,
    stockLabel: 'Припуск по торцу',
    finish: false,
  },
  {
    id: 'bore',
    label: 'Расточка',
    hint: 'Диаметр — текущий диаметр отверстия. Режимы снижены из‑за меньшей жёсткости оправки.',
    needsInsert: true,
    stockLabel: 'Припуск по диаметру / 2',
    finish: false,
  },
  {
    id: 'groove',
    label: 'Канавка',
    hint: 'Узкий резец. Справочно снижены Vc и подача. Ширина канавки задаётся как глубина/ap.',
    needsInsert: true,
    stockLabel: 'Глубина канавки',
    finish: false,
  },
  {
    id: 'cutoff',
    label: 'Отрезка',
    hint: 'Подача вдоль радиуса. Обороты считаются по наружному диаметру, Vc снижена.',
    needsInsert: true,
    stockLabel: 'Глубина до оси (≈ D/2)',
    finish: false,
  },
  {
    id: 'drill',
    label: 'Сверление',
    hint: 'Сверло, не пластина. Подача в мм/об. Диаметр — диаметр сверла.',
    needsInsert: false,
    stockLabel: 'Глубина отверстия',
    finish: false,
  },
]

export function getTurningOperation(id: TurningOperation) {
  const found = turningOperations.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown turning operation: ${id}`)
  return found
}
