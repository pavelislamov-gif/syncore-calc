import type { MachinePreset } from '@/types/machine'

export const lathePresets: MachinePreset[] = [
  {
    id: 'lathe-hobby-075',
    class: 'hobby',
    name: 'Настольный токарный 0.75 кВт',
    maxRpm: 2500,
    maxFeedMmMin: 400,
    spindlePowerKw: 0.75,
    maxDepthMm: 3,
    colletDiameterMm: 160,
  },
  {
    id: 'lathe-hobby-15',
    class: 'hobby',
    name: 'Настольный токарный 1.5 кВт',
    maxRpm: 2500,
    maxFeedMmMin: 600,
    spindlePowerKw: 1.5,
    maxDepthMm: 4,
    colletDiameterMm: 200,
  },
  {
    id: 'lathe-ind-55',
    class: 'industrial',
    name: 'Промышленный токарный 5.5 кВт',
    maxRpm: 3000,
    maxFeedMmMin: 2000,
    spindlePowerKw: 5.5,
    maxDepthMm: 6,
    colletDiameterMm: 400,
  },
  {
    id: 'lathe-ind-75',
    class: 'industrial',
    name: 'Промышленный токарный 7.5 кВт',
    maxRpm: 2500,
    maxFeedMmMin: 3000,
    spindlePowerKw: 7.5,
    maxDepthMm: 8,
    colletDiameterMm: 500,
  },
]

export function defaultLathe(): MachinePreset {
  const first = lathePresets[0]
  if (!first) throw new Error('Lathe presets catalog is empty')
  return first
}

export function getLathePreset(id: string): MachinePreset | undefined {
  return lathePresets.find((item) => item.id === id)
}
