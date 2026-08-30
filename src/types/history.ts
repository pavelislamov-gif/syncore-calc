export interface SavedCalculation {
  id: string
  kind: 'milling' | 'turning' | 'threading' | 'laser'
  title: string
  createdAt: string
  summary: string
  payload: Record<string, unknown>
}

export type FavoriteId = string

export interface FavoriteCombination {
  id: FavoriteId
  title: string
  kind: 'milling' | 'turning' | 'threading' | 'laser'
  createdAt: string
  payload: Record<string, unknown>
}
