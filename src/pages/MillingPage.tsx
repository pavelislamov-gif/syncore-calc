import { MillingForm } from '@/components/milling/MillingForm'
import { MillingResultView } from '@/components/milling/MillingResultView'
import { useMillingForm } from '@/hooks/useMillingForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { formatRpm, newId } from '@/utils/format'
import { scrollToMillingResult } from '@/utils/scroll'

export function MillingPage() {
  const form = useMillingForm()
  const material = form.material

  function persistHistory() {
    if (!form.result || !material) return
    saveHistoryItem({
      id: newId(),
      kind: 'milling',
      title: `${material.shortName} / Ø${form.state.diameter} / ${form.state.flutes}Z`,
      createdAt: new Date().toISOString(),
      summary: `${formatRpm(form.result.rpm)} об/мин · ${formatRpm(form.result.feedMmMin)} мм/мин`,
      payload: { state: form.state, result: form.result },
    })
  }

  function persistFavorite() {
    if (!material) return
    saveFavorite({
      id: newId(),
      kind: 'milling',
      title: `${material.shortName} + Ø${form.state.diameter} ${form.state.flutes}Z`,
      createdAt: new Date().toISOString(),
      payload: { state: form.state },
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className={form.result ? 'order-2 lg:order-1' : undefined}>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Фрезерование</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Режимы резания</h1>
        <p className="mt-2 text-ink-soft">
          Выберите материал, фрезу и станок. Формулы применятся автоматически. Значения — справочные диапазоны.
        </p>
        <div className="mt-6">
          <MillingForm
            state={form.state}
            setState={form.setState}
            materials={form.materials}
            advanced={form.advanced}
            setAdvanced={form.setAdvanced}
            onCalculate={() => {
              if (form.calculate()) scrollToMillingResult()
            }}
            error={form.error}
          />
        </div>
      </div>
      <div className={form.result ? 'order-1 lg:order-2' : undefined}>
        {form.result && material ? (
          <MillingResultView
            result={form.result}
            material={material}
            onSaveHistory={persistHistory}
            onSaveFavorite={persistFavorite}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-muted">
            Нажмите «Рассчитать», чтобы получить обороты, подачу, Vc, fz, ap и ae.
          </div>
        )}
      </div>
    </div>
  )
}
