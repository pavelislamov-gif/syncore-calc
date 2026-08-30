import { TurningForm } from '@/components/turning/TurningForm'
import { TurningResultView } from '@/components/turning/TurningResultView'
import { useTurningForm } from '@/hooks/useTurningForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { formatRpm, newId } from '@/utils/format'
import { scrollToResult } from '@/utils/scroll'
import { getTurningOperation } from '@/data/formulas/operations'

export function TurningPage() {
  const form = useTurningForm()
  const material = form.material

  function persistHistory() {
    if (!form.result || !material) return
    const op = getTurningOperation(form.state.operation)
    saveHistoryItem({
      id: newId(),
      kind: 'turning',
      title: `${material.shortName} + ${form.state.insertId} · ${op.label}`,
      createdAt: new Date().toISOString(),
      summary: `${formatRpm(form.result.rpm)} об/мин · ${Math.round(form.result.feedMmMin)} мм/мин`,
      payload: { state: form.state, result: form.result },
    })
  }

  function persistFavorite() {
    if (!material) return
    saveFavorite({
      id: newId(),
      kind: 'turning',
      title: `${material.shortName} + ${form.state.insertId || 'сверло'}`,
      createdAt: new Date().toISOString(),
      payload: { state: form.state },
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className={form.result ? 'order-2 lg:order-1' : undefined}>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Токарная обработка</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Режимы точения</h1>
        <p className="mt-2 text-ink-soft">
          Сначала операция, затем материал, диаметр и пластина. Формулы применятся сами. Значения справочные.
        </p>
        <div className="mt-6">
          <TurningForm
            state={form.state}
            setState={form.setState}
            materials={form.materials}
            advanced={form.advanced}
            setAdvanced={form.setAdvanced}
            applyLathe={form.applyLathe}
            onCalculate={() => {
              if (form.calculate()) scrollToResult('turning-result')
            }}
            error={form.error}
          />
        </div>
      </div>
      <div className={form.result ? 'order-1 lg:order-2' : undefined}>
        {form.result && material ? (
          <TurningResultView
            result={form.result}
            material={material}
            onSaveHistory={persistHistory}
            onSaveFavorite={persistFavorite}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-muted">
            Выберите операцию и нажмите «Рассчитать».
          </div>
        )}
      </div>
    </div>
  )
}
