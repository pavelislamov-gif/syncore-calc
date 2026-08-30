import { LaserForm } from '@/components/laser/LaserForm'
import { LaserResultView } from '@/components/laser/LaserResultView'
import { ResultFooterBlock } from '@/components/results/ResultFooterBlock'
import { useLaserForm } from '@/hooks/useLaserForm'
import { saveFavorite, saveHistoryItem } from '@/services/storage'
import { MobileResultBar } from '@/components/layout/MobileResultBar'
import { formatRpm, newId } from '@/utils/format'
import { scrollToResult } from '@/utils/scroll'
import { trackCalculate } from '@/services/telemetry/client'

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
    <>
      {form.result ? (
        <MobileResultBar
          items={[
            { code: 'F', value: formatRpm(form.result.speedMmMin), unit: 'мм/мин' },
            { code: 'P', value: formatRpm(form.result.powerPct), unit: '%' },
            { code: 'Газ', value: form.result.gas, unit: '' },
          ]}
        />
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className="order-2 lg:order-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Лазерная резка</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Режимы резки</h1>
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
              if (form.calculate()) {
                trackCalculate('laser')
                scrollToResult('laser-result')
              }
            }}
            error={form.error}
            preview={form.result}
          />
          {form.result && material ? (
            <div className="mt-4">
              <ResultFooterBlock
                why={form.result.why}
                disclaimer={`Справочное значение для ${material.name}. Фактический режим зависит от головы, сопла, чистоты оптики и газа.`}
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
          <LaserResultView result={form.result} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-muted">
            Выберите материал и источник — режимы появятся здесь.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
