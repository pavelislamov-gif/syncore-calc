export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString('ru-RU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function formatRpm(value: number): string {
  return Math.round(value).toLocaleString('ru-RU')
}

export function newId(): string {
  return crypto.randomUUID()
}
