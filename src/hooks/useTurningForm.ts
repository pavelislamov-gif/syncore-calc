import { useEffect, useMemo, useState } from 'react'
import { defaultLathe, getLathePreset } from '@/data/machines/lathes'
import { getMaterial, listMaterials } from '@/data/materials'
import { getCutterKind } from '@/data/tools/cutters'
import { calculateTurning } from '@/engine/turning'
import { CalculationError } from '@/engine/errors'
import type { TurningOperation, TurningResult } from '@/types/turning'
import type { ParamMode } from '@/types/milling'
import type { MachineLimits } from '@/types/machine'

export interface TurningFormState {
  operation: TurningOperation
  materialId: string
  diameter: string
  length: string
  stock: string
  insertId: string
  cutterId: string
  presetId: string
  paramMode: ParamMode
  expert: boolean
  vc: string
  feed: string
  ap: string
  maxRpm: string
  maxFeed: string
  powerKw: string
  maxDepth: string
  maxDia: string
}

const lathe = defaultLathe()

export const initialTurningState: TurningFormState = {
  operation: 'rough_od',
  materialId: 'st45',
  diameter: '50',
  length: '80',
  stock: '3',
  insertId: 'CNMG120408',
  cutterId: 'od_straight',
  presetId: lathe.id,
  paramMode: 'auto',
  expert: false,
  vc: '',
  feed: '',
  ap: '',
  maxRpm: String(lathe.maxRpm),
  maxFeed: String(lathe.maxFeedMmMin),
  powerKw: String(lathe.spindlePowerKw),
  maxDepth: String(lathe.maxDepthMm),
  maxDia: String(lathe.colletDiameterMm),
}

function num(value: string): number {
  return Number(String(value).replace(',', '.'))
}

export function machineFromTurningForm(state: TurningFormState): MachineLimits {
  const preset = getLathePreset(state.presetId)
  return {
    class: preset?.class ?? 'hobby',
    name: preset?.name ?? 'Токарный станок',
    maxRpm: num(state.maxRpm),
    maxFeedMmMin: num(state.maxFeed),
    spindlePowerKw: num(state.powerKw),
    maxDepthMm: num(state.maxDepth),
    colletDiameterMm: num(state.maxDia),
  }
}

export function runTurning(state: TurningFormState): TurningResult {
  return calculateTurning({
    materialId: state.materialId,
    operation: state.operation,
    diameterMm: num(state.diameter),
    lengthMm: num(state.length),
    stockMm: num(state.stock),
    insertId: state.operation === 'drill' || getCutterKind(state.cutterId)?.needsInsert === false ? null : state.insertId,
    cutterId: state.cutterId,
    paramMode: state.paramMode,
    machine: machineFromTurningForm(state),
    overrides: {
      vc: state.paramMode === 'manual' && state.vc ? num(state.vc) : undefined,
      feedMmRev: state.paramMode === 'manual' && state.feed ? num(state.feed) : undefined,
      ap: state.paramMode === 'manual' && state.ap ? num(state.ap) : undefined,
    },
  })
}

export function useTurningForm() {
  const [state, setStateInner] = useState<TurningFormState>(initialTurningState)
  const [result, setResult] = useState<TurningResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [advanced, setAdvanced] = useState(false)
  const material = useMemo(() => getMaterial(state.materialId), [state.materialId])
  const materials = listMaterials({ plan: 'pro' })

  function applyCalc(next: TurningFormState) {
    try {
      setResult(runTurning(next))
      setError(null)
      return true
    } catch (caught) {
      const message = caught instanceof CalculationError ? caught.userMessage : 'Проверьте введённые параметры.'
      setError(message)
      setResult(null)
      return false
    }
  }

  useEffect(() => {
    applyCalc(initialTurningState)
  }, [])

  function setState(updater: (current: TurningFormState) => TurningFormState) {
    setStateInner((current) => {
      const next = updater(current)
      queueMicrotask(() => applyCalc(next))
      return next
    })
  }

  function applyLathe(id: string) {
    const preset = getLathePreset(id) ?? defaultLathe()
    setState((current) => ({
      ...current,
      presetId: preset.id,
      maxRpm: String(preset.maxRpm),
      maxFeed: String(preset.maxFeedMmMin),
      powerKw: String(preset.spindlePowerKw),
      maxDepth: String(preset.maxDepthMm),
      maxDia: String(preset.colletDiameterMm),
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
    applyLathe,
    calculate,
  }
}
