import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="max-w-3xl">
        <div className="inline-flex items-center rounded-2xl bg-black px-4 py-3">
          <img src="/logo.png" alt="SYNCORE" className="h-14 w-auto sm:h-16" />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-accent">SYNCORE calc</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Инженерные расчёты для производства</h1>
        <p className="mt-4 text-base text-ink-soft sm:text-lg">
          Три направления: фрезерование, токарка и лазерная резка. Резьба — внутри токарки.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link to="/milling">
            <Button variant="graphite" fullWidth>
              Фрезерование
            </Button>
          </Link>
          <Link to="/turning">
            <Button variant="outline" fullWidth>
              Токарка
            </Button>
          </Link>
          <Link to="/laser">
            <Button variant="outline" fullWidth>
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
        />
        <ModuleCard
          title="Токарная обработка"
          description="Точение, канавка, отрезка и метрическая резьба."
          to="/turning"
          action="Открыть калькулятор"
        />
        <ModuleCard
          title="Лазерная резка"
          description="Скорость, газ, фокус, пробивка и настройки слоя."
          to="/laser"
          action="Открыть калькулятор"
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
    </div>
  )
}

function ModuleCard({
  title,
  description,
  to,
  action,
}: {
  title: string
  description: string
  to: string
  action: string
}) {
  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{description}</p>
      <Link to={to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent-2">
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  )
}
