import { MillingForm } from '@/components/milling/MillingForm'
import { MillingResultView } from '@/components/milling/MillingResultView'
import { useMillingForm } from '@/hooks/useMillingForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { MobileResultBar } from '@/components/layout/MobileResultBar'
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
      summary: `${formatRpm(form.result.rpm)} об/мин · F ${formatRpm(form.result.feedMmMin)} · Fz ${formatRpm(form.result.plungeMmMin)} мм/мин`,
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
    <>
      {form.result ? (
        <MobileResultBar
          items={[
            { code: 'S', value: formatRpm(form.result.rpm), unit: 'об/мин' },
            { code: 'F', value: formatRpm(form.result.feedMmMin), unit: 'мм/мин' },
            { code: 'Fz', value: formatRpm(form.result.plungeMmMin), unit: 'Z' },
          ]}
        />
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className="order-2 lg:order-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Фрезерование</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Режимы резания</h1>
        <p className="mt-2 text-ink-soft">Материал, затем фреза — справа сразу итог. Станок по умолчанию хоббийный.</p>
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
      <div className="order-1 lg:order-2">
        {form.result && material ? (
          <MillingResultView
            result={form.result}
            material={material}
            onSaveHistory={persistHistory}
            onSaveFavorite={persistFavorite}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-muted">
            Выберите материал и фрезу — режимы появятся здесь.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
