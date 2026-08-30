import { getMaterial } from '@/data/materials'
import { getTurningParams } from '@/data/materials/turning'
import { getMetricThread, threadingFormulas } from '@/data/threading/metric'
import type { ThreadingInput, ThreadingResult } from '@/types/threading'
import { CalculationError } from '../errors'
import { roundTo } from '../units'
import { calculateTurningCuttingSpeed, calculateTurningFeedRate, calculateTurningSpindleSpeed } from '../turning/kinematics'

const METRIC_HEIGHT_FACTOR = 0.54127

export function calculateTapDrill(diameterMm: number, pitchMm: number): number {
  return diameterMm - pitchMm
}

export function calculateThreadDepth(pitchMm: number): number {
  return METRIC_HEIGHT_FACTOR * pitchMm
}

export function recommendThreadPasses(pitchMm: number): number {
  return Math.min(16, Math.max(4, Math.ceil(pitchMm / 0.2) + 2))
}

export function calculateThread(input: ThreadingInput): ThreadingResult {
  const spec = getMetricThread(input.designation)
  const diameter = input.diameterMm || spec?.diameterMm
  const pitch = input.pitchMm
  if (!spec && !diameter) {
    throw new CalculationError('thread', 'Выберите метрическую резьбу или задайте диаметр.')
  }
  if (!Number.isFinite(pitch) || pitch <= 0 || pitch > 8) {
    throw new CalculationError('pitch', 'Шаг резьбы: от 0.2 до 8 мм.')
  }
  if (!diameter || diameter < 1 || diameter > 200) {
    throw new CalculationError('diameter', 'Диаметр резьбы: от 1 до 200 мм.')
  }

  const material = getMaterial(input.materialId)
  const turning = getTurningParams(input.materialId)
  if (!material || !turning) {
    throw new CalculationError('material', 'Выберите материал из справочника.')
  }

  const autoVc = turning.vcCarbide.recommended * 0.28
  const vcTarget = input.paramMode === 'manual' && input.vcOverride != null ? input.vcOverride : autoVc
  const theoreticalRpm = calculateTurningSpindleSpeed(vcTarget, diameter)
  const rpm = Math.min(theoreticalRpm, input.machine.maxRpm)
  const vc = calculateTurningCuttingSpeed(rpm, diameter)
  const feedMmRev = pitch
  const feedMmMin = Math.min(calculateTurningFeedRate(rpm, feedMmRev), input.machine.maxFeedMmMin)
  const tapDrillMm = calculateTapDrill(diameter, pitch)
  const threadDepthMm = calculateThreadDepth(pitch)
  const passes = recommendThreadPasses(pitch)

  const checks = []
  if (theoreticalRpm > input.machine.maxRpm + 0.5) {
    checks.push({
      id: 'rpm',
      severity: 'warning' as const,
      title: 'Обороты ограничены станком',
      detail: `Расчётные ${Math.round(theoreticalRpm)} об/мин, максимум станка ${input.machine.maxRpm} об/мин.`,
    })
  }
  if (input.internal && tapDrillMm <= 0) {
    checks.push({
      id: 'drill',
      severity: 'error' as const,
      title: 'Некорректный шаг для диаметра',
      detail: 'Шаг слишком велик: расчётный диаметр отверстия неположительный.',
    })
  }

  const status = checks.some((item) => item.severity === 'error')
    ? 'error'
    : checks.some((item) => item.severity === 'warning')
      ? 'warning'
      : 'ok'

  return {
    designation: spec?.designation ?? `Ø${diameter}`,
    nominalDiameterMm: diameter,
    pitchMm: pitch,
    tapDrillMm,
    threadDepthMm,
    passes,
    rpm,
    feedMmRev,
    feedMmMin,
    vc,
    status,
    statusTitle: status === 'ok' ? 'Режим подходит' : status === 'warning' ? 'Предупреждение' : 'Режим требует корректировки',
    checks,
    explanation:
      'Для резьбы резцом подача за оборот равна шагу. Значения — справочная отправная точка, не паспорт ISO для конкретной метчиковой операции.',
    why: `Для ${material.name} и ${spec?.designation ?? 'произвольной'} P=${pitch} мм скорость резания снижена относительно точения (~28% от справочного Vc). Подача f = P.`,
    steps: [
      {
        id: 'drill',
        label: 'Отверстие под резьбу',
        formula: threadingFormulas.tapDrill,
        substitution: `d1 ≈ ${diameter} − ${pitch}`,
        result: `${roundTo(tapDrillMm, 2)} мм`,
      },
      {
        id: 'h1',
        label: 'Глубина резьбы',
        formula: threadingFormulas.depth,
        substitution: `H1 = 0.54127 × ${pitch}`,
        result: `${roundTo(threadDepthMm, 3)} мм`,
      },
      {
        id: 'n',
        label: 'Обороты',
        formula: threadingFormulas.spindle,
        substitution: `n = (${roundTo(vcTarget, 1)} × 1000) / (π × ${diameter})`,
        result: `${Math.round(rpm)} об/мин`,
      },
      {
        id: 'f',
        label: 'Подача резца',
        formula: threadingFormulas.feed,
        substitution: `f = ${pitch}`,
        result: `${pitch} мм/об · ${roundTo(feedMmMin, 1)} мм/мин`,
      },
    ],
  }
}
