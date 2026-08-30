import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { BrandWordmark } from '@/components/layout/BrandLogo'
import { LaserProcessIcon, MillingProcessIcon, TurningProcessIcon } from '@/components/icons/ProcessIcons'
import { Button } from '@/components/ui/Button'
import { SITE } from '@/data/site'

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="max-w-3xl">
        <div className="inline-flex items-center rounded-2xl bg-black px-4 py-3">
          <BrandWordmark size="lg" />
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Инженерные расчёты для производства</h1>
        <p className="mt-4 text-base text-ink-soft sm:text-lg">
          Бесплатно, без регистрации. Три направления: фрезерование, токарка и лазерная резка. Резьба — внутри токарки.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link to="/milling">
            <Button variant="graphite" fullWidth>
              <MillingProcessIcon className="h-5 w-5" />
              Фрезерование
            </Button>
          </Link>
          <Link to="/turning">
            <Button variant="outline" fullWidth>
              <TurningProcessIcon className="h-5 w-5" />
              Токарка
            </Button>
          </Link>
          <Link to="/laser">
            <Button variant="outline" fullWidth>
              <LaserProcessIcon className="h-5 w-5" />
              Лазерная резка
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <ModuleCard
          title="Фрезерование"
          description="Материал и фреза — обороты, подача XY и врезание по Z."
          to="/milling"
          action="Открыть калькулятор"
          Icon={MillingProcessIcon}
        />
        <ModuleCard
          title="Токарная обработка"
          description="Точение, канавка, отрезка и метрическая резьба."
          to="/turning"
          action="Открыть калькулятор"
          Icon={TurningProcessIcon}
        />
        <ModuleCard
          title="Лазерная резка"
          description="Скорость, газ, фокус, пробивка и настройки слоя."
          to="/laser"
          action="Открыть калькулятор"
          Icon={LaserProcessIcon}
        />
      </section>

      <section>
        <p className="text-sm font-medium text-muted">В будущем</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Раскрой листа', 'Сверление (отдельный модуль)', 'Конвертер единиц', 'Дюймовая резьба'].map((item) => (
            <span key={item} className="rounded-full bg-white px-3 py-2 text-sm text-ink-soft ring-1 ring-line">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section>
        <Card className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Автор</p>
          <h2 className="mt-2 text-xl font-bold">
            {SITE.author} · {SITE.role}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {SITE.company}, {SITE.city}. Оснастка, ЧПУ и другие продукты — на сайте-портфолио. SYNCORE calc — бесплатный
            калькулятор режимов из этой линейки.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={SITE.portfolioUrl} target="_blank" rel="noreferrer">
              <Button variant="graphite">Портфолио и продукты</Button>
            </a>
            <a href={SITE.telegramUrl} target="_blank" rel="noreferrer">
              <Button variant="outline">Telegram</Button>
            </a>
          </div>
        </Card>
      </section>
    </div>
  )
}

function ModuleCard({
  title,
  description,
  to,
  action,
  Icon,
}: {
  title: string
  description: string
  to: string
  action: string
  Icon: typeof MillingProcessIcon
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-center rounded-xl bg-paper-2 text-ink">
        <Icon className="h-14 w-14" />
      </div>
      <h2 className="mt-4 text-lg font-bold uppercase tracking-wide">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{description}</p>
      <Link to={to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent-2">
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  )
}
