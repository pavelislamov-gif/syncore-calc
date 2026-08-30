import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function ComingSoon({
  title,
  stage,
  description,
}: {
  title: string
  stage: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Badge>{stage}</Badge>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 text-ink-soft">{description}</p>
      <Card className="mt-6">
        <p className="text-sm text-muted">
          Сейчас доступен рабочий модуль фрезерования. Этот раздел появится на следующем этапе — без фиктивных кнопок
          расчёта.
        </p>
      </Card>
    </div>
  )
}
