import { getMaterial } from '@/data/materials'
import { laserFormulas } from '@/data/formulas/laser'
import { getLaserFamilyTable, laserFamilyForCategory } from '@/data/laser/regimes'
import type { AssistGas, LaserInput, LaserResult } from '@/types/laser'
import type { CheckResult } from '@/types/milling'
import { CalculationError } from '../errors'
import { formatDec, formatExact, formatInt } from '../units'
import { interpolatePoints, qualityFactor, scaleSpeedForPower } from './interpolate'

const FIBER_REF_W = 1500
const CO2_REF_W = 100

export function calculateLaser(input: LaserInput): LaserResult {
  if (!Number.isFinite(input.thicknessMm) || input.thicknessMm < 0.2 || input.thicknessMm > 40) {
    throw new CalculationError('thickness', 'Толщина листа: от 0.2 до 40 мм.')
  }
  if (!Number.isFinite(input.powerW) || input.powerW < 20 || input.powerW > 20000) {
    throw new CalculationError('power', 'Мощность источника: от 20 до 20 000 Вт.')
  }
  if (!Number.isFinite(input.cutLengthMm) || input.cutLengthMm < 1 || input.cutLengthMm > 100000) {
    throw new CalculationError('length', 'Длина реза: от 1 до 100 000 мм.')
  }

  const material = getMaterial(input.materialId)
  if (!material) throw new CalculationError('material', 'Выберите материал из справочника.')

  const family = laserFamilyForCategory(material.category, material.id)
  const table = getLaserFamilyTable(family)
  const metal = isMetal(family)
  const referenceW = table.preferredSource === 'fiber' ? FIBER_REF_W : CO2_REF_W
  const point = interpolatePoints(input.thicknessMm, table.points)
  const q = input.operation === 'engrave' ? 1.8 : qualityFactor(input.quality)

  let speedMmMin = scaleSpeedForPower(point.speedMmMin.recommended, input.powerW, referenceW) * q
  let rangeMin = scaleSpeedForPower(point.speedMmMin.min, input.powerW, referenceW) * q
  let rangeMax = scaleSpeedForPower(point.speedMmMin.max, input.powerW, referenceW) * q

  if (input.operation === 'engrave') {
    speedMmMin = Math.max(speedMmMin, metal ? 4000 : 1500)
    rangeMin = speedMmMin * 0.7
    rangeMax = speedMmMin * 1.4
  }

  if (input.paramMode === 'manual' && input.overrides.speedMmMin) {
    speedMmMin = input.overrides.speedMmMin
  }

  const gas: AssistGas = input.gasMode === 'manual' && input.gas ? input.gas : table.defaultGas
  const powerPct = clampPct(
    input.operation === 'engrave'
      ? 18
      : input.paramMode === 'manual' && input.overrides.powerPct
        ? input.overrides.powerPct
        : recommendedPowerPct(input.thicknessMm, input.powerW, point.minPowerW),
  )

  const pressureBar = pressureFor(table.pressureBar.recommended, gas, input.thicknessMm)
  const focusMm = focusFor(table.focusSign, input.thicknessMm, input.operation)
  const nozzleMm = input.thicknessMm <= 4 ? table.nozzleThinMm : table.nozzleThickMm
  const pierceTimeMs = input.operation === 'engrave' ? 0 : pierceTime(input.thicknessMm, metal)
  const cutHeightMm = metal ? 0.8 : 2.5
  const pierceHeightMm = metal ? 3.5 : 4
  const frequencyHz = input.sourceKind === 'fiber' ? (input.thicknessMm >= 8 ? 1000 : 5000) : 20_000
  const dutyPct = input.operation === 'engrave' ? 40 : 100
  const piercePowerPct = input.operation === 'engrave' ? 0 : Math.min(100, powerPct + 8)
  const kerfMm = Math.max(0.08, table.kerfFactor * Math.sqrt(input.thicknessMm) * (input.sourceKind === 'fiber' ? 1 : 1.3))
  const speedMmS = speedMmMin / 60
  const timeMin = input.cutLengthMm / speedMmMin + pierceTimeMs / 60000

  const checks = evaluateChecks({
    input,
    family,
    metal,
    tablePreferred: table.preferredSource,
    minPowerW: point.minPowerW,
    speedMmMin,
    rangeMin,
    rangeMax,
    gas,
    defaultGas: table.defaultGas,
    materialName: material.name,
    materialId: material.id,
  })

  const status = checks.some((item) => item.severity === 'error')
    ? 'error'
    : checks.some((item) => item.severity === 'warning')
      ? 'warning'
      : 'ok'
  const statusTitle =
    status === 'ok' ? 'Режим подходит' : status === 'warning' ? 'Предупреждение' : 'Режим требует корректировки'

  return {
    family,
    speedMmMin,
    speedMmS,
    powerPct,
    gas,
    pressureBar,
    focusMm,
    nozzleMm,
    pierceTimeMs,
    piercePowerPct,
    pierceHeightMm,
    cutHeightMm,
    frequencyHz,
    dutyPct,
    timeMin,
    kerfMm,
    minPowerW: point.minPowerW,
    status,
    statusTitle,
    checks,
    explanation:
      status === 'ok'
        ? 'Режим в справочном диапазоне для выбранных толщины и мощности.'
        : status === 'warning'
          ? 'Режим посчитан, но проверьте источник, газ и паспорт станка.'
          : 'Так резать не стоит: мощность, источник или материал не сходятся.',
    why: `Для ${material.name}, ${formatDec(input.thicknessMm)} мм, ${input.sourceKind === 'fiber' ? 'волокно' : 'CO₂'} ${formatInt(input.powerW)} Вт выбран газ ${gas} и скорость около ${formatInt(speedMmMin)} мм/мин. Это справочный старт, не паспорт конкретной головы и резонатора. ${table.notes}`,
    steps: [
      {
        id: 'v',
        label: laserFormulas.speedScale.label,
        formula: laserFormulas.speedScale.formula,
        substitution: `V = ${formatExact(point.speedMmMin.recommended)} × (${formatExact(input.powerW)} / ${referenceW})^0.65 × ${formatExact(q)}`,
        result: `${formatInt(speedMmMin)} мм/мин`,
      },
      {
        id: 'vs',
        label: laserFormulas.speedMmS.label,
        formula: laserFormulas.speedMmS.formula,
        substitution: `v = ${formatInt(speedMmMin)} / 60`,
        result: `${formatDec(speedMmS)} мм/с`,
      },
      {
        id: 't',
        label: laserFormulas.time.label,
        formula: laserFormulas.time.formula,
        substitution: `T = ${formatExact(input.cutLengthMm)} / ${formatInt(speedMmMin)}`,
        result: `${formatDec(timeMin)} мин`,
      },
    ],
    usedRecommendedRanges: {
      speedMmMin: { min: rangeMin, max: rangeMax, recommended: speedMmMin },
    },
  }
}

function evaluateChecks(args: {
  input: LaserInput
  family: LaserResult['family']
  metal: boolean
  tablePreferred: 'fiber' | 'co2'
  minPowerW: number
  speedMmMin: number
  rangeMin: number
  rangeMax: number
  gas: AssistGas
  defaultGas: AssistGas
  materialName: string
  materialId: string
}): CheckResult[] {
  const checks: CheckResult[] = []
  const { input } = args

  if (args.metal && input.sourceKind === 'co2') {
    checks.push({
      id: 'co2-metal',
      severity: 'error',
      title: 'CO₂ не режет конструкционный металл',
      detail: `${args.materialName} на настольном CO₂ не режется. Нужен волоконный источник.`,
    })
  }
  if (!args.metal && input.sourceKind === 'fiber') {
    checks.push({
      id: 'fiber-nonmetal',
      severity: 'warning',
      title: 'Для неметалла лучше CO₂',
      detail: 'Волокно 1064 нм плохо поглощается деревом и оргстеклом. Переключите источник на CO₂.',
    })
  }
  if (input.powerW < args.minPowerW * 0.9) {
    checks.push({
      id: 'power-low',
      severity: 'error',
      title: 'Мощности не хватает на эту толщину',
      detail: `Справочный минимум около ${formatInt(args.minPowerW)} Вт при ${formatDec(input.thicknessMm)} мм. У вас ${formatInt(input.powerW)} Вт.`,
    })
  } else if (input.powerW < args.minPowerW) {
    checks.push({
      id: 'power-tight',
      severity: 'warning',
      title: 'Мощность на пределе толщины',
      detail: `Минимум около ${formatInt(args.minPowerW)} Вт. Снизьте скорость и проверьте прорез.`,
    })
  }
  if (args.gas !== args.defaultGas && input.operation === 'cut') {
    checks.push({
      id: 'gas',
      severity: 'warning',
      title: 'Газ отличается от типичного',
      detail: `Для этого материала обычно ${args.defaultGas}. ${args.gas} изменит кромку и скорость — сверьтесь с паспортом.`,
    })
  }
  if (args.materialId === 'pvc' && input.operation === 'cut') {
    checks.push({
      id: 'pvc',
      severity: 'error',
      title: 'PVC на лазере резать нельзя',
      detail: 'При резке PVC выделяется хлористый водород. Это не технологическая рекомендация, а запрет по безопасности.',
    })
  }
  if (args.family === 'copper' || args.family === 'brass') {
    checks.push({
      id: 'reflect',
      severity: 'warning',
      title: 'Отражающий материал',
      detail: 'Следите за обратным отражением в резонатор. Не режьте без защиты оптики.',
    })
  }
  if (input.operation === 'cut' && (args.speedMmMin < args.rangeMin * 0.5 || args.speedMmMin > args.rangeMax * 1.4)) {
    checks.push({
      id: 'speed',
      severity: 'warning',
      title: 'Скорость вне справочного окна',
      detail: `Сейчас ${formatInt(args.speedMmMin)} мм/мин при диапазоне примерно ${formatInt(args.rangeMin)}–${formatInt(args.rangeMax)} мм/мин.`,
    })
  }
  return checks
}

function recommendedPowerPct(thicknessMm: number, powerW: number, minPowerW: number): number {
  const load = minPowerW / Math.max(powerW, 1)
  if (thicknessMm <= 2) return clampPct(70 + load * 15)
  if (thicknessMm <= 6) return clampPct(85 + load * 12)
  return clampPct(95)
}

function pressureFor(base: number, gas: AssistGas, thicknessMm: number): number {
  if (gas === 'O2') return Math.min(1.4, base + Math.max(0, thicknessMm - 6) * 0.04)
  if (gas === 'N2') return Math.min(20, base + Math.max(0, thicknessMm - 2) * 0.4)
  return base
}

function focusFor(sign: number, thicknessMm: number, operation: LaserInput['operation']): number {
  if (operation === 'engrave') return 0
  if (sign > 0) return Math.min(3, 0.15 * thicknessMm)
  if (sign < 0) return -Math.min(2.5, 0.25 * Math.sqrt(thicknessMm) * 2)
  return 0
}

function pierceTime(thicknessMm: number, metal: boolean): number {
  const base = metal ? 180 * thicknessMm ** 1.15 : 80 * thicknessMm ** 0.9
  return Math.round(base)
}

function isMetal(family: LaserResult['family']): boolean {
  return family !== 'acrylic' && family !== 'plastic' && family !== 'wood'
}

function clampPct(value: number): number {
  return Math.min(100, Math.max(5, Math.round(value)))
}
