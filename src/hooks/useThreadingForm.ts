import { useMemo, useState } from 'react'
import { defaultLathe, getLathePreset } from '@/data/machines/lathes'
import { getMaterial, listMaterials } from '@/data/materials'
import { getMetricThread, metricThreads } from '@/data/threading/metric'
import { calculateThread } from '@/engine/threading'
import { CalculationError } from '@/engine/errors'
import type { ThreadingResult } from '@/types/threading'
import type { ParamMode } from '@/types/milling'

export interface ThreadingFormState {
  materialId: string
  designation: string
  pitch: string
  customPitch: boolean
  internal: boolean
  length: string
  presetId: string
  paramMode: ParamMode
  vc: string
  maxRpm: string
  maxFeed: string
  powerKw: string
}

const lathe = defaultLathe()
const m20 = getMetricThread('M20')

export const initialThreadingState: ThreadingFormState = {
  materialId: 'st45',
  designation: 'M20',
  pitch: String(m20?.coarsePitchMm ?? 2.5),
  customPitch: false,
  internal: true,
  length: '30',
  presetId: lathe.id,
  paramMode: 'auto',
  vc: '',
  maxRpm: String(lathe.maxRpm),
  maxFeed: String(lathe.maxFeedMmMin),
  powerKw: String(lathe.spindlePowerKw),
}

function num(value: string): number {
  return Number(String(value).replace(',', '.'))
}

export function useThreadingForm() {
  const [state, setState] = useState<ThreadingFormState>(initialThreadingState)
  const [result, setResult] = useState<ThreadingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const material = useMemo(() => getMaterial(state.materialId), [state.materialId])
  const materials = listMaterials({ plan: 'pro' })
  const spec = getMetricThread(state.designation)

  function calculate() {
    try {
      const preset = getLathePreset(state.presetId) ?? defaultLathe()
      const next = calculateThread({
        materialId: state.materialId,
        designation: state.designation,
        pitchMm: num(state.pitch),
        diameterMm: spec?.diameterMm ?? num(state.designation),
        lengthMm: num(state.length),
        internal: state.internal,
        paramMode: state.paramMode,
        machine: {
          class: preset.class,
          name: preset.name,
          maxRpm: num(state.maxRpm),
          maxFeedMmMin: num(state.maxFeed),
          spindlePowerKw: num(state.powerKw),
          maxDepthMm: 4,
          colletDiameterMm: preset.colletDiameterMm,
        },
        vcOverride: state.paramMode === 'manual' && state.vc ? num(state.vc) : undefined,
      })
      setResult(next)
      setError(null)
      return next
    } catch (caught) {
      const message = caught instanceof CalculationError ? caught.userMessage : 'Проверьте введённые параметры.'
      setError(message)
      setResult(null)
      return null
    }
  }

  return { state, setState, result, error, material, materials, spec, threads: metricThreads, calculate }
}
