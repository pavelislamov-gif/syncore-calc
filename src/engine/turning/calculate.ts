import { getMaterial } from '@/data/materials'
import { getTurningParams } from '@/data/materials/turning'
import { getInsert } from '@/data/inserts'
import { getTurningOperation } from '@/data/formulas/operations'
import { turningFormulas } from '@/data/formulas/turning'
import type { CheckResult } from '@/types/milling'
import type { TurningInput, TurningResult } from '@/types/turning'
import { CalculationError } from '../errors'
import { roundTo } from '../units'
import { validateOverride } from '../validation'
import {
  calculateMachiningTimeMin,
  calculatePasses,
  calculateTurningCuttingSpeed,
  calculateTurningFeedRate,
  calculateTurningPower,
  calculateTurningSpindleSpeed,
} from './kinematics'
import { recommendTurningAp, recommendTurningFeed, recommendTurningVc, vcRangeForOperation } from './recommend'

export function validateTurningDiameter(diameterMm: number): { field: string; message: string }[] {
  if (!Number.isFinite(diameterMm) || diameterMm <= 0) {
    return [{ field: 'diameterMm', message: 'Введите диаметр заготовки от 1 до 800 мм.' }]
  }
  if (diameterMm < 1 || diameterMm > 800) {
    return [{ field: 'diameterMm', message: 'Введите диаметр заготовки от 1 до 800 мм.' }]
  }
  return []
}

export function calculateTurning(input: TurningInput): TurningResult {
  const errors = [
    ...validateTurningDiameter(input.diameterMm),
    ...validateOverride('vc', input.overrides.vc, 5, 2000, 'Скорость резания'),
    ...validateOverride('feedMmRev', input.overrides.feedMmRev, 0.01, 2, 'Подача'),
    ...validateOverride('ap', input.overrides.ap, 0.05, 20, 'Глубина резания'),
  ]
  if (!Number.isFinite(input.lengthMm) || input.lengthMm <= 0 || input.lengthMm > 5000) {
    errors.push({ field: 'lengthMm', message: 'Длина обработки: от 1 до 5000 мм.' })
  }
  const first = errors[0]
  if (first) throw new CalculationError('validation', first.message)

  const material = getMaterial(input.materialId)
  const params = getTurningParams(input.materialId)
  if (!material || !params) {
    throw new CalculationError('material', 'Выберите материал из справочника.')
  }

  const operation = getTurningOperation(input.operation)
  const insert = input.insertId ? getInsert(input.insertId) : null
  if (operation.needsInsert && !insert) {
    throw new CalculationError('insert', 'Выберите пластину. Для сверления пластина не нужна.')
  }

  const vcRange = vcRangeForOperation(params, input.operation)
  const autoVc = recommendTurningVc(params, input.operation)
  const autoF = recommendTurningFeed(params, input.operation, insert ?? null)
  const autoAp = recommendTurningAp(params, input.operation, input.stockMm)

  const vcTarget = input.paramMode === 'manual' && input.overrides.vc != null ? input.overrides.vc : autoVc
  const fTarget = input.paramMode === 'manual' && input.overrides.feedMmRev != null ? input.overrides.feedMmRev : autoF
  const apTarget = input.paramMode === 'manual' && input.overrides.ap != null ? input.overrides.ap : autoAp

  const theoreticalRpm = calculateTurningSpindleSpeed(vcTarget, input.diameterMm)
  const rpm = Math.min(theoreticalRpm, input.machine.maxRpm)
  const vc = calculateTurningCuttingSpeed(rpm, input.diameterMm)
  const theoreticalFeed = calculateTurningFeedRate(rpm, fTarget)
  const feedMmMin = Math.min(theoreticalFeed, input.machine.maxFeedMmMin)
  const feedMmRev = feedMmMin / rpm
  const ap = Math.min(apTarget, input.machine.maxDepthMm)
  const stock = input.stockMm > 0 ? input.stockMm : ap
  const passes = calculatePasses(stock, ap)
  const length = input.operation === 'face' ? input.diameterMm / 2 : input.lengthMm
  const timeMin = calculateMachiningTimeMin(length, feedMmMin, passes)
  const powerKw = calculateTurningPower({
    kc: params.kc,
    ap,
    feedMmRev,
    vc,
    efficiency: input.machine.class === 'hobby' ? 0.6 : 0.8,
  })

  const checks: CheckResult[] = []
  if (input.diameterMm > input.machine.colletDiameterMm + 1e-6) {
    checks.push({
      id: 'swing',
      severity: 'warning',
      title: 'Диаметр больше возможности станка',
      detail: `Ø${input.diameterMm} мм, максимум в профиле станка ${input.machine.colletDiameterMm} мм.`,
    })
  }
  if (theoreticalRpm > input.machine.maxRpm + 0.5) {
    checks.push({
      id: 'rpm',
      severity: 'warning',
      title: 'Обороты ограничены станком',
      detail: `Расчётные обороты: ${Math.round(theoreticalRpm).toLocaleString('ru-RU')} об/мин. Станок ограничен ${Math.round(input.machine.maxRpm).toLocaleString('ru-RU')} об/мин.`,
    })
  }
  if (theoreticalFeed > input.machine.maxFeedMmMin + 0.5) {
    checks.push({
      id: 'feed',
      severity: 'warning',
      title: 'Подача ограничена станком',
      detail: `Расчётная минутная подача ${Math.round(theoreticalFeed)} мм/мин превышает максимум ${input.machine.maxFeedMmMin} мм/мин.`,
    })
  }
  if (powerKw > input.machine.spindlePowerKw * 1.05) {
    checks.push({
      id: 'power',
      severity: 'error',
      title: 'Ориентировочная мощность выше шпинделя',
      detail: `Оценка ${roundTo(powerKw, 2)} кВт при шпинделе ${input.machine.spindlePowerKw} кВт.`,
    })
  } else if (powerKw > input.machine.spindlePowerKw * 0.85) {
    checks.push({
      id: 'power-high',
      severity: 'warning',
      title: 'Высокая загрузка шпинделя',
      detail: `Оценка ${roundTo(powerKw, 2)} кВт при ${input.machine.spindlePowerKw} кВт.`,
    })
  }
  if (insert && feedMmRev > insert.noseRadiusMm * 0.85) {
    checks.push({
      id: 'radius',
      severity: 'warning',
      title: 'Подача велика для радиуса вершины',
      detail: `f = ${roundTo(feedMmRev, 3)} мм/об при радиусе ${insert.noseRadiusMm} мм. Справочно f обычно не больше ~0.8×re.`,
    })
  }
  if (vc < vcRange.min * 0.8 || vc > vcRange.max * 1.2) {
    checks.push({
      id: 'vc',
      severity: 'warning',
      title: 'Vc вне справочного диапазона',
      detail: `${roundTo(vc, 0)} м/мин при диапазоне ${roundTo(vcRange.min, 0)}–${roundTo(vcRange.max, 0)} м/мин.`,
    })
  }

  const status = checks.some((item) => item.severity === 'error')
    ? 'error'
    : checks.some((item) => item.severity === 'warning')
      ? 'warning'
      : 'ok'
  const statusTitle =
    status === 'ok' ? 'Режим подходит' : status === 'warning' ? 'Предупреждение' : 'Режим требует корректировки'

  return {
    rpm,
    feedMmRev,
    feedMmMin,
    vc,
    ap,
    passes,
    powerKw,
    timeMin,
    status,
    statusTitle,
    checks,
    explanation:
      status === 'ok'
        ? 'Режим находится в рекомендуемом диапазоне.'
        : status === 'warning'
          ? 'Режим рассчитан, но проверьте ограничения станка и нагрузку.'
          : 'Режим требует корректировки.',
    why: `Для ${material.name}, операции «${operation.label}» и диаметра Ø${roundTo(input.diameterMm, 1)} мм выбран справочный диапазон Vc ${roundTo(vcRange.min, 0)}–${roundTo(vcRange.max, 0)} м/мин${insert ? ` и пластина ${insert.iso}` : ''}. Это справочные значения, не паспортный режим конкретной марки пластины.`,
    steps: [
      {
        id: 'n',
        label: 'Обороты',
        formula: turningFormulas.spindleSpeed,
        substitution: `n = (${roundTo(vcTarget, 1)} × 1000) / (π × ${input.diameterMm})`,
        result: `${Math.round(theoreticalRpm)} об/мин → ${Math.round(rpm)} об/мин`,
      },
      {
        id: 'vf',
        label: 'Минутная подача',
        formula: turningFormulas.feedRate,
        substitution: `Vf = ${Math.round(rpm)} × ${roundTo(feedMmRev, 3)}`,
        result: `${roundTo(feedMmMin, 1)} мм/мин`,
      },
      {
        id: 'p',
        label: 'Мощность',
        formula: turningFormulas.power,
        substitution: `P = (${params.kc} × ${roundTo(ap, 2)} × ${roundTo(feedMmRev, 3)} × ${roundTo(vc, 1)}) / (60×10³ × η)`,
        result: `${roundTo(powerKw, 2)} кВт (оценка)`,
      },
      {
        id: 'npass',
        label: 'Проходы и время',
        formula: `${turningFormulas.passes}; ${turningFormulas.time}`,
        substitution: `припуск ${roundTo(stock, 2)} мм, L = ${roundTo(length, 1)} мм`,
        result: `${passes} проход(а), ≈ ${roundTo(timeMin, 2)} мин`,
      },
    ],
    usedRecommendedRanges: {
      vc: { min: vcRange.min, max: vcRange.max, recommended: vcRange.recommended },
      feed: {
        min: operation.finish ? params.feedFinish.min : params.feedRough.min,
        max: operation.finish ? params.feedFinish.max : params.feedRough.max,
        recommended: fTarget,
      },
    },
    clamped: {
      rpm: rpm < theoreticalRpm - 0.5,
      feed: feedMmMin < theoreticalFeed - 0.5,
    },
  }
}
