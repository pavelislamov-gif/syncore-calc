export type PlanId = 'free' | 'pro'

export type BillingInterval = 'month' | 'quarter' | 'half_year' | 'year'

export interface PlanFeature {
  id: string
  label: string
  free: boolean
  pro: boolean
}

export interface Entitlements {
  plan: PlanId
  allMaterials: boolean
  industrialMilling: boolean
  turning: boolean
  threading: boolean
  laser: boolean
  history: boolean
  favorites: boolean
  pdfExport: boolean
}
