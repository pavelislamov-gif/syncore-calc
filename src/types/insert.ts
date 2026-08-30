export type InsertShape = 'CNMG' | 'DNMG' | 'VNMG' | 'WNMG' | 'TNMG' | 'CCMT' | 'DCMT' | 'VBMT'

export type InsertDuty = 'roughing' | 'finishing' | 'general'

export interface InsertDefinition {
  id: string
  iso: string
  shape: InsertShape
  sizeCode: string
  inscribedCircleMm: number
  thicknessMm: number
  noseRadiusMm: number
  duty: InsertDuty
  grade: string
  coating: string
  notes: string
}
