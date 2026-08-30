export const MM_PER_INCH = 25.4

export function mmToInch(mm: number): number {
  return mm / MM_PER_INCH
}

export function inchToMm(inch: number): number {
  return inch * MM_PER_INCH
}

export function cmToMm(cm: number): number {
  return cm * 10
}

export function mToMm(m: number): number {
  return m * 1000
}

export function mmMinToMMin(mmMin: number): number {
  return mmMin / 1000
}

export function kwToW(kw: number): number {
  return kw * 1000
}

export function wToKw(w: number): number {
  return w / 1000
}

/** Integer display for spindle rpm and feed in mm/min. */
export function formatInt(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toFixed(0)
}

/** Two-decimal (or custom) display for feeds, Vc, power, depth, time. */
export function formatDec(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return value.toFixed(digits)
}

/** Unrounded value for formula substitutions (inputs), not result cards. */
export function formatExact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('ru-RU', {
    maximumFractionDigits: 12,
    minimumFractionDigits: 0,
  })
}

export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
