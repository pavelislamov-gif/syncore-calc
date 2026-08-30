import { materialCategories } from '@/data/materials'
import { laserSourcePresets } from '@/data/laser/sources'
import { LaserCutDiagram } from '@/components/diagrams/LaserCutDiagram'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { NumberField } from '@/components/ui/NumberField'
import { Select } from '@/components/ui/Select'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { LaserFormState } from '@/hooks/useLaserForm'
import type { Material } from '@/types/material'
import type { AssistGas, LaserResult } from '@/types/laser'
import { cn } from '@/utils/cn'

const hints = {
  thickness: 'Толщина листа. От неё зависят скорость, газ, фокус и минимальная мощность источника.',
  length: 'Суммарная длина контура. Нужна только для оценки времени реза.',
  power: 'Паспортная мощность источника. Таблица построена от 1.5 кВт (волокно) и 100 Вт (CO₂).',
}

interface Props {
  state: LaserFormState
  setState: (updater: (current: LaserFormState) => LaserFormState) => void
  materials: Material[]
  advanced: boolean
  setAdvanced: (value: boolean) => void
  applySource: (id: string) => void
  onCalculate: () => void
  error: string | null
  preview?: LaserResult | null
}

export function LaserForm({
  state,
  setState,
  materials,
  advanced,
  setAdvanced,
  applySource,
  onCalculate,
  error,
  preview,
}: Props) {
  function patch(partial: Partial<LaserFormState>) {
    setState((current) => ({ ...current, ...partial }))
  }

  const thicknessNum = Number(String(state.thickness).replace(',', '.'))

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onCalculate()
      }}
    >
      <Card>
        <p className="text-sm font-medium text-muted">1. Материал</p>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Что режем</span>
          <Select value={state.materialId} onChange={(event) => patch({ materialId: event.target.value })}>
            {materialCategories.map((category) => (
              <optgroup key={category.id} label={category.label}>
                {materials
                  .filter((item) => item.category === category.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <NumberField
            id="lth"
            label="Толщина"
            unit="мм"
            hint={hints.thickness}
            value={state.thickness}
            error={error && /толщин/i.test(error) ? error : undefined}
            onChange={(thickness) => patch({ thickness })}
          />
          <NumberField
            id="llen"
            label="Длина контура"
            unit="мм"
            hint={hints.length}
            value={state.cutLength}
            error={error && /длина/i.test(error) ? error : undefined}
            onChange={(cutLength) => patch({ cutLength })}
          />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-muted">2. Источник и операция</p>
        <p className="mt-3 text-sm font-medium text-ink-soft">Операция</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              { id: 'cut', label: 'Сквозная резка' },
              { id: 'engrave', label: 'Гравировка' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'min-h-11 rounded-xl px-3 text-sm font-semibold ring-1 transition-colors',
                state.operation === item.id
                  ? 'bg-graphite text-white ring-graphite'
                  : 'bg-card text-ink-soft ring-line hover:text-ink',
              )}
              onClick={() => patch({ operation: item.id })}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Источник</span>
          <Select
            value={state.sourceId}
            onChange={(event) => applySource(event.target.value)}
          >
            {laserSourcePresets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </label>
        <div className="mt-3">
          <NumberField
            id="lpw"
            label="Мощность"
            unit="Вт"
            hint={hints.power}
            value={state.powerW}
            error={error && /мощност/i.test(error) ? error : undefined}
            onChange={(powerW) => patch({ powerW })}
          />
        </div>
        {state.operation === 'cut' ? (
          <>
            <p className="mt-4 text-sm font-medium text-ink-soft">Качество кромки</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { id: 'fine', label: 'Чистая' },
                  { id: 'standard', label: 'Обычная' },
                  { id: 'coarse', label: 'Быстрая' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'min-h-11 rounded-xl px-3 text-sm font-semibold ring-1 transition-colors',
                    state.quality === item.id
                      ? 'bg-graphite text-white ring-graphite'
                      : 'bg-card text-ink-soft ring-line hover:text-ink',
                  )}
                  onClick={() => patch({ quality: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
        <div className="mt-4 overflow-hidden rounded-2xl">
          <LaserCutDiagram
            thicknessMm={Number.isFinite(thicknessNum) && thicknessNum > 0 ? thicknessNum : 3}
            focusMm={preview?.focusMm ?? (state.sourceKind === 'fiber' ? -0.8 : 0)}
            nozzleMm={preview?.nozzleMm ?? (thicknessNum > 4 ? 2 : 1.5)}
            sourceKind={state.sourceKind}
            gas={preview?.gas ?? (state.gasMode === 'manual' ? state.gas : 'O2')}
          />
        </div>
      </Card>

      <Card>
        <button type="button" className="text-sm font-semibold text-accent-2" onClick={() => setAdvanced(!advanced)}>
          {advanced ? 'Скрыть станок и ручной ввод' : 'Станок и ручной ввод'}
        </button>
        {advanced ? (
          <div className="mt-4 space-y-3">
            <SegmentedControl
              ariaLabel="Режим параметров"
              value={state.paramMode}
              onChange={(paramMode) => patch({ paramMode })}
              options={[
                { value: 'auto', label: 'Авто' },
                { value: 'manual', label: 'Вручную' },
              ]}
            />
            <SegmentedControl
              ariaLabel="Газ"
              value={state.gasMode}
              onChange={(gasMode) => patch({ gasMode })}
              options={[
                { value: 'auto', label: 'Газ авто' },
                { value: 'manual', label: 'Газ вручную' },
              ]}
            />
            {state.gasMode === 'manual' ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-soft">Помощь газом</span>
                <Select value={state.gas} onChange={(event) => patch({ gas: event.target.value as AssistGas })}>
                  <option value="O2">O₂ · кислород</option>
                  <option value="N2">N₂ · азот</option>
                  <option value="Air">Air · воздух</option>
                </Select>
              </label>
            ) : null}
            {state.paramMode === 'manual' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField id="lspd" label="Скорость" unit="мм/мин" value={state.speed} onChange={(speed) => patch({ speed })} />
                <NumberField id="lpct" label="Мощность слоя" unit="%" value={state.powerPct} onChange={(powerPct) => patch({ powerPct })} />
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" variant="primary" fullWidth>
        Рассчитать
      </Button>
    </form>
  )
}
