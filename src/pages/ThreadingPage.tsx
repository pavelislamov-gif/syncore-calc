import { ThreadingForm } from '@/components/threading/ThreadingForm'
import { ThreadingResultView } from '@/components/threading/ThreadingResultView'
import { useThreadingForm } from '@/hooks/useThreadingForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { formatNumber, formatRpm, newId } from '@/utils/format'
import { scrollToResult } from '@/utils/scroll'

export function ThreadingPage() {
  const form = useThreadingForm()
  const material = form.material

  function persistHistory() {
    if (!form.result || !material) return
    saveHistoryItem({
      id: newId(),
      kind: 'threading',
      title: `${form.result.designation} × ${form.result.pitchMm} · ${material.shortName}`,
      createdAt: new Date().toISOString(),
      summary: `${formatRpm(form.result.rpm)} об/мин · отверстие ${formatNumber(form.result.tapDrillMm, 2)} мм`,
      payload: { state: form.state, result: form.result },
    })
  }

  function persistFavorite() {
    if (!material) return
    saveFavorite({
      id: newId(),
      kind: 'threading',
      title: `${form.state.designation} × ${form.state.pitch} · ${material.shortName}`,
      createdAt: new Date().toISOString(),
      payload: { state: form.state },
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className={form.result ? 'order-2 lg:order-1' : undefined}>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Резьба</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Метрическая резьба</h1>
        <p className="mt-2 text-ink-soft">
          M3–M30, шаг и отверстие под резьбу. Для резца подача за оборот равна шагу. Дюймовая резьба будет позже.
        </p>
        <div className="mt-6">
          <ThreadingForm
            state={form.state}
            setState={form.setState}
            materials={form.materials}
            spec={form.spec}
            threads={form.threads}
            onCalculate={() => {
              if (form.calculate()) scrollToResult('threading-result')
            }}
            error={form.error}
          />
        </div>
      </div>
      <div className={form.result ? 'order-1 lg:order-2' : undefined}>
        {form.result && material ? (
          <ThreadingResultView
            result={form.result}
            material={material}
            onSaveHistory={persistHistory}
            onSaveFavorite={persistFavorite}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-muted">
            Выберите M20 × 2.5 и нажмите «Рассчитать».
          </div>
        )}
      </div>
    </div>
  )
}
