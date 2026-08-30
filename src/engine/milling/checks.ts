import type { CheckResult, CheckSeverity, MillingResult } from '@/types/milling'
import type { MachineLimits } from '@/types/machine'
import type { Material } from '@/types/material'
import type { MillToolInput } from '@/types/tool'
import { roundTo } from '../units'

export function evaluateMillingChecks(input: {
  rpm: number
  feedMmMin: number
  vc: number
  fz: number
  ap: number
  ae: number
  powerKw: number
  vcRange: { min: number; max: number }
  fzRange: { min: number; max: number }
  machine: MachineLimits
  tool: MillToolInput
  material: Material
}): { checks: CheckResult[]; status: CheckSeverity; statusTitle: string } {
  const checks: CheckResult[] = []
  const { machine, tool } = input

  if (input.rpm > machine.maxRpm + 0.5) {
    checks.push({
      id: 'rpm-limit',
      severity: 'warning',
      title: 'Обороты ограничены станком',
      detail: `Расчётные обороты: ${Math.round(input.rpm)} об/мин. Ваш станок ограничен ${formatInt(machine.maxRpm)} об/мин.`,
    })
  }

  if (tool.diameterMm > machine.colletDiameterMm + 1e-6) {
    checks.push({
      id: 'collet',
      severity: 'error',
      title: 'Диаметр фрезы больше цанги',
      detail: `Диаметр фрезы ${formatNum(tool.diameterMm)} мм превышает диаметр цанги ${formatNum(machine.colletDiameterMm)} мм.`,
    })
  }

  if (input.ap > machine.maxDepthMm + 1e-6) {
    checks.push({
      id: 'ap-machine',
      severity: 'error',
      title: 'Глубина резания больше возможности станка',
      detail: `ap = ${formatNum(input.ap)} мм, максимум станка ${formatNum(machine.maxDepthMm)} мм.`,
    })
  }

  if (input.ae > tool.diameterMm * 1.01) {
    checks.push({
      id: 'ae-diameter',
      severity: 'warning',
      title: 'Ширина резания больше диаметра',
      detail: `ae = ${formatNum(input.ae)} мм при диаметре ${formatNum(tool.diameterMm)} мм. Для обычной концевой фрезы ae не должна превышать D.`,
    })
  }

  if (input.ap > tool.diameterMm * 0.6 && machine.class === 'hobby') {
    checks.push({
      id: 'ap-aggressive',
      severity: 'warning',
      title: 'Большая глубина для хоббийного станка',
      detail: 'На лёгком станке такая глубина часто даёт вибрации и перегруз. Уменьшите ap или ширину ae.',
    })
  }

  if (input.powerKw > machine.spindlePowerKw * 1.05) {
    checks.push({
      id: 'power',
      severity: 'error',
      title: 'Ориентировочная мощность выше шпинделя',
      detail: `Оценка ${formatNum(input.powerKw, 2)} кВт при шпинделе ${formatNum(machine.spindlePowerKw, 2)} кВт. Это расчётная оценка, не измерение.`,
    })
  } else if (input.powerKw > machine.spindlePowerKw * 0.8) {
    checks.push({
      id: 'power-high',
      severity: 'warning',
      title: 'Высокая загрузка шпинделя',
      detail: `Ориентировочная мощность ${formatNum(input.powerKw, 2)} кВт при ${formatNum(machine.spindlePowerKw, 2)} кВт. Режим близок к пределу.`,
    })
  }

  if (input.vc < input.vcRange.min * 0.85 || input.vc > input.vcRange.max * 1.15) {
    checks.push({
      id: 'vc-range',
      severity: 'warning',
      title: 'Vc вне справочного диапазона',
      detail: `Скорость резания ${formatNum(input.vc)} м/мин при справочном диапазоне ${formatNum(input.vcRange.min)}–${formatNum(input.vcRange.max)} м/мин.`,
    })
  }

  if (input.fz < input.fzRange.min * 0.8 || input.fz > input.fzRange.max * 1.2) {
    checks.push({
      id: 'fz-range',
      severity: 'warning',
      title: 'fz вне справочного диапазона',
      detail: `Подача на зуб ${formatNum(input.fz, 3)} мм/зуб при справочном диапазоне ${formatNum(input.fzRange.min, 3)}–${formatNum(input.fzRange.max, 3)} мм/зуб.`,
    })
  }

  const hasError = checks.some((item) => item.severity === 'error')
  const hasWarning = checks.some((item) => item.severity === 'warning')
  const status: CheckSeverity = hasError ? 'error' : hasWarning ? 'warning' : 'ok'
  const statusTitle =
    status === 'ok'
      ? 'Режим подходит'
      : status === 'warning'
        ? 'Предупреждение'
        : 'Режим требует корректировки'

  return { checks, status, statusTitle }
}

export function applyMachineClamps(
  rpm: number,
  feedMmMin: number,
  ap: number,
  ae: number,
  machine: MachineLimits,
  diameterMm: number,
): Pick<MillingResult, 'rpm' | 'feedMmMin' | 'ap' | 'ae' | 'clamped'> {
  const clampedRpm = Math.min(rpm, machine.maxRpm)
  const clampedFeed = Math.min(feedMmMin, machine.maxFeedMmMin)
  const clampedAp = Math.min(ap, machine.maxDepthMm)
  const clampedAe = Math.min(ae, diameterMm)
  return {
    rpm: clampedRpm,
    feedMmMin: clampedFeed,
    ap: clampedAp,
    ae: clampedAe,
    clamped: {
      rpm: clampedRpm < rpm - 0.5,
      feed: clampedFeed < feedMmMin - 0.5,
      ap: clampedAp < ap - 1e-6,
      ae: clampedAe < ae - 1e-6,
    },
  }
}

function formatInt(value: number): string {
  return Math.round(value).toLocaleString('ru-RU')
}

function formatNum(value: number, digits = 1): string {
  return roundTo(value, digits).toLocaleString('ru-RU')
}
