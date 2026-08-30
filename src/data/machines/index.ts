import type { MachinePreset } from '@/types/machine'

export const machinePresets: MachinePreset[] = [
  {
    id: 'hobby-08',
    class: 'hobby',
    name: 'Хоббийный 0.8 кВт',
    maxRpm: 18000,
    maxFeedMmMin: 2000,
    spindlePowerKw: 0.8,
    maxDepthMm: 5,
    colletDiameterMm: 6,
  },
  {
    id: 'hobby-15',
    class: 'hobby',
    name: 'Хоббийный 1.5 кВт',
    maxRpm: 24000,
    maxFeedMmMin: 4000,
    spindlePowerKw: 1.5,
    maxDepthMm: 8,
    colletDiameterMm: 8,
  },
  {
    id: 'hobby-22',
    class: 'hobby',
    name: 'Хоббийный 2.2 кВт',
    maxRpm: 24000,
    maxFeedMmMin: 5000,
    spindlePowerKw: 2.2,
    maxDepthMm: 10,
    colletDiameterMm: 13,
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

export function formatMachineOption(preset: MachinePreset): string {
  return `${preset.name} · ${preset.maxRpm.toLocaleString('ru-RU')} об/мин`
}
