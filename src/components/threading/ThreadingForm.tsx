import { lathePresets } from '@/data/machines/lathes'
import { materialCategories } from '@/data/materials'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Hint } from '@/components/ui/Hint'
import { NumberField } from '@/components/ui/NumberField'
import { Select } from '@/components/ui/Select'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { ThreadingFormState } from '@/hooks/useThreadingForm'
import type { Material } from '@/types/material'
import type { MetricThread } from '@/types/threading'
import { getLathePreset } from '@/data/machines/lathes'

interface Props {
  state: ThreadingFormState
  setState: (updater: (current: ThreadingFormState) => ThreadingFormState) => void
  materials: Material[]
  spec: MetricThread | undefined
  threads: MetricThread[]
  onCalculate: () => void
  error: string | null
}

export function ThreadingForm({ state, setState, materials, spec, threads, onCalculate, error }: Props) {
  function patch(partial: Partial<ThreadingFormState>) {
    setState((current) => ({ ...current, ...partial }))
  }

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
        <p className="text-sm font-medium text-muted">Резьба</p>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Диаметр</span>
          <Select
            value={state.designation}
            onChange={(event) => {
              const next = threads.find((item) => item.designation === event.target.value)
              patch({
                designation: event.target.value,
                pitch: String(next?.coarsePitchMm ?? state.pitch),
                customPitch: false,
              })
            }}
          >
            {threads.map((item) => (
              <option key={item.designation} value={item.designation}>
                {item.designation} × {item.coarsePitchMm}
              </option>
            ))}
          </Select>
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-soft">
            Шаг
            <Hint title="Шаг" text="Для метрической резьбы крупный шаг — основной. Можно задать произвольный шаг. Для резца подача за оборот равна шагу." />
          </span>
          <Select
            value={state.customPitch ? 'custom' : state.pitch}
            onChange={(event) => {
              if (event.target.value === 'custom') {
                patch({ customPitch: true })
                return
              }
              patch({ customPitch: false, pitch: event.target.value })
            }}
          >
            {(spec?.pitchesMm ?? []).map((item) => (
              <option key={item} value={String(item)}>
                {item} мм
              </option>
            ))}
            <option value="custom">Произвольный шаг</option>
          </Select>
        </label>
        {state.customPitch ? (
          <div className="mt-3">
            <NumberField id="pitch" label="Произвольный шаг" unit="мм" value={state.pitch} onChange={(pitch) => patch({ pitch })} />
          </div>
        ) : null}
        <div className="mt-4">
          <SegmentedControl
            ariaLabel="Тип резьбы"
            value={state.internal ? 'internal' : 'external'}
            options={[
              { value: 'internal', label: 'Внутренняя' },
              { value: 'external', label: 'Наружная' },
            ]}
            onChange={(value) => patch({ internal: value === 'internal' })}
          />
        </div>
      </Card>

      <Card>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Материал</span>
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
        <div className="mt-3">
          <NumberField id="tlen" label="Длина резьбы" unit="мм" value={state.length} onChange={(length) => patch({ length })} />
        </div>
      </Card>

      <Card>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Станок</span>
          <Select
            value={state.presetId}
            onChange={(event) => {
              const preset = getLathePreset(event.target.value)
              if (!preset) return
              patch({
                presetId: preset.id,
                maxRpm: String(preset.maxRpm),
                maxFeed: String(preset.maxFeedMmMin),
                powerKw: String(preset.spindlePowerKw),
              })
            }}
          >
            {lathePresets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </label>
      </Card>

      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
      <Button type="submit" variant="graphite" fullWidth>
        Рассчитать
      </Button>
    </form>
  )
}
