import { coatings, cutterMaterials, endMillTypes } from '@/data/tools'
import { inserts } from '@/data/inserts'
import { Card } from '@/components/ui/Card'

export function ToolsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Инструмент</h1>
      <p className="mt-2 text-ink-soft">
        Типы фрез, покрытия и токарные пластины. Коэффициенты и типоразмеры — справочные, не замена каталога
        производителя.
      </p>
      <div className="mt-6 grid gap-4">
        <Card>
          <h2 className="font-bold">Типы фрез</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {endMillTypes.map((item) => (
              <li key={item.id} className="text-sm text-ink-soft">
                {item.name}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold">Материал фрезы</h2>
          <p className="mt-2 text-sm text-ink-soft">{cutterMaterials.map((item) => item.name).join(' · ')}</p>
        </Card>
        <Card>
          <h2 className="font-bold">Покрытия</h2>
          <ul className="mt-3 space-y-3">
            {coatings.map((item) => (
              <li key={item.id}>
                <p className="font-medium">
                  {item.name} · ×{item.vcMultiplier}
                </p>
                <p className="text-sm text-ink-soft">{item.notes}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold">Токарные пластины</h2>
          <ul className="mt-3 space-y-2">
            {inserts.map((item) => (
              <li key={item.id} className="text-sm text-ink-soft">
                <span className="font-medium text-ink">{item.iso}</span> · re {item.noseRadiusMm} мм · {item.notes}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
