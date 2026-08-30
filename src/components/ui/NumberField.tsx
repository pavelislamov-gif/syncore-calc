import { Hint } from './Hint'
import { Input } from './Input'

interface Props {
  id: string
  label: string
  hintTitle?: string
  hint?: string
  unit?: string
  value: string
  onChange: (value: string) => void
  error?: string
  min?: number
  max?: number
  step?: string
  disabled?: boolean
}

export function NumberField({ id, label, hint, hintTitle, unit, value, onChange, error, min, max, step = 'any', disabled }: Props) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-soft">
        {label}
        {hint ? <Hint title={hintTitle ?? label} text={hint} /> : null}
      </span>
      <span className="relative block">
        <Input
          id={id}
          inputMode="decimal"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          invalid={Boolean(error)}
          className={unit ? 'pr-14' : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {unit ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{unit}</span> : null}
      </span>
      {error ? <span className="mt-1 block text-sm text-danger">{error}</span> : null}
    </label>
  )
}
