import { cn } from '@/utils/cn'
import type { HTMLAttributes } from 'react'

type Tone = 'ok' | 'warning' | 'error' | 'neutral' | 'accent'

export function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        tone === 'ok' && 'bg-ok/10 text-ok',
        tone === 'warning' && 'bg-warn/15 text-warn',
        tone === 'error' && 'bg-danger/10 text-danger',
        tone === 'neutral' && 'bg-paper-2 text-muted',
        tone === 'accent' && 'bg-accent/10 text-accent-2',
        className,
      )}
      {...props}
    />
  )
}
