import { BILLING_INTERVALS, PLAN_FEATURES } from '@/services/entitlements'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export function ProPage() {
  return (
    <div className="max-w-3xl">
      <Badge tone="accent">Архитектура тарифов</Badge>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">FREE / PRO</h1>
      <p className="mt-2 text-ink-soft">
        Платежи на этом этапе не подключены. Эта страница описывает будущие тарифы. Сейчас фрезерование, токарка, резьба и лазер доступны локально, чтобы можно было проверить расчёты.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">FREE</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {PLAN_FEATURES.filter((item) => item.free).map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </Card>
        <Card className="bg-graphite text-white">
          <h2 className="text-lg font-bold">PRO</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {PLAN_FEATURES.filter((item) => item.pro && !item.free).map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </Card>
      </div>
      <h2 className="mt-8 font-bold">Интервалы (без оплаты)</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {BILLING_INTERVALS.map((item) => (
          <span key={item.id} className="rounded-full bg-white px-3 py-2 text-sm ring-1 ring-line">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
