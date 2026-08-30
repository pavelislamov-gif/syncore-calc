import type { MachinePreset } from '@/types/machine'

export const machinePresets: MachinePreset[] = [
  {
    id: 'hobby-desktop',
    class: 'hobby',
    name: 'Хоббийный настольный ЧПУ',
    maxRpm: 18000,
    maxFeedMmMin: 2000,
    spindlePowerKw: 0.8,
    maxDepthMm: 5,
    colletDiameterMm: 6,
  },
  {
    id: 'hobby-router',
    class: 'hobby',
    name: 'Хоббийный шпиндель 1.5 кВт',
    maxRpm: 24000,
    maxFeedMmMin: 4000,
    spindlePowerKw: 1.5,
    maxDepthMm: 8,
    colletDiameterMm: 8,
  },
  {
    id: 'industrial-3kw',
    class: 'industrial',
    name: 'Промышленный 3 кВт',
    maxRpm: 12000,
    maxFeedMmMin: 8000,
    spindlePowerKw: 3,
    maxDepthMm: 16,
    colletDiameterMm: 16,
  },
  {
    id: 'industrial-75',
    class: 'industrial',
    name: 'Промышленный 7.5 кВт',
    maxRpm: 8000,
    maxFeedMmMin: 12000,
    spindlePowerKw: 7.5,
    maxDepthMm: 25,
    colletDiameterMm: 20,
  },
]

export function getMachinePreset(id: string): MachinePreset | undefined {
  return machinePresets.find((item) => item.id === id)
}

export function defaultMachineForClass(machineClass: MachinePreset['class']): MachinePreset {
  const found = machinePresets.find((item) => item.class === machineClass)
  if (found) return found
  const first = machinePresets[0]
  if (!first) {
    throw new Error('Machine presets catalog is empty')
  }
  return first
}
