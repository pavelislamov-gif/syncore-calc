import { SITE } from '@/data/site'

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted md:px-6">
      <p>SYNCORE calc · бесплатно, без регистрации. Справочные режимы резания.</p>
      <p className="mt-2">
        {SITE.author}, {SITE.role} · {SITE.company}, {SITE.city}
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <a href={SITE.portfolioUrl} className="text-ink underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
          Портфолио и продукты
        </a>
        <a href={SITE.telegramUrl} className="text-ink underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
          Telegram
        </a>
        <a href={`mailto:${SITE.email}`} className="text-ink underline-offset-2 hover:underline">
          {SITE.email}
        </a>
        <a href={`tel:${SITE.phone}`} className="text-ink underline-offset-2 hover:underline">
          {SITE.phoneLabel}
        </a>
      </p>
    </footer>
  )
}
