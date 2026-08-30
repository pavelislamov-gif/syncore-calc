import { machinePresets } from '@/data/machines'
import { materialCategories } from '@/data/materials'
import { coatings, cutterMaterials, endMillTypes } from '@/data/tools'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Hint } from '@/components/ui/Hint'
import { NumberField } from '@/components/ui/NumberField'
import { Select } from '@/components/ui/Select'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { MillingFormState } from '@/hooks/useMillingForm'
import type { Material } from '@/types/material'
import type { MachineClass } from '@/types/machine'

const hints = {
  fz: 'Расстояние, которое проходит один зуб фрезы за один оборот. Увеличение подачи повышает производительность, но увеличивает нагрузку на инструмент и шпиндель.',
  vc: 'Скорость резания — линейная скорость кромки. Справочный диапазон зависит от материала заготовки и материала фрезы.',
  ap: 'Глубина резания по оси инструмента. На хоббийном станке лучше начинать с меньшей глубины.',
  ae: 'Ширина резания в плане. Для паза ae обычно равна диаметру; для боковой обработки — меньше диаметра.',
  rpm: 'Максимальные обороты шпинделя. Если расчёт выше, система ограничит n и пересчитает фактическую Vc.',
  feed: 'Максимальная минутная подача по осям станка.',
  power: 'Паспортная мощность шпинделя. Оценка нагрузки сравнивается с этим значением.',
  depth: 'Максимальная глубина, которую вы готовы доверить этому станку за один проход.',
  collet: 'Максимальный диаметр хвостовика/цанги. Фреза большего диаметра будет отмечена как ошибка.',
}

interface Props {
  state: MillingFormState
  setState: (updater: (current: MillingFormState) => MillingFormState) => void
  materials: Material[]
  advanced: boolean
  setAdvanced: (value: boolean) => void
  onCalculate: () => void
  error: string | null
  compact?: boolean
}

export function MillingForm({
  state,
  setState,
  materials,
  advanced,
  setAdvanced,
  onCalculate,
  error,
  compact,
}: Props) {
  function patch(partial: Partial<MillingFormState>) {
    setState((current) => ({ ...current, ...partial }))
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onCalculate()
      }}
    >
      <Card>
        <p className="text-sm font-medium text-muted">Станок</p>
        <div className="mt-3">
          <SegmentedControl
            ariaLabel="Класс станка"
            value={state.machineClass}
            options={[
              { value: 'hobby', label: 'Хоббийный' },
              { value: 'industrial', label: 'Промышленный' },
            ]}
            onChange={(machineClass: MachineClass) => {
              const preset = machinePresets.find((item) => item.class === machineClass)
              if (!preset) return
              setState((current) => ({
                ...current,
                machineClass,
                presetId: preset.id,
                maxRpm: String(preset.maxRpm),
                maxFeed: String(preset.maxFeedMmMin),
                powerKw: String(preset.spindlePowerKw),
                maxDepth: String(preset.maxDepthMm),
                collet: String(preset.colletDiameterMm),
              }))
            }}
          />
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Профиль станка</span>
          <Select
            value={state.presetId}
            onChange={(event) => {
              const preset = machinePresets.find((item) => item.id === event.target.value)
              if (!preset) return
              setState((current) => ({
                ...current,
                presetId: preset.id,
                machineClass: preset.class,
                maxRpm: String(preset.maxRpm),
                maxFeed: String(preset.maxFeedMmMin),
                powerKw: String(preset.spindlePowerKw),
                maxDepth: String(preset.maxDepthMm),
                collet: String(preset.colletDiameterMm),
              }))
            }}
          >
            {machinePresets
              .filter((item) => item.class === state.machineClass)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </Select>
        </label>
      </Card>

      <Card>
        <p className="text-sm font-medium text-muted">Материал</p>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Заготовка</span>
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
      </Card>

      <Card>
        <p className="text-sm font-medium text-muted">Фреза</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <NumberField
            id="diameter"
            label="Диаметр"
            unit="мм"
            value={state.diameter}
            min={0.1}
            max={100}
            onChange={(diameter) => patch({ diameter })}
          />
          <NumberField
            id="flutes"
            label="Количество зубьев"
            value={state.flutes}
            min={1}
            max={12}
            step="1"
            onChange={(flutes) => patch({ flutes })}
          />
        </div>
        {compact ? null : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Тип</span>
              <Select value={state.millType} onChange={(event) => patch({ millType: event.target.value as MillingFormState['millType'] })}>
                {endMillTypes.map((item) => (
                  <option key={item.id} value={item.type}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Материал фрезы</span>
              <Select
                value={state.cutterMaterial}
                onChange={(event) => patch({ cutterMaterial: event.target.value as MillingFormState['cutterMaterial'] })}
              >
                {cutterMaterials.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Покрытие</span>
              <Select value={state.coating} onChange={(event) => patch({ coating: event.target.value as MillingFormState['coating'] })}>
                {coatings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        )}
      </Card>

      {compact ? null : (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">Параметры резания</p>
            <SegmentedControl
              ariaLabel="Режим параметров"
              value={state.paramMode}
              options={[
                { value: 'auto', label: 'Автоматически' },
                { value: 'manual', label: 'Вручную' },
              ]}
              onChange={(paramMode) => patch({ paramMode })}
            />
          </div>
          {state.paramMode === 'manual' || state.expert ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <NumberField id="vc" label="Vc" unit="м/мин" hint={hints.vc} value={state.vc} onChange={(vc) => patch({ vc })} />
              <NumberField id="fz" label="fz" unit="мм/зуб" hint={hints.fz} hintTitle="Подача на зуб" value={state.fz} onChange={(fz) => patch({ fz })} />
              <NumberField id="ap" label="ap" unit="мм" hint={hints.ap} value={state.ap} onChange={(ap) => patch({ ap })} />
              <NumberField id="ae" label="ae" unit="мм" hint={hints.ae} value={state.ae} onChange={(ae) => patch({ ae })} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Система подберёт справочные Vc, fz, ap и ae внутри диапазона материала и инструмента.
            </p>
          )}
        </Card>
      )}

      {compact ? null : (
        <Card>
          <button type="button" className="text-sm font-semibold text-accent-2" onClick={() => setAdvanced(!advanced)}>
            {advanced ? 'Скрыть расширенные параметры' : 'Расширенные параметры'}
          </button>
          {advanced ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <NumberField id="maxRpm" label="Макс. обороты" unit="об/мин" hint={hints.rpm} value={state.maxRpm} onChange={(maxRpm) => patch({ maxRpm })} />
              <NumberField id="maxFeed" label="Макс. подача" unit="мм/мин" hint={hints.feed} value={state.maxFeed} onChange={(maxFeed) => patch({ maxFeed })} />
              <NumberField id="power" label="Мощность шпинделя" unit="кВт" hint={hints.power} value={state.powerKw} onChange={(powerKw) => patch({ powerKw })} />
              <NumberField id="maxDepth" label="Макс. глубина" unit="мм" hint={hints.depth} value={state.maxDepth} onChange={(maxDepth) => patch({ maxDepth })} />
              <NumberField id="collet" label="Диаметр цанги" unit="мм" hint={hints.collet} value={state.collet} onChange={(collet) => patch({ collet })} />
              <label className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  checked={state.expert}
                  onChange={(event) => patch({ expert: event.target.checked })}
                  className="h-5 w-5 accent-accent"
                />
                <span className="text-sm">
                  Экспертный режим
                  <Hint title="Экспертный режим" text="Показывает Vc, fz, ap, ae, оценку мощности и ограничения станка даже в автоматическом подборе." />
                </span>
              </label>
            </div>
          ) : null}
        </Card>
      )}

      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}

      <Button type="submit" variant="graphite" fullWidth>
        Рассчитать
      </Button>
    </form>
  )
}
