interface Props {
  thicknessMm: number
  focusMm: number
  nozzleMm: number
  sourceKind: 'fiber' | 'co2'
  gas: string
}

/** Side elevation: nozzle, assist gas, sheet, focus — not a 3D machine. */
export function LaserCutDiagram({ thicknessMm, focusMm, nozzleMm, sourceKind, gas }: Props) {
  const sheetH = Math.min(48, 10 + thicknessMm * 2.2)
  const sheetY = 86
  const sheetTop = sheetY - sheetH
  const focusY = sheetTop - focusMm * 4
  const nozzleW = 10 + nozzleMm * 3

  return (
    <svg viewBox="0 0 220 110" className="h-auto w-full" role="img" aria-label="Схема резки: сопло, фокус, лист">
      <rect x="8" y="8" width="204" height="94" rx="10" fill="#1c2128" />
      <rect x="28" y={sheetTop} width="164" height={sheetH} rx="2" fill="#8a9099" />
      <rect x="28" y={sheetTop} width="164" height={Math.max(3, sheetH * 0.18)} fill="#b7bcc6" />
      <path
        d={`M ${110 - nozzleW / 2} 18 L ${110 + nozzleW / 2} 18 L ${110 + 4} ${sheetTop - 10} L ${110 - 4} ${sheetTop - 10} Z`}
        fill="#d7dde6"
      />
      <rect x="104" y="12" width="12" height="10" rx="1" fill="#9aa3b0" />
      <line x1="110" y1="18" x2="110" y2={sheetY - 4} stroke="#f2c14e" strokeWidth="2" />
      <circle cx="110" cy={focusY} r="3.5" fill="none" stroke="#f2c14e" strokeWidth="1.5" />
      <path d={`M 110 ${sheetTop - 8} L 96 ${sheetTop + 6} M 110 ${sheetTop - 8} L 124 ${sheetTop + 6}`} stroke="#7ec8e3" strokeWidth="1.2" opacity="0.8" />
      <text x="16" y="22" fill="#c5ccd6" fontSize="8">
        {sourceKind === 'fiber' ? 'Fiber' : 'CO₂'} · {gas}
      </text>
      <text x="16" y="102" fill="#c5ccd6" fontSize="8">
        t {thicknessMm} мм · сопло {nozzleMm} мм · фокус {focusMm.toFixed(2)} мм
      </text>
    </svg>
  )
}
