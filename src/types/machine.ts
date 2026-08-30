export type MachineClass = 'hobby' | 'industrial'

export interface MachineLimits {
  class: MachineClass
  name: string
  maxRpm: number
  maxFeedMmMin: number
  spindlePowerKw: number
  maxDepthMm: number
  colletDiameterMm: number
}

export interface MachinePreset extends MachineLimits {
  id: string
}
