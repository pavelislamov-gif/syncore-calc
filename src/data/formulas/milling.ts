export const millingFormulas = {
  spindleSpeed: {
    id: 'n',
    label: 'Обороты шпинделя',
    formula: 'n = (Vc × 1000) / (π × D)',
    units: 'об/мин',
  },
  feedRate: {
    id: 'Vf',
    label: 'Минутная подача XY',
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
  plunge: {
    id: 'Vf_z',
    label: 'Скорость врезания по Z',
    formula: 'Vf_z = Vf × k_z',
    units: 'мм/мин',
  },
  helicalPlunge: {
    id: 'Vf_helical',
    label: 'Винтовое врезание',
    formula: 'Vf_helical = Vf × 0.55',
    units: 'мм/мин',
  },
  power: {
    id: 'P',
    label: 'Ориентировочная мощность',
    formula: 'P = (ap × ae × Vf × kc) / (60 × 10^6 × η)',
    units: 'кВт',
  },
} as const
