import type { FavoriteCombination, SavedCalculation } from '@/types/history'

const HISTORY_KEY = 'syncore.calc.history'
const FAVORITES_KEY = 'syncore.calc.favorites'
const LEGACY_HISTORY_KEY = 'techcalc.history'
const LEGACY_FAVORITES_KEY = 'techcalc.favorites'

function readJson<T>(key: string, fallback: T, legacyKey?: string): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key) ?? (legacyKey ? localStorage.getItem(legacyKey) : null)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function listHistory(): SavedCalculation[] {
  return readJson<SavedCalculation[]>(HISTORY_KEY, [], LEGACY_HISTORY_KEY)
}

export function saveHistoryItem(item: SavedCalculation) {
  const next = [item, ...listHistory().filter((entry) => entry.id !== item.id)].slice(0, 50)
  writeJson(HISTORY_KEY, next)
}

export function removeHistoryItem(id: string) {
  writeJson(
    HISTORY_KEY,
    listHistory().filter((item) => item.id !== id),
  )
}

export function listFavorites(): FavoriteCombination[] {
  return readJson<FavoriteCombination[]>(FAVORITES_KEY, [], LEGACY_FAVORITES_KEY)
}

export function saveFavorite(item: FavoriteCombination) {
  const next = [item, ...listFavorites().filter((entry) => entry.id !== item.id)].slice(0, 50)
  writeJson(FAVORITES_KEY, next)
}

export function removeFavorite(id: string) {
  writeJson(
    FAVORITES_KEY,
    listFavorites().filter((item) => item.id !== id),
  )
}
