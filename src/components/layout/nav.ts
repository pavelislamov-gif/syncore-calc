export const primaryNav = [
  { to: '/milling', label: 'Фреза' },
  { to: '/turning', label: 'Токарка' },
  { to: '/laser', label: 'Лазер' },
] as const

export const headerLinks = [
  { to: '/', label: 'Главная' },
  { to: '/milling', label: 'Фрезерование' },
  { to: '/turning', label: 'Токарка' },
  { to: '/laser', label: 'Лазер' },
  { to: '/materials', label: 'Материалы' },
  { to: '/tools', label: 'Инструмент' },
  { to: '/history', label: 'История' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/usage', label: 'Посещаемость' },
] as const

export const moreLinks = [
  { to: '/', label: 'Главная' },
  { to: '/materials', label: 'Материалы' },
  { to: '/tools', label: 'Инструмент' },
  { to: '/history', label: 'История' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/usage', label: 'Посещаемость' },
  { to: '/pro', label: 'PRO позже' },
] as const

export function isMoreRoute(pathname: string): boolean {
  return moreLinks.some((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)))
}

export function isTurningSection(pathname: string): boolean {
  return pathname.startsWith('/turning') || pathname.startsWith('/threading')
}
