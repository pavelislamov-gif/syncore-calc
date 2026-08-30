export type InsertDuty = 'roughing' | 'finishing' | 'general' | 'grooving' | 'threading'

export interface InsertDefinition {
  id: string
  iso: string
  shape: string
  sizeCode: string
  inscribedCircleMm: number
  thicknessMm: number
  noseRadiusMm: number
  duty: InsertDuty
  grade: string
  coating: string
  notes: string
  groups: string[]
}
