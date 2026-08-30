import { formatExact } from '@/engine/units'

export function formatNumber(value: number, _digits?: number): string {
  return formatExact(value)
}

export function formatRpm(value: number): string {
  return formatExact(value)
}

export function newId(): string {
  return crypto.randomUUID()
}
