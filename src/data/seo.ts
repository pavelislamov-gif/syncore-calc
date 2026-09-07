import { SITE } from '@/data/site'

export type SeoPage = {
  /** Path without trailing slash; home is `/`. */
  path: string
  title: string
  description: string
  /** Include in public/sitemap.xml */
  sitemap?: boolean
  robots?: string
}

export const SEO_PAGES: SeoPage[] = [
  {
    path: '/',
    title: `${SITE.name} — инженерные расчёты для производства`,
    description:
      'Режимы резания для фрезерования на ЧПУ: обороты, подача, Vc, fz, глубина и ширина резания. Справочные значения и проверка ограничений станка.',
    sitemap: true,
  },
  {
    path: '/milling',
    title: `Фрезерование — ${SITE.name}`,
    description:
      'Калькулятор режимов фрезерования: обороты, подача XY, врезание по Z, Vc и fz по материалу и фрезе.',
    sitemap: true,
  },
  {
    path: '/turning',
    title: `Токарная обработка — ${SITE.name}`,
    description: 'Режимы точения, канавки и отрезки: скорость резания, подача и обороты по материалу и пластине.',
    sitemap: true,
  },
  {
    path: '/laser',
    title: `Лазерная резка — ${SITE.name}`,
    description: 'Режимы лазерной резки: скорость, газ, фокус, пробивка и настройки слоя для CO₂ и fiber.',
    sitemap: true,
  },
  {
    path: '/threading',
    title: `Метрическая резьба — ${SITE.name}`,
    description: 'Расчёт метрической резьбы на токарном станке: шаг, обороты и подача.',
    sitemap: true,
  },
  {
    path: '/materials',
    title: `Материалы — ${SITE.name}`,
    description: 'Справочник материалов для расчёта режимов резания на ЧПУ.',
    sitemap: true,
  },
  {
    path: '/tools',
    title: `Инструмент — ${SITE.name}`,
    description: 'Справочник инструмента для фрезерования и токарной обработки.',
    sitemap: true,
  },
  {
    path: '/history',
    title: `История — ${SITE.name}`,
    description: 'Сохранённые расчёты режимов на этом устройстве.',
  },
  {
    path: '/favorites',
    title: `Избранное — ${SITE.name}`,
    description: 'Избранные настройки калькуляторов на этом устройстве.',
  },
  {
    path: '/pro',
    title: `PRO — ${SITE.name}`,
    description: 'SYNCORE calc доступен бесплатно, без регистрации и оплаты.',
  },
  {
    path: '/usage',
    title: `Посещаемость — ${SITE.name}`,
    description: 'Служебная статистика посещаемости SYNCORE calc.',
    robots: 'noindex,nofollow',
  },
]

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/'
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed || '/'
}

/** Canonical URL for Google: trailing slash on section pages (GitHub Pages directory indexes). */
export function canonicalUrl(path: string): string {
  const normalized = normalizePath(path)
  if (normalized === '/') return `${SITE.publicUrl}/`
  return `${SITE.publicUrl}${normalized}/`
}

export function seoForPath(pathname: string): SeoPage {
  const path = normalizePath(pathname)
  return (
    SEO_PAGES.find((page) => page.path === path) ?? {
      path,
      title: SITE.name,
      description: 'Инженерные расчёты для производства.',
      robots: 'noindex,follow',
    }
  )
}

/** React Router path variants so `/milling` and `/milling/` both match after GitHub Pages redirects. */
export function routePathVariants(path: string): string[] {
  const normalized = normalizePath(path)
  if (normalized === '/') return ['/']
  return [normalized, `${normalized}/`]
}
