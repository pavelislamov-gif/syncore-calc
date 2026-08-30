import { listMaterials, materialCategories } from '@/data/materials'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatNumber } from '@/utils/format'

export function MaterialsPage() {
  const materials = listMaterials({ plan: 'pro' })

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Справочник материалов</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Диапазоны Vc и fz — справочные, не паспортные. База расширяется без изменения интерфейса: новые записи
        добавляются в <code className="rounded bg-paper-2 px-1">src/data/materials</code>.
      </p>
      <div className="mt-8 space-y-8">
        {materialCategories.map((category) => {
          const items = materials.filter((item) => item.category === category.id)
          if (items.length === 0) return null
          return (
            <section key={category.id}>
              <h2 className="text-lg font-bold">{category.label}</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <Card key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-muted">{item.subCategory}</p>
                      </div>
                      <Badge tone={item.plan === 'pro' ? 'accent' : 'neutral'}>{item.plan.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-ink-soft">{item.notes}</p>
                    <p className="mt-3 text-sm">
                      Carbide Vc {formatNumber(item.milling.vc.carbide.min, 0)}–{formatNumber(item.milling.vc.carbide.max, 0)}{' '}
                      м/мин
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
