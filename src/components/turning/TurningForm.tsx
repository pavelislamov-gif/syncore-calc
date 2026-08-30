import { Link } from 'react-router-dom'
import { turningOperations } from '@/data/formulas/operations'
import { inserts } from '@/data/inserts'
import { lathePresets } from '@/data/machines/lathes'
import { materialCategories } from '@/data/materials'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Hint } from '@/components/ui/Hint'
import { NumberField } from '@/components/ui/NumberField'
import { Select } from '@/components/ui/Select'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { TurningFormState } from '@/hooks/useTurningForm'
import type { Material } from '@/types/material'
import { cn } from '@/utils/cn'

const hints = {
  f: 'Подача на оборот — перемещение резца за один оборот шпинделя. Для резьбы резцом подача равна шагу.',
  vc: 'Скорость резания на наружном диаметре. Справочный диапазон зависит от материала и операции.',
  ap: 'Глубина резания за проход. Число проходов считается от припуска.',
  stock: 'Сколько металла нужно снять. Система разобьёт это на проходы по ap.',
}

interface Props {
  state: TurningFormState
  setState: (updater: (current: TurningFormState) => TurningFormState) => void
  materials: Material[]
  advanced: boolean
  setAdvanced: (value: boolean) => void
  applyLathe: (id: string) => void
  onCalculate: () => void
  error: string | null
}

export function TurningForm({
  state,
  setState,
  materials,
  advanced,
  setAdvanced,
  applyLathe,
  onCalculate,
  error,
}: Props) {
  const operation = turningOperations.find((item) => item.id === state.operation)
  function patch(partial: Partial<TurningFormState>) {
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
        <p className="text-sm font-medium text-muted">Операция</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {turningOperations.map((item) => (
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
          <Link
            to="/threading"
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-accent-2 ring-1 ring-line"
          >
            Нарезание резьбы
          </Link>
        </div>
        {operation ? <p className="mt-3 text-sm text-ink-soft">{operation.hint}</p> : null}
      </Card>

      <Card>
        <p className="text-sm font-medium text-muted">Материал и заготовка</p>
        <label className="mt-3 block">
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
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <NumberField
            id="tdia"
            label={state.operation === 'bore' ? 'Диаметр отверстия' : 'Диаметр'}
            unit="мм"
            value={state.diameter}
            error={error && /диаметр/i.test(error) ? error : undefined}
            onChange={(diameter) => patch({ diameter })}
          />
          <NumberField id="tlen" label="Длина прохода" unit="мм" value={state.length} onChange={(length) => patch({ length })} />
          <NumberField
            id="tstock"
            label={operation?.stockLabel ?? 'Припуск'}
            unit="мм"
            hint={hints.stock}
            value={state.stock}
            onChange={(stock) => patch({ stock })}
          />
        </div>
      </Card>

      {state.operation === 'drill' ? null : (
        <Card>
          <p className="mb-3 text-sm font-medium text-muted">Пластина</p>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-soft">
              ISO-обозначение
              <Hint
                title="Пластина"
                text="Тип, размер и радиус при вершине. Подача ограничивается радиусом вершины. Это справочные типоразмеры, не конкретная марка сплава."
              />
            </span>
            <Select value={state.insertId} onChange={(event) => patch({ insertId: event.target.value })}>
              {inserts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.iso} · re {item.noseRadiusMm} мм · {item.duty === 'roughing' ? 'черновая' : item.duty === 'finishing' ? 'чистовая' : 'универсальная'}
                </option>
              ))}
            </Select>
          </label>
        </Card>
      )}

      <Card>
        <p className="text-sm font-medium text-muted">Станок</p>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Профиль</span>
          <Select
            value={state.presetId}
            onChange={(event) => applyLathe(event.target.value)}
          >
            {lathePresets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </label>
        <div className="mt-4">
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
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <NumberField id="tvc" label="Vc" unit="м/мин" hint={hints.vc} value={state.vc} onChange={(vc) => patch({ vc })} />
            <NumberField id="tf" label="f" unit="мм/об" hint={hints.f} value={state.feed} onChange={(feed) => patch({ feed })} />
            <NumberField id="tap" label="ap" unit="мм" hint={hints.ap} value={state.ap} onChange={(ap) => patch({ ap })} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Vc, подача и глубина подберутся по материалу, операции и пластине.</p>
        )}
        <button type="button" className="mt-4 text-sm font-semibold text-accent-2" onClick={() => setAdvanced(!advanced)}>
          {advanced ? 'Скрыть расширенные параметры' : 'Расширенные параметры'}
        </button>
        {advanced ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <NumberField id="trpm" label="Макс. обороты" unit="об/мин" value={state.maxRpm} onChange={(maxRpm) => patch({ maxRpm })} />
            <NumberField id="tfeedmax" label="Макс. подача" unit="мм/мин" value={state.maxFeed} onChange={(maxFeed) => patch({ maxFeed })} />
            <NumberField id="tpwr" label="Мощность" unit="кВт" value={state.powerKw} onChange={(powerKw) => patch({ powerKw })} />
            <NumberField id="tdepth" label="Макс. ap" unit="мм" value={state.maxDepth} onChange={(maxDepth) => patch({ maxDepth })} />
            <NumberField id="tmaxd" label="Макс. диаметр" unit="мм" value={state.maxDia} onChange={(maxDia) => patch({ maxDia })} />
          </div>
        ) : null}
      </Card>

      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
      <Button type="submit" variant="graphite" fullWidth>
        Рассчитать
      </Button>
    </form>
  )
}
