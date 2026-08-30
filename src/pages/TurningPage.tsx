import { TurningForm } from '@/components/turning/TurningForm'
import { TurningResultView } from '@/components/turning/TurningResultView'
import { ResultFooterBlock } from '@/components/results/ResultFooterBlock'
import { useTurningForm } from '@/hooks/useTurningForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { MobileResultBar } from '@/components/layout/MobileResultBar'
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
      summary: `${formatRpm(form.result.rpm)} об/мин · ${formatRpm(form.result.feedMmMin)} мм/мин`,
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
    <>
      {form.result ? (
        <MobileResultBar
          items={[
            { code: 'S', value: formatRpm(form.result.rpm), unit: 'об/мин' },
            { code: 'F', value: formatRpm(form.result.feedMmMin), unit: 'мм/мин' },
          ]}
        />
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className="order-2 lg:order-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Токарная обработка</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Режимы точения</h1>
        <p className="mt-2 text-ink-soft">
          Материал, затем резец — режимы точения. Нарезание резьбы — отдельная операция в блоке инструмента.
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
          {form.result && material ? (
            <div className="mt-4">
              <ResultFooterBlock
                why={form.result.why}
                disclaimer={`Справочное значение для ${material.name}. Фактический режим зависит от сплава пластины, СОЖ и жёсткости.`}
                steps={form.result.steps}
                onSaveHistory={persistHistory}
                onSaveFavorite={persistFavorite}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="order-1 lg:order-2">
        {form.result && material ? (
          <TurningResultView result={form.result} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-muted">
            Выберите материал и инструмент — режимы появятся здесь.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
