import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ScanLine, Scissors, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QuickCalc } from '@/components/home/QuickCalc'

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-2">TechCalc</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Инженерные расчёты для производства</h1>
        <p className="mt-4 text-lg text-ink-soft">
          Режимы резания, фрезерование, токарная обработка и лазерная резка.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/milling">
            <Button variant="graphite">Открыть фрезерование</Button>
          </Link>
          <a href="#quick">
            <Button variant="outline">Быстрый расчёт</Button>
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ModuleCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Фрезерование"
          description="Расчёт режимов фрезерования для хоббийных и промышленных ЧПУ."
          to="/milling"
          action="Открыть калькулятор"
        />
        <ModuleCard
          icon={<Scissors className="h-5 w-5" />}
          title="Токарная обработка"
          description="Расчёт режимов точения, расточки, канавок, отрезки и резьбы."
          to="/turning"
          action="Следующий этап"
        />
        <ModuleCard
          icon={<ScanLine className="h-5 w-5" />}
          title="Лазерная резка"
          description="Расчёт параметров лазерной резки металла и параметры для CypCut."
          to="/laser"
          action="Следующий этап"
        />
      </section>

      <section>
        <p className="text-sm font-medium text-muted">В будущем</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Раскрой материала', 'Резьба', 'Сверление', 'Конвертер единиц', 'Справочник материалов', 'Справочник инструмента'].map(
            (item) => (
              <span key={item} className="rounded-full bg-white px-3 py-2 text-sm text-ink-soft ring-1 ring-line">
                {item}
              </span>
            ),
          )}
        </div>
      </section>

      <section id="quick" className="scroll-mt-24">
        <h2 className="text-2xl font-extrabold tracking-tight">Быстрый расчёт</h2>
        <p className="mt-2 text-ink-soft">Материал, инструмент, диаметр, зубья, станок — и готовый режим.</p>
        <div className="mt-5">
          <QuickCalc />
        </div>
      </section>
    </div>
  )
}

function ModuleCard({
  icon,
  title,
  description,
  to,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  to: string
  action: string
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper-2 text-ink">{icon}</div>
      <h2 className="mt-4 text-lg font-bold uppercase tracking-wide">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{description}</p>
      <Link to={to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent-2">
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  )
}
