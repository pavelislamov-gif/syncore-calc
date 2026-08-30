import { useEffect, useMemo, useState } from 'react'
import { getMaterial, listMaterials } from '@/data/materials'
import { defaultLaserSource, getLaserSource } from '@/data/laser/sources'
import { calculateLaser } from '@/engine/laser'
import { CalculationError } from '@/engine/errors'
import type { AssistGas, LaserOperation, LaserQuality, LaserResult, LaserSourceKind } from '@/types/laser'
import type { ParamMode } from '@/types/milling'

export interface LaserFormState {
  materialId: string
  thickness: string
  cutLength: string
  sourceId: string
  sourceKind: LaserSourceKind
  powerW: string
  operation: LaserOperation
  quality: LaserQuality
  gasMode: 'auto' | 'manual'
  gas: AssistGas
  paramMode: ParamMode
  speed: string
  powerPct: string
}

const source = defaultLaserSource()

export const initialLaserState: LaserFormState = {
  materialId: 'st3',
  thickness: '3',
  cutLength: '1000',
  sourceId: source.id,
  sourceKind: source.kind,
  powerW: String(source.powerW),
  operation: 'cut',
  quality: 'standard',
  gasMode: 'auto',
  gas: 'O2',
  paramMode: 'auto',
  speed: '',
  powerPct: '',
}

function num(value: string): number {
  return Number(String(value).replace(',', '.'))
}

export function runLaser(state: LaserFormState): LaserResult {
  return calculateLaser({
    materialId: state.materialId,
    thicknessMm: num(state.thickness),
    cutLengthMm: num(state.cutLength),
    sourceKind: state.sourceKind,
    powerW: num(state.powerW),
    operation: state.operation,
    quality: state.quality,
    gasMode: state.gasMode,
    gas: state.gas,
    paramMode: state.paramMode,
    overrides: {
      speedMmMin: state.paramMode === 'manual' && state.speed ? num(state.speed) : undefined,
      powerPct: state.paramMode === 'manual' && state.powerPct ? num(state.powerPct) : undefined,
    },
  })
}

export function useLaserForm() {
  const [state, setStateInner] = useState<LaserFormState>(initialLaserState)
  const [result, setResult] = useState<LaserResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [advanced, setAdvanced] = useState(false)
  const material = useMemo(() => getMaterial(state.materialId), [state.materialId])
  const materials = listMaterials({ plan: 'pro' })

  function applyCalc(next: LaserFormState) {
    try {
      setResult(runLaser(next))
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
    applyCalc(initialLaserState)
  }, [])

  function setState(updater: (current: LaserFormState) => LaserFormState) {
    setStateInner((current) => {
      const next = updater(current)
      queueMicrotask(() => applyCalc(next))
      return next
    })
  }

  function applySource(id: string) {
    const preset = getLaserSource(id) ?? defaultLaserSource()
    setState((current) => ({
      ...current,
      sourceId: preset.id,
      sourceKind: preset.kind,
      powerW: String(preset.powerW),
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
    applySource,
    calculate,
  }
}
