export const laserFormulas = {
  speedScale: {
    label: 'Скорость от мощности',
    formula: 'V = V₁₅₀₀ × (P / 1500)^0.65 × k_кач',
  },
  time: {
    label: 'Время реза',
    formula: 'T = L / Vf',
  },
  speedMmS: {
    label: 'Скорость в мм/с',
    formula: 'v = Vf / 60',
  },
}
