import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * GitHub Pages has no SPA rewrite. Soft-404 via 404.html keeps the app usable on refresh,
 * but Google sees HTTP 404. Directory indexes return 200; GH may 301 `/path` → `/path/`,
 * so sitemap/canonical use trailing slashes.
 *
 * Route metadata is duplicated from src/data/seo.ts (keep in sync).
 */
const SITE = 'https://syncore54.ru'

const pages = [
  {
    path: '/',
    title: 'SYNCORE calc — инженерные расчёты для производства',
    description:
      'Режимы резания для фрезерования на ЧПУ: обороты, подача, Vc, fz, глубина и ширина резания. Справочные значения и проверка ограничений станка.',
  },
  {
    path: '/milling',
    title: 'Фрезерование — SYNCORE calc',
    description:
      'Калькулятор режимов фрезерования: обороты, подача XY, врезание по Z, Vc и fz по материалу и фрезе.',
  },
  {
    path: '/turning',
    title: 'Токарная обработка — SYNCORE calc',
    description: 'Режимы точения, канавки и отрезки: скорость резания, подача и обороты по материалу и пластине.',
  },
  {
    path: '/laser',
    title: 'Лазерная резка — SYNCORE calc',
    description: 'Режимы лазерной резки: скорость, газ, фокус, пробивка и настройки слоя для CO₂ и fiber.',
  },
  {
    path: '/threading',
    title: 'Метрическая резьба — SYNCORE calc',
    description: 'Расчёт метрической резьбы на токарном станке: шаг, обороты и подача.',
  },
  {
    path: '/materials',
    title: 'Материалы — SYNCORE calc',
    description: 'Справочник материалов для расчёта режимов резания на ЧПУ.',
  },
  {
    path: '/tools',
    title: 'Инструмент — SYNCORE calc',
    description: 'Справочник инструмента для фрезерования и токарной обработки.',
  },
  {
    path: '/history',
    title: 'История — SYNCORE calc',
    description: 'Сохранённые расчёты режимов на этом устройстве.',
  },
  {
    path: '/favorites',
    title: 'Избранное — SYNCORE calc',
    description: 'Избранные настройки калькуляторов на этом устройстве.',
  },
  {
    path: '/pro',
    title: 'PRO — SYNCORE calc',
    description: 'SYNCORE calc доступен бесплатно, без регистрации и оплаты.',
  },
  {
    path: '/usage',
    title: 'Посещаемость — SYNCORE calc',
    description: 'Служебная статистика посещаемости SYNCORE calc.',
    robots: 'noindex,nofollow',
  },
]

function canonicalFor(pagePath) {
  if (pagePath === '/') return `${SITE}/`
  return `${SITE}${pagePath}/`
}

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function replaceMetaByName(html, name, content) {
  const across = new RegExp(`(<meta\\b[^>]*name="${name}"[^>]*?content=")([^"]*)(")`, 'is')
  if (across.test(html)) return html.replace(across, `$1${content}$3`)
  return html
}

function replaceMetaByProperty(html, property, content) {
  const across = new RegExp(
    `(<meta\\b[^>]*property="${property}"[^>]*?content=")([^"]*)(")`,
    'is',
  )
  if (across.test(html)) return html.replace(across, `$1${content}$3`)
  return html
}

function applySeo(html, page) {
  const url = canonicalFor(page.path)
  const title = escapeAttr(page.title)
  const description = escapeAttr(page.description)
  const robots = escapeAttr(page.robots ?? 'index,follow')

  let next = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  next = next.replace(/(<link\b[^>]*rel="canonical"[^>]*href=")([^"]*)(")/i, `$1${url}$3`)
  next = replaceMetaByName(next, 'description', description)
  next = replaceMetaByName(next, 'robots', robots)
  next = replaceMetaByProperty(next, 'og:title', title)
  next = replaceMetaByProperty(next, 'og:description', description)
  next = replaceMetaByProperty(next, 'og:url', url)
  return next
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const indexPath = path.join(dist, 'index.html')
const raw = readFileSync(indexPath, 'utf8')

copyFileSync(indexPath, path.join(dist, '404.html'))

for (const page of pages) {
  const html = applySeo(raw, page)
  if (page.path === '/') {
    writeFileSync(indexPath, html)
    continue
  }
  const dir = path.join(dist, page.path.slice(1))
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'index.html'), html)
}

console.log(`GitHub Pages SPA: wrote 404.html and ${pages.length - 1} route indexes`)
