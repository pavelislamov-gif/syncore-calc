import { MillingForm } from '@/components/milling/MillingForm'
import { MillingResultView } from '@/components/milling/MillingResultView'
import { useMillingForm } from '@/hooks/useMillingForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { formatRpm, newId } from '@/utils/format'
import { scrollToMillingResult } from '@/utils/scroll'

export function QuickCalc() {
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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={form.result ? 'order-2 lg:order-1' : undefined}>
        <MillingForm
          compact
          state={form.state}
          setState={form.setState}
          materials={form.materials}
          advanced={false}
          setAdvanced={form.setAdvanced}
          onCalculate={() => {
            if (form.calculate()) scrollToMillingResult()
          }}
          error={form.error}
        />
      </div>
      {form.result && material ? (
        <div className="order-1 lg:order-2">
          <MillingResultView
            result={form.result}
            material={material}
            onSaveHistory={persistHistory}
            onSaveFavorite={persistFavorite}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          Результат появится здесь сразу после расчёта.
        </div>
      )}
    </div>
  )
}
