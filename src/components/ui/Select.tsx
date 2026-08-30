import { cn } from '@/utils/cn'
import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ className, invalid, children, ...props }: Props) {
  return (
    <select
      className={cn(
        'min-h-12 w-full appearance-none rounded-xl border bg-card px-3.5 text-[16px] text-ink',
        invalid ? 'border-danger' : 'border-line focus:border-accent',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
