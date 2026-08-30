export const PLAN_FEATURES = [
  { id: 'basic-milling', label: 'Фрезерование', free: true, pro: true },
  { id: 'basic-materials', label: 'Справочник материалов', free: true, pro: true },
  { id: 'industrial', label: 'Промышленный режим фрезерования', free: true, pro: true },
  { id: 'all-materials', label: 'Полная база материалов', free: true, pro: true },
  { id: 'turning', label: 'Токарная обработка', free: true, pro: true },
  { id: 'threading', label: 'Резьба', free: true, pro: true },
  { id: 'laser', label: 'Лазерная резка', free: true, pro: true },
  { id: 'history', label: 'История расчётов', free: true, pro: true },
  { id: 'favorites', label: 'Избранное', free: true, pro: true },
  { id: 'pdf', label: 'Экспорт PDF / CSV', free: false, pro: true },
] as const

export const BILLING_INTERVALS = [
  { id: 'month', label: '1 месяц', months: 1 },
  { id: 'quarter', label: '3 месяца', months: 3 },
  { id: 'half_year', label: '6 месяцев', months: 6 },
  { id: 'year', label: '12 месяцев', months: 12 },
] as const

export function entitlementsFor(plan: 'free' | 'pro') {
  const pro = plan === 'pro'
  return {
    plan,
    allMaterials: pro,
    industrialMilling: pro,
    turning: pro,
    threading: pro,
    laser: pro,
    history: true,
    favorites: true,
    pdfExport: pro,
  }
}

/**
 * Stage 1: milling is fully usable locally, including industrial mode.
 * History/favorites persist in the browser. Payments are not connected.
 */
export const CURRENT_STAGE_PLAN: 'free' | 'pro' = 'pro'
