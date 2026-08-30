import { getMaterial } from '@/data/materials'
import { millingFormulas } from '@/data/formulas/milling'
import type { FormulaStep, MillingInput, MillingResult } from '@/types/milling'
import { CalculationError } from '../errors'
import { roundTo } from '../units'
import {
  validateDiameter,
  validateFlutes,
  validateMachineLimits,
  validateOverride,
} from '../validation'
import { applyMachineClamps, evaluateMillingChecks } from './checks'
import { calculateFeedPerTooth, calculateFeedRate, calculateHelicalPlungeFeed, calculatePlungeFeed, plungeRatio } from './feed'
import { calculatePower, recommendDepth, recommendWidth } from './power'
import { conservativeVc, recommendFz, recommendVc } from './recommend'
import { calculateCuttingSpeed, calculateSpindleSpeed } from './spindle'

export function calculateMilling(input: MillingInput): MillingResult {
  const errors = [
    ...validateDiameter(input.tool.diameterMm),
    ...validateFlutes(input.tool.flutes),
    ...validateMachineLimits(input.machine),
    ...validateOverride('vc', input.overrides.vc, 1, 2000, 'Скорость резания'),
    ...validateOverride('fz', input.overrides.fz, 0.001, 1, 'Подача на зуб'),
    ...validateOverride('ap', input.overrides.ap, 0.01, 100, 'Глубина резания'),
    ...validateOverride('ae', input.overrides.ae, 0.01, 100, 'Ширина резания'),
  ]
  const first = errors[0]
  if (first) {
    throw new CalculationError('validation', first.message)
  }

  const material = getMaterial(input.materialId)
  if (!material) {
    throw new CalculationError('material', 'Выберите материал из справочника.')
  }

  const vcRange = recommendVc(material, input.tool.cutterMaterial, input.tool.coating)
  const fzRange = recommendFz(material, input.tool.diameterMm, input.tool.cutterMaterial)
  const ratios = input.machineClass === 'industrial' ? 'industrial' : 'hobby'

  const autoVc = conservativeVc(vcRange, input.machineClass)
  const autoFz = fzRange.recommended
  const autoAp = recommendDepth(input.tool.diameterMm, material.milling.apToDiameter[ratios], input.machine.maxDepthMm)
  const autoAe = recommendWidth(input.tool.diameterMm, material.milling.aeToDiameter[ratios])

  const vcTarget = input.paramMode === 'manual' && input.overrides.vc != null ? input.overrides.vc : autoVc
  const fzTarget = input.paramMode === 'manual' && input.overrides.fz != null ? input.overrides.fz : autoFz
  const apTarget = input.paramMode === 'manual' && input.overrides.ap != null ? input.overrides.ap : autoAp
  const aeTarget = input.paramMode === 'manual' && input.overrides.ae != null ? input.overrides.ae : autoAe

  const theoreticalRpm = calculateSpindleSpeed(vcTarget, input.tool.diameterMm)
  const theoreticalFeed = calculateFeedRate(Math.min(theoreticalRpm, input.machine.maxRpm), input.tool.flutes, fzTarget)

  const clamped = applyMachineClamps(theoreticalRpm, theoreticalFeed, apTarget, aeTarget, input.machine, input.tool.diameterMm)
  const rpm = clamped.rpm
  const vcActual = calculateCuttingSpeed(rpm, input.tool.diameterMm)
  const feedMmMin = clamped.feedMmMin
  const fzActual = calculateFeedPerTooth(feedMmMin, rpm, input.tool.flutes)
  const plungeK = plungeRatio(material.machinability, input.tool.type)
  let plungeMmMin = calculatePlungeFeed(feedMmMin, plungeK)
  if (plungeMmMin > input.machine.maxFeedMmMin) {
    plungeMmMin = input.machine.maxFeedMmMin
  }
  const helicalPlungeMmMin = Math.min(calculateHelicalPlungeFeed(feedMmMin), input.machine.maxFeedMmMin)
  const fzPlunge = calculateFeedPerTooth(plungeMmMin, rpm, input.tool.flutes)
  const ap = clamped.ap
  const ae = clamped.ae
  const powerKw = calculatePower({
    ap,
    ae,
    feedMmMin,
    kc: material.milling.specificCuttingForceKc,
    machineClass: input.machineClass,
  })

  const checkSourceRpm = theoreticalRpm
  const { checks: baseChecks } = evaluateMillingChecks({
    rpm: checkSourceRpm,
    feedMmMin: theoreticalFeed,
    vc: vcActual,
    fz: fzActual,
    ap,
    ae,
    powerKw,
    vcRange,
    fzRange,
    machine: input.machine,
    tool: input.tool,
    material,
  })

  const checks = [...baseChecks]
  if (clamped.clamped.rpm) {
    const already = checks.some((item) => item.id === 'rpm-limit')
    if (!already) {
      checks.push({
        id: 'rpm-clamped',
        severity: 'warning',
        title: 'Обороты ограничены станком',
        detail: `Расчётные обороты: ${Math.round(theoreticalRpm).toLocaleString('ru-RU')} об/мин. Ваш станок ограничен ${Math.round(input.machine.maxRpm).toLocaleString('ru-RU')} об/мин.`,
      })
    }
  }
  if (clamped.clamped.feed) {
    checks.push({
      id: 'feed-limit',
      severity: 'warning',
      title: 'Подача ограничена станком',
      detail: `Расчётная подача ${Math.round(theoreticalFeed).toLocaleString('ru-RU')} мм/мин превышает максимум ${Math.round(input.machine.maxFeedMmMin).toLocaleString('ru-RU')} мм/мин.`,
    })
  }

  const finalStatus = checks.some((item) => item.severity === 'error')
    ? 'error'
    : checks.some((item) => item.severity === 'warning')
      ? 'warning'
      : 'ok'
  const finalTitle =
    finalStatus === 'ok'
      ? 'Режим подходит'
      : finalStatus === 'warning'
        ? 'Предупреждение'
        : 'Режим требует корректировки'

  const steps: FormulaStep[] = [
    {
      id: 'vc',
      label: millingFormulas.cuttingSpeed.label,
      formula: millingFormulas.spindleSpeed.formula,
      substitution: `n = (${roundTo(vcTarget, 1)} × 1000) / (π × ${input.tool.diameterMm})`,
      result: `${Math.round(theoreticalRpm)} об/мин (до ограничения станка)`,
    },
    {
      id: 'n',
      label: 'Обороты после ограничения станка',
      formula: 'n_fact = min(n, n_max)',
      substitution: `min(${Math.round(theoreticalRpm)}, ${input.machine.maxRpm})`,
      result: `${Math.round(rpm)} об/мин`,
    },
    {
      id: 'vc-actual',
      label: millingFormulas.cuttingSpeed.label,
      formula: millingFormulas.cuttingSpeed.formula,
      substitution: `Vc = (π × ${input.tool.diameterMm} × ${Math.round(rpm)}) / 1000`,
      result: `${roundTo(vcActual, 1)} м/мин`,
    },
    {
      id: 'vf',
      label: millingFormulas.feedRate.label,
      formula: millingFormulas.feedRate.formula,
      substitution: `Vf = ${Math.round(rpm)} × ${input.tool.flutes} × ${roundTo(fzTarget, 3)}`,
      result: `${roundTo(theoreticalFeed, 1)} мм/мин`,
    },
    {
      id: 'plunge',
      label: millingFormulas.plunge.label,
      formula: millingFormulas.plunge.formula,
      substitution: `Vf_z = ${roundTo(feedMmMin, 1)} × ${roundTo(plungeK, 3)}`,
      result: `${roundTo(plungeMmMin, 1)} мм/мин`,
    },
    {
      id: 'helical',
      label: millingFormulas.helicalPlunge.label,
      formula: millingFormulas.helicalPlunge.formula,
      substitution: `Vf_helical = ${roundTo(feedMmMin, 1)} × 0.55`,
      result: `${roundTo(helicalPlungeMmMin, 1)} мм/мин`,
    },
    {
      id: 'p',
      label: millingFormulas.power.label,
      formula: millingFormulas.power.formula,
      substitution: `P = (${roundTo(ap, 2)} × ${roundTo(ae, 2)} × ${roundTo(feedMmMin, 1)} × ${material.milling.specificCuttingForceKc}) / (60×10⁶ × η)`,
      result: `${roundTo(powerKw, 2)} кВт (оценка)`,
    },
  ]

  return {
    rpm,
    feedMmMin,
    vc: vcActual,
    fz: fzActual,
    ap,
    ae,
    powerKw,
    plungeMmMin,
    fzPlunge,
    helicalPlungeMmMin,
    plungeRatio: plungeK,
    status: finalStatus,
    statusTitle: finalTitle,
    checks,
    explanation:
      finalStatus === 'ok'
        ? 'Режим находится в рекомендуемом диапазоне.'
        : finalStatus === 'warning'
          ? 'Режим рассчитан, но есть предупреждения — проверьте ограничения станка и нагрузку.'
          : 'Режим требует корректировки: один или несколько параметров выходят за безопасные пределы.',
    why: `Для материала ${material.name} и фрезы Ø${formatD(input.tool.diameterMm)} мм с ${input.tool.flutes} зубьями выбран справочный диапазон скорости резания ${roundTo(vcRange.min, 0)}–${roundTo(vcRange.max, 0)} м/мин и подачи на зуб ${roundTo(fzRange.min, 3)}–${roundTo(fzRange.max, 3)} мм/зуб (${input.tool.cutterMaterial}, ${coatingLabel(input.tool.coating)}). Значения — справочные, не гарантированный паспортный режим.`,
    steps,
    usedRecommendedRanges: {
      vc: { min: vcRange.min, max: vcRange.max, recommended: vcRange.recommended },
      fz: { min: fzRange.min, max: fzRange.max, recommended: fzRange.recommended },
    },
    clamped: clamped.clamped,
  }
}

function formatD(value: number): string {
  return roundTo(value, 2).toString()
}

function coatingLabel(id: string): string {
  if (id === 'none') return 'без покрытия'
  return id
}
