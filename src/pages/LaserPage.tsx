import { LaserForm } from '@/components/laser/LaserForm'
import { LaserResultView } from '@/components/laser/LaserResultView'
import { useLaserForm } from '@/hooks/useLaserForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { formatRpm, newId } from '@/utils/format'
import { scrollToResult } from '@/utils/scroll'

export function LaserPage() {
  const form = useLaserForm()
  const material = form.material

  function persistHistory() {
    if (!form.result || !material) return
    saveHistoryItem({
      id: newId(),
      kind: 'laser',
      title: `${material.shortName} · ${form.state.thickness} мм · ${form.state.powerW} Вт`,
      createdAt: new Date().toISOString(),
      summary: `${formatRpm(form.result.speedMmMin)} мм/мин · ${form.result.gas} · ${formatRpm(form.result.powerPct)} %`,
      payload: { state: form.state, result: form.result },
    })
  }

  function persistFavorite() {
    if (!material) return
    saveFavorite({
      id: newId(),
      kind: 'laser',
      title: `${material.shortName} · ${form.state.thickness} мм · ${form.state.sourceKind}`,
      createdAt: new Date().toISOString(),
      payload: { state: form.state },
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Лазерная резка</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Режимы резки</h1>
        <p className="mt-2 text-ink-soft">
          Материал и толщина — скорость, газ, фокус, пробивка и слой для контроллера. Значения справочные.
        </p>
        <div className="mt-6">
          <LaserForm
            state={form.state}
            setState={form.setState}
            materials={form.materials}
            advanced={form.advanced}
            setAdvanced={form.setAdvanced}
            applySource={form.applySource}
            onCalculate={() => {
              if (form.calculate()) scrollToResult('laser-result')
            }}
            error={form.error}
            preview={form.result}
          />
        </div>
      </div>
      <div>
        {form.result && material ? (
          <LaserResultView
            result={form.result}
            material={material}
            onSaveHistory={persistHistory}
            onSaveFavorite={persistFavorite}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-muted">
            Выберите материал и источник — режимы появятся здесь.
          </div>
        )}
      </div>
    </div>
  )
}
