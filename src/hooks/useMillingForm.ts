import { useMemo, useState } from 'react'
import { defaultMachineForClass, machinePresets } from '@/data/machines'
import { getMaterial, listMaterials } from '@/data/materials'
import { geometryToFormFields } from '@/data/tools/geometry'
import { calculateMilling } from '@/engine/milling'
import { CalculationError } from '@/engine/errors'
import type { MachineClass, MachineLimits } from '@/types/machine'
import type { MillingResult, ParamMode } from '@/types/milling'
import type { CoatingId, CutterMaterial, EndMillType } from '@/types/tool'

export interface MillingFormState {
  materialId: string
  diameter: string
  flutes: string
  millType: EndMillType
  cutterMaterial: CutterMaterial
  coating: CoatingId
  machineClass: MachineClass
  presetId: string
  maxRpm: string
  maxFeed: string
  powerKw: string
  maxDepth: string
  collet: string
  paramMode: ParamMode
  expert: boolean
  vc: string
  fz: string
  ap: string
  ae: string
  fluteLength: string
  shankDiameter: string
  tipRadius: string
  includedAngle: string
}

const hobby = defaultMachineForClass('hobby')

export const initialMillingState: MillingFormState = {
  materialId: 'amg6',
  diameter: '6',
  flutes: '2',
  millType: 'endmill',
  cutterMaterial: 'Carbide',
  coating: 'none',
  machineClass: 'hobby',
  presetId: hobby.id,
  maxRpm: String(hobby.maxRpm),
  maxFeed: String(hobby.maxFeedMmMin),
  powerKw: String(hobby.spindlePowerKw),
  maxDepth: String(hobby.maxDepthMm),
  collet: String(hobby.colletDiameterMm),
  paramMode: 'auto',
  expert: false,
  vc: '',
  fz: '',
  ap: '',
  ae: '',
  ...geometryToFormFields('endmill', 6),
}

function num(value: string): number {
  return Number(String(value).replace(',', '.'))
}

export function machineFromForm(state: MillingFormState): MachineLimits {
  return {
    class: state.machineClass,
    name: machinePresets.find((item) => item.id === state.presetId)?.name ?? 'Пользовательский станок',
    maxRpm: num(state.maxRpm),
    maxFeedMmMin: num(state.maxFeed),
    spindlePowerKw: num(state.powerKw),
    maxDepthMm: num(state.maxDepth),
    colletDiameterMm: num(state.collet),
  }
}

export function runMilling(state: MillingFormState): MillingResult {
  const diameterMm = num(state.diameter)
  const angleRaw = state.includedAngle.trim()
  return calculateMilling({
    materialId: state.materialId,
    tool: {
      diameterMm,
      flutes: Number(state.flutes),
      type: state.millType,
      cutterMaterial: state.cutterMaterial,
      coating: state.coating,
      fluteLengthMm: num(state.fluteLength),
      shankDiameterMm: num(state.shankDiameter),
      tipRadiusMm: state.millType === 'ball' ? diameterMm / 2 : num(state.tipRadius) || 0,
      includedAngleDeg: angleRaw === '' ? null : num(angleRaw),
    },
    machine: machineFromForm(state),
    paramMode: state.paramMode,
    machineClass: state.machineClass,
    expert: state.expert,
    overrides: {
      vc: state.paramMode === 'manual' && state.vc ? num(state.vc) : undefined,
      fz: state.paramMode === 'manual' && state.fz ? num(state.fz) : undefined,
      ap: state.paramMode === 'manual' && state.ap ? num(state.ap) : undefined,
      ae: state.paramMode === 'manual' && state.ae ? num(state.ae) : undefined,
    },
  })
}

export function useMillingForm(seed?: Partial<MillingFormState>) {
  const start = { ...initialMillingState, ...seed }
  const [state, setStateInner] = useState<MillingFormState>(start)
  const [result, setResult] = useState<MillingResult | null>(() => {
    try {
      return runMilling(start)
    } catch {
      return null
    }
  })
  const [error, setError] = useState<string | null>(null)
  const [advanced, setAdvanced] = useState(false)

  const material = useMemo(() => getMaterial(state.materialId), [state.materialId])
  const materials = listMaterials({ plan: 'pro' })

  function applyCalc(next: MillingFormState) {
    try {
      setResult(runMilling(next))
      setError(null)
      return true
    } catch (caught) {
      const message = caught instanceof CalculationError ? caught.userMessage : 'Проверьте введённые параметры.'
      setError(message)
      setResult(null)
      return false
    }
  }

  function setState(updater: (current: MillingFormState) => MillingFormState) {
    setStateInner((current) => {
      const next = updater(current)
      queueMicrotask(() => applyCalc(next))
      return next
    })
  }

  function applyPreset(id: string, machineClass: MachineClass) {
    const preset = machinePresets.find((item) => item.id === id) ?? defaultMachineForClass(machineClass)
    setState((current) => ({
      ...current,
      presetId: preset.id,
      machineClass: preset.class,
      maxRpm: String(preset.maxRpm),
      maxFeed: String(preset.maxFeedMmMin),
      powerKw: String(preset.spindlePowerKw),
      maxDepth: String(preset.maxDepthMm),
      collet: String(preset.colletDiameterMm),
    }))
  }

  function calculate() {
    return applyCalc(state)
  }

  return {
    state,
    setState,
    result,
    error,
    advanced,
    setAdvanced,
    material,
    materials,
    applyPreset,
    calculate,
    setResult,
    setError,
  }
}
