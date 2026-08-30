export type EndMillType =
  | 'endmill'
  | 'ball'
  | 'corner_radius'
  | 'slot'
  | 'chamfer'
  | 'drill'
  | 'special'

export type CutterMaterial = 'HSS' | 'Carbide'

export type CoatingId = 'none' | 'TiAlN' | 'AlTiN' | 'DLC' | 'other'

export interface ToolDefinition {
  id: string
  name: string
  type: EndMillType
}

export interface CoatingDefinition {
  id: CoatingId
  name: string
  vcMultiplier: number
  notes: string
}

export interface MillToolInput {
  diameterMm: number
  flutes: number
  type: EndMillType
  cutterMaterial: CutterMaterial
  coating: CoatingId
  fluteLengthMm?: number
  shankDiameterMm?: number
  tipRadiusMm?: number
  includedAngleDeg?: number | null
}
