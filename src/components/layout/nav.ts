export const primaryNav = [
  { to: '/milling', label: 'Фреза' },
  { to: '/turning', label: 'Токарка' },
  { to: '/laser', label: 'Лазер' },
  { to: '/threading', label: 'Резьба' },
] as const

export const headerLinks = [
  { to: '/', label: 'Главная' },
  { to: '/milling', label: 'Фрезерование' },
  { to: '/turning', label: 'Токарка' },
  { to: '/threading', label: 'Резьба' },
  { to: '/laser', label: 'Лазер' },
  { to: '/materials', label: 'Материалы' },
  { to: '/tools', label: 'Инструмент' },
  { to: '/history', label: 'История' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/pro', label: 'PRO' },
] as const

export const moreLinks = [
  { to: '/', label: 'Главная' },
  { to: '/materials', label: 'Материалы' },
  { to: '/tools', label: 'Инструмент' },
  { to: '/history', label: 'История' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/pro', label: 'PRO' },
] as const

export function isMoreRoute(pathname: string): boolean {
  return moreLinks.some((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)))
}
