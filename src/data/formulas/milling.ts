export const millingFormulas = {
  spindleSpeed: {
    id: 'n',
    label: 'Обороты шпинделя',
    formula: 'n = (Vc × 1000) / (π × D)',
    units: 'об/мин',
  },
  feedRate: {
    id: 'Vf',
    label: 'Минутная подача',
    formula: 'Vf = n × z × fz',
    units: 'мм/мин',
  },
  cuttingSpeed: {
    id: 'Vc',
    label: 'Скорость резания',
    formula: 'Vc = (π × D × n) / 1000',
    units: 'м/мин',
  },
  feedPerTooth: {
    id: 'fz',
    label: 'Подача на зуб',
    formula: 'fz = Vf / (n × z)',
    units: 'мм/зуб',
  },
  power: {
    id: 'P',
    label: 'Ориентировочная мощность',
    formula: 'P = (ap × ae × Vf × kc) / (60 × 10^6 × η)',
    units: 'кВт',
  },
} as const
