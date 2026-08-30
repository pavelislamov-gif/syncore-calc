export const laserFormulas = {
  speedScale: {
    label: 'Скорость от мощности',
    formula: 'V = V₁₅₀₀ × (P / 1500)^0.65 × k_кач',
  },
  time: {
    label: 'Время реза',
    formula: 'T = L / Vf',
  },
  cypCutSpeed: {
    label: 'CypCut Speed',
    formula: 'Speed [mm/s] = Vf [мм/мин] / 60',
  },
}
