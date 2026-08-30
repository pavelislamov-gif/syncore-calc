export const turningFormulas = {
  spindleSpeed: 'n = (Vc × 1000) / (π × D)',
  feedRate: 'Vf = n × f',
  cuttingSpeed: 'Vc = (π × D × n) / 1000',
  power: 'P = (kc × ap × f × Vc) / (60 × 10³ × η)',
  passes: 'N = ceil(припуск / ap)',
  time: 't = (L × N) / Vf',
} as const
