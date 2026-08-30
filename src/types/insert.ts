export type InsertDuty = 'roughing' | 'finishing' | 'general' | 'grooving' | 'threading'

export type InsertCategory = 'negative' | 'positive' | 'groove' | 'fillet' | 'thread_ext' | 'thread_int'

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
  category: InsertCategory
  geometry: string
  polished: boolean
}
