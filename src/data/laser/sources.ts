import type { LaserSourcePreset } from '@/types/laser'

export const laserSourcePresets: LaserSourcePreset[] = [
  {
    id: 'fiber-1000',
    name: 'Волокно 1.0 кВт',
    kind: 'fiber',
    powerW: 1000,
    notes: 'Типичный малый раскройный стол. Тонкий лист и углеродистая сталь на O₂.',
  },
  {
    id: 'fiber-1500',
    name: 'Волокно 1.5 кВт',
    kind: 'fiber',
    powerW: 1500,
    notes: 'Частый комплект для цеха: сталь до ~12 мм, нержавейка и алюминий тоньше.',
  },
  {
    id: 'fiber-2000',
    name: 'Волокно 2.0 кВт',
    kind: 'fiber',
    powerW: 2000,
    notes: 'Запас по нержавейке и алюминию относительно 1.5 кВт.',
  },
  {
    id: 'fiber-3000',
    name: 'Волокно 3.0 кВт',
    kind: 'fiber',
    powerW: 3000,
    notes: 'Средний промышленный источник. Толстый лист и цветные металлы увереннее.',
  },
  {
    id: 'fiber-6000',
    name: 'Волокно 6.0 кВт',
    kind: 'fiber',
    powerW: 6000,
    notes: 'Толстый раскрой. Таблица всё равно справочная — паспорт резонатора важнее.',
  },
  {
    id: 'co2-80',
    name: 'CO₂ 80 Вт',
    kind: 'co2',
    powerW: 80,
    notes: 'Хоббийный CO₂: оргстекло, фанера, ткань. Металл не режет.',
  },
  {
    id: 'co2-100',
    name: 'CO₂ 100 Вт',
    kind: 'co2',
    powerW: 100,
    notes: 'Базовый гравировально-раскройный CO₂.',
  },
  {
    id: 'co2-150',
    name: 'CO₂ 150 Вт',
    kind: 'co2',
    powerW: 150,
    notes: 'Запас по фанере и оргстеклу. Металл по-прежнему не задача этого источника.',
  },
]

export function getLaserSource(id: string): LaserSourcePreset | undefined {
  return laserSourcePresets.find((item) => item.id === id)
}

export function defaultLaserSource(): LaserSourcePreset {
  return laserSourcePresets.find((item) => item.id === 'fiber-1500') ?? laserSourcePresets[0]
}
