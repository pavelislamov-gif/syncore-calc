import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { FormulaStep } from '@/types/milling'
import { useState } from 'react'

interface Props {
  why: string
  disclaimer: string
  steps: FormulaStep[]
  onSaveHistory: () => void
  onSaveFavorite: () => void
}

export function ResultFooterBlock({ why, disclaimer, steps, onSaveHistory, onSaveFavorite }: Props) {
  const [showMath, setShowMath] = useState(false)

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold">Почему?</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{why}</p>
        <p className="mt-3 text-xs text-muted">{disclaimer}</p>
      </Card>

      <div>
        <button type="button" className="text-sm font-semibold text-accent-2" onClick={() => setShowMath(!showMath)}>
          {showMath ? 'Скрыть расчёт' : 'Показать расчёт'}
        </button>
        {showMath ? (
          <ol className="mt-3 space-y-3">
            {steps.map((step) => (
              <li key={step.id} className="rounded-xl bg-paper-2 p-3">
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="mt-1 font-mono text-sm">{step.formula}</p>
                <p className="mt-1 text-sm text-ink-soft">{step.substitution}</p>
                <p className="mt-1 text-sm font-medium">{step.result}</p>
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={onSaveHistory} fullWidth>
          Сохранить в историю
        </Button>
        <Button variant="outline" onClick={onSaveFavorite} fullWidth>
          В избранное
        </Button>
      </div>
    </div>
  )
}
