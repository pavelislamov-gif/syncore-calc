import { defaultToolGeometry } from '@/data/tools/geometry'
import { getMaterial } from '@/data/materials'
import { millingFormulas } from '@/data/formulas/milling'
import type { FormulaStep, MillingInput, MillingResult } from '@/types/milling'
import { CalculationError } from '../errors'
import { formatDec, formatExact, formatInt } from '../units'
import {
  validateDiameter,
  validateFlutes,
  validateMachineLimits,
  validateOverride,
  validateToolGeometry,
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
    ...validateToolGeometry(resolveGeometry(input.tool)),
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

  const tool = resolveGeometry(input.tool)

  const vcRange = recommendVc(material, tool.cutterMaterial, tool.coating)
  const fzRange = recommendFz(material, tool.diameterMm, tool.cutterMaterial)
  const ratios = input.machineClass === 'industrial' ? 'industrial' : 'hobby'

  const autoVc = conservativeVc(vcRange, input.machineClass)
  const autoFz = fzRange.recommended
  const autoAp = recommendDepth(tool.diameterMm, material.milling.apToDiameter[ratios], input.machine.maxDepthMm, tool.fluteLengthMm)
  const autoAe = recommendWidth(tool.diameterMm, material.milling.aeToDiameter[ratios])

  const vcTarget = input.paramMode === 'manual' && input.overrides.vc != null ? input.overrides.vc : autoVc
  const fzTarget = input.paramMode === 'manual' && input.overrides.fz != null ? input.overrides.fz : autoFz
  const apTarget = input.paramMode === 'manual' && input.overrides.ap != null ? input.overrides.ap : autoAp
  const aeTarget = input.paramMode === 'manual' && input.overrides.ae != null ? input.overrides.ae : autoAe

  const theoreticalRpm = calculateSpindleSpeed(vcTarget, tool.diameterMm)
  const theoreticalFeed = calculateFeedRate(Math.min(theoreticalRpm, input.machine.maxRpm), tool.flutes, fzTarget)

  const clamped = applyMachineClamps(theoreticalRpm, theoreticalFeed, apTarget, aeTarget, input.machine, tool.diameterMm, tool.fluteLengthMm)
  const rpm = clamped.rpm
  const vcActual = calculateCuttingSpeed(rpm, tool.diameterMm)
  const feedMmMin = clamped.feedMmMin
  const fzActual = calculateFeedPerTooth(feedMmMin, rpm, tool.flutes)
  const plungeK = plungeRatio(material.machinability, tool.type)
  let plungeMmMin = calculatePlungeFeed(feedMmMin, plungeK)
  if (plungeMmMin > input.machine.maxFeedMmMin) {
    plungeMmMin = input.machine.maxFeedMmMin
  }
  const helicalPlungeMmMin = Math.min(calculateHelicalPlungeFeed(feedMmMin), input.machine.maxFeedMmMin)
  const fzPlunge = calculateFeedPerTooth(plungeMmMin, rpm, tool.flutes)
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
    tool,
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
        detail: `Расчётные обороты: ${formatInt(theoreticalRpm)} об/мин. Ваш станок ограничен ${formatInt(input.machine.maxRpm)} об/мин.`,
      })
    }
  }
  if (clamped.clamped.feed) {
    checks.push({
      id: 'feed-limit',
      severity: 'warning',
      title: 'Подача ограничена станком',
      detail: `Расчётная подача ${formatInt(theoreticalFeed)} мм/мин превышает максимум ${formatInt(input.machine.maxFeedMmMin)} мм/мин.`,
    })
  }
  if (clamped.clamped.ap) {
    checks.push({
      id: 'ap-limit',
      severity: 'warning',
      title: 'Глубина ограничена геометрией',
      detail: `ap ограничена меньшим из: максимум станка ${formatDec(input.machine.maxDepthMm)} мм и длина режущей части ${formatDec(tool.fluteLengthMm)} мм.`,
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
      substitution: `n = (${formatExact(vcTarget)} × 1000) / (π × ${formatExact(tool.diameterMm)})`,
      result: `${formatInt(theoreticalRpm)} об/мин (до ограничения станка)`,
    },
    {
      id: 'n',
      label: 'Обороты после ограничения станка',
      formula: 'n_fact = min(n, n_max)',
      substitution: `min(${formatExact(theoreticalRpm)}, ${formatExact(input.machine.maxRpm)})`,
      result: `${formatInt(rpm)} об/мин`,
    },
    {
      id: 'vc-actual',
      label: millingFormulas.cuttingSpeed.label,
      formula: millingFormulas.cuttingSpeed.formula,
      substitution: `Vc = (π × ${formatExact(tool.diameterMm)} × ${formatExact(rpm)}) / 1000`,
      result: `${formatDec(vcActual)} м/мин`,
    },
    {
      id: 'vf',
      label: millingFormulas.feedRate.label,
      formula: millingFormulas.feedRate.formula,
      substitution: `Vf = ${formatExact(rpm)} × ${tool.flutes} × ${formatExact(fzTarget)}`,
      result: `${formatInt(theoreticalFeed)} мм/мин`,
    },
    {
      id: 'plunge',
      label: millingFormulas.plunge.label,
      formula: millingFormulas.plunge.formula,
      substitution: `Vf_z = ${formatExact(feedMmMin)} × ${formatExact(plungeK)}`,
      result: `${formatInt(plungeMmMin)} мм/мин`,
    },
    {
      id: 'helical',
      label: millingFormulas.helicalPlunge.label,
      formula: millingFormulas.helicalPlunge.formula,
      substitution: `Vf_helical = ${formatExact(feedMmMin)} × 0.55`,
      result: `${formatInt(helicalPlungeMmMin)} мм/мин`,
    },
    {
      id: 'p',
      label: millingFormulas.power.label,
      formula: millingFormulas.power.formula,
      substitution: `P = (${formatExact(ap)} × ${formatExact(ae)} × ${formatExact(feedMmMin)} × ${material.milling.specificCuttingForceKc}) / (60×10⁶ × η)`,
      result: `${formatDec(powerKw)} кВт (оценка)`,
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
    why: `Для материала ${material.name} и фрезы Ø${formatExact(tool.diameterMm)} мм с ${tool.flutes} зубьями выбран справочный диапазон скорости резания ${formatExact(vcRange.min)}–${formatExact(vcRange.max)} м/мин и подачи на зуб ${formatExact(fzRange.min)}–${formatExact(fzRange.max)} мм/зуб (${tool.cutterMaterial}, ${coatingLabel(tool.coating)}). Геометрия: L=${formatExact(tool.fluteLengthMm)} мм${tool.tipRadiusMm > 0 ? `, r=${formatExact(tool.tipRadiusMm)} мм` : ''}${tool.includedAngleDeg != null ? `, α=${formatExact(tool.includedAngleDeg)}°` : ''}. Значения — справочные, не гарантированный паспортный режим.`,
    steps,
    usedRecommendedRanges: {
      vc: { min: vcRange.min, max: vcRange.max, recommended: vcRange.recommended },
      fz: { min: fzRange.min, max: fzRange.max, recommended: fzRange.recommended },
    },
    geometry: {
      fluteLengthMm: tool.fluteLengthMm,
      shankDiameterMm: tool.shankDiameterMm,
      tipRadiusMm: tool.tipRadiusMm,
      includedAngleDeg: tool.includedAngleDeg,
    },
    clamped: clamped.clamped,
  }
}

function resolveGeometry(tool: MillingInput['tool']): Required<Pick<
  MillingInput['tool'],
  'diameterMm' | 'flutes' | 'type' | 'cutterMaterial' | 'coating' | 'fluteLengthMm' | 'shankDiameterMm' | 'tipRadiusMm'
>> & { includedAngleDeg: number | null } {
  const defaults = defaultToolGeometry(tool.type, tool.diameterMm)
  const tipRadiusMm = tool.type === 'ball' ? tool.diameterMm / 2 : (tool.tipRadiusMm ?? defaults.tipRadiusMm)
  const needsAngle = tool.type === 'chamfer' || tool.type === 'drill'
  return {
    diameterMm: tool.diameterMm,
    flutes: tool.flutes,
    type: tool.type,
    cutterMaterial: tool.cutterMaterial,
    coating: tool.coating,
    fluteLengthMm: tool.fluteLengthMm ?? defaults.fluteLengthMm,
    shankDiameterMm: tool.shankDiameterMm ?? defaults.shankDiameterMm,
    tipRadiusMm,
    includedAngleDeg: needsAngle ? (tool.includedAngleDeg ?? defaults.includedAngleDeg) : (tool.includedAngleDeg ?? null),
  }
}

function coatingLabel(id: string): string {
  if (id === 'none') return 'без покрытия'
  return id
}
