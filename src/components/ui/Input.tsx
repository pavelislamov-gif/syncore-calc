import { cn } from '@/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ className, invalid, disabled, ...props }: Props) {
  return (
    <input
      disabled={disabled}
      className={cn(
        'min-h-12 w-full rounded-xl border bg-card px-3.5 text-[16px] text-ink shadow-none transition-colors',
        invalid ? 'border-danger' : 'border-line focus:border-accent',
        disabled ? 'cursor-not-allowed bg-paper-2 text-ink-soft' : null,
        className,
      )}
      {...props}
    />
  )
}
