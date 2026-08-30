import { formatDec, formatInt } from '@/engine/units'

export function formatNumber(value: number, digits = 0): string {
  return formatDec(value, digits)
}

export function formatRpm(value: number): string {
  return formatInt(value)
}

export function newId(): string {
  return crypto.randomUUID()
}
