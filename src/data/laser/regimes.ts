import type { MaterialCategory } from '@/types/material'
import type { AssistGas, LaserFamily, LaserSourceKind } from '@/types/laser'

export interface LaserThicknessPoint {
  thicknessMm: number
  speedMmMin: { min: number; max: number; recommended: number }
  minPowerW: number
}

export interface LaserFamilyTable {
  family: LaserFamily
  label: string
  preferredSource: LaserSourceKind
  defaultGas: AssistGas
  pressureBar: { min: number; max: number; recommended: number }
  focusSign: number
  nozzleThinMm: number
  nozzleThickMm: number
  kerfFactor: number
  notes: string
  points: LaserThicknessPoint[]
}

/** Справочные точки для волокна 1.5 кВт (металлы) и CO₂ 100 Вт (неметалл). */
export const laserFamilyTables: LaserFamilyTable[] = [
  {
    family: 'mild_steel',
    label: 'Углеродистая сталь',
    preferredSource: 'fiber',
    defaultGas: 'O2',
    pressureBar: { min: 0.4, max: 1.2, recommended: 0.7 },
    focusSign: 1,
    nozzleThinMm: 1.2,
    nozzleThickMm: 2.0,
    kerfFactor: 0.12,
    notes: 'Кислород даёт экзотермический рез: быстрее, кромка с оксидом. Для «чистого» торца берут азот и снижают скорость.',
    points: [
      row(1, 8000, 14000, 11000, 500),
      row(2, 4500, 8000, 6000, 700),
      row(3, 2800, 5200, 3800, 900),
      row(4, 2000, 3800, 2800, 1000),
      row(5, 1500, 3000, 2200, 1100),
      row(6, 1200, 2400, 1700, 1200),
      row(8, 800, 1800, 1200, 1400),
      row(10, 600, 1400, 900, 1500),
      row(12, 450, 1100, 700, 1800),
      row(16, 280, 700, 450, 2500),
      row(20, 180, 450, 280, 3500),
    ],
  },
  {
    family: 'cast_iron',
    label: 'Чугун',
    preferredSource: 'fiber',
    defaultGas: 'O2',
    pressureBar: { min: 0.5, max: 1.4, recommended: 0.8 },
    focusSign: 1,
    nozzleThinMm: 1.5,
    nozzleThickMm: 2.5,
    kerfFactor: 0.14,
    notes: 'Чугун режется медленнее стали. Кромка пористая; это не замена механической обработке посадок.',
    points: [
      row(1, 5000, 10000, 7000, 700),
      row(3, 1800, 3600, 2500, 1200),
      row(6, 700, 1600, 1000, 1600),
      row(10, 350, 900, 550, 2200),
      row(16, 180, 450, 280, 3500),
    ],
  },
  {
    family: 'stainless',
    label: 'Нержавеющая сталь',
    preferredSource: 'fiber',
    defaultGas: 'N2',
    pressureBar: { min: 10, max: 18, recommended: 14 },
    focusSign: -1,
    nozzleThinMm: 1.5,
    nozzleThickMm: 2.5,
    kerfFactor: 0.1,
    notes: 'Азот даёт светлую кромку без окалины. Давление высокое. На 1.5 кВт 6 мм уже у предела.',
    points: [
      row(1, 6000, 12000, 9000, 800),
      row(2, 2800, 5500, 4000, 1200),
      row(3, 1400, 3200, 2200, 1500),
      row(4, 800, 2200, 1400, 1800),
      row(5, 500, 1400, 850, 2200),
      row(6, 300, 900, 500, 2800),
      row(8, 180, 550, 320, 4000),
      row(10, 120, 350, 200, 5500),
    ],
  },
  {
    family: 'aluminum',
    label: 'Алюминий',
    preferredSource: 'fiber',
    defaultGas: 'N2',
    pressureBar: { min: 12, max: 20, recommended: 16 },
    focusSign: -1,
    nozzleThinMm: 1.5,
    nozzleThickMm: 2.5,
    kerfFactor: 0.12,
    notes: 'Отражение и теплоотвод. Нужны чистая линза, азот и запас мощности. Не смотрите в луч.',
    points: [
      row(1, 7000, 14000, 10000, 1000),
      row(2, 2800, 6000, 4200, 1400),
      row(3, 1400, 3400, 2200, 1800),
      row(4, 700, 2000, 1200, 2200),
      row(5, 400, 1200, 700, 2800),
      row(6, 220, 800, 420, 3500),
      row(8, 120, 450, 240, 5000),
    ],
  },
  {
    family: 'brass',
    label: 'Латунь',
    preferredSource: 'fiber',
    defaultGas: 'N2',
    pressureBar: { min: 12, max: 20, recommended: 16 },
    focusSign: -1,
    nozzleThinMm: 1.5,
    nozzleThickMm: 2.0,
    kerfFactor: 0.11,
    notes: 'Высокое отражение. Режьте с антиотражающим покрытием стола и не направляйте луч в резонатор при промахе.',
    points: [
      row(1, 2500, 5500, 3600, 1500),
      row(2, 900, 2200, 1400, 2200),
      row(3, 400, 1100, 650, 3000),
      row(4, 200, 600, 350, 4000),
    ],
  },
  {
    family: 'copper',
    label: 'Медь',
    preferredSource: 'fiber',
    defaultGas: 'N2',
    pressureBar: { min: 12, max: 20, recommended: 16 },
    focusSign: -1,
    nozzleThinMm: 1.5,
    nozzleThickMm: 2.0,
    kerfFactor: 0.1,
    notes: 'Медь сильно отражает ИК волокна. Нужен запас мощности и короткие пробивки. Справочно, не паспорт IPG.',
    points: [
      row(1, 1800, 4200, 2600, 2000),
      row(2, 600, 1600, 950, 3000),
      row(3, 250, 800, 420, 4500),
    ],
  },
  {
    family: 'acrylic',
    label: 'Оргстекло',
    preferredSource: 'co2',
    defaultGas: 'Air',
    pressureBar: { min: 0.2, max: 1.5, recommended: 0.6 },
    focusSign: 0,
    nozzleThinMm: 2.0,
    nozzleThickMm: 2.5,
    kerfFactor: 0.2,
    notes: 'CO₂ даёт полированную кромку. Волокно обычно не годится. Следите за парами MMA — вытяжка обязательна.',
    points: [
      row(2, 700, 1400, 1000, 40),
      row(3, 450, 1000, 700, 50),
      row(5, 250, 700, 420, 70),
      row(8, 140, 450, 260, 90),
      row(10, 90, 320, 180, 100),
      row(15, 50, 180, 100, 130),
    ],
  },
  {
    family: 'plastic',
    label: 'Пластик',
    preferredSource: 'co2',
    defaultGas: 'Air',
    pressureBar: { min: 0.2, max: 1.2, recommended: 0.5 },
    focusSign: 0,
    nozzleThinMm: 2.0,
    nozzleThickMm: 2.5,
    kerfFactor: 0.25,
    notes: 'PVC и фторполимеры на лазере не режьте: токсичные газы. POM/PA — оплавление кромки, снижайте мощность.',
    points: [
      row(2, 500, 1100, 750, 40),
      row(4, 250, 650, 380, 60),
      row(6, 140, 400, 220, 80),
      row(10, 70, 220, 120, 100),
    ],
  },
  {
    family: 'wood',
    label: 'Дерево / фанера',
    preferredSource: 'co2',
    defaultGas: 'Air',
    pressureBar: { min: 0.3, max: 2, recommended: 0.8 },
    focusSign: 0,
    nozzleThinMm: 2.0,
    nozzleThickMm: 3.0,
    kerfFactor: 0.3,
    notes: 'Скорость зависит от клея и плотности. Есть риск обугливания и возгорания — не оставляйте станок без присмотра.',
    points: [
      row(3, 600, 1600, 1000, 40),
      row(4, 450, 1200, 750, 50),
      row(6, 280, 800, 480, 70),
      row(8, 180, 550, 320, 90),
      row(10, 120, 400, 220, 100),
      row(18, 50, 180, 90, 140),
    ],
  },
]

function row(thicknessMm: number, min: number, max: number, recommended: number, minPowerW: number): LaserThicknessPoint {
  return {
    thicknessMm,
    speedMmMin: { min, max, recommended },
    minPowerW,
  }
}

export function laserFamilyForCategory(category: MaterialCategory, materialId: string): LaserFamily {
  if (category === 'steel') return 'mild_steel'
  if (category === 'cast_iron') return 'cast_iron'
  if (category === 'stainless') return 'stainless'
  if (category === 'aluminum') return 'aluminum'
  if (category === 'nonferrous') return materialId === 'copper' ? 'copper' : 'brass'
  if (category === 'wood') return 'wood'
  if (materialId === 'acrylic') return 'acrylic'
  return 'plastic'
}

export function getLaserFamilyTable(family: LaserFamily): LaserFamilyTable {
  const table = laserFamilyTables.find((item) => item.family === family)
  if (!table) throw new Error(`Unknown laser family ${family}`)
  return table
}
