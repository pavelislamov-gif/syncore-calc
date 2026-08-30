import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'graphite' | 'ghost' | 'outline'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

export function Button({ className, variant = 'primary', fullWidth, type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-2',
        variant === 'graphite' && 'bg-graphite text-white hover:bg-ink',
        variant === 'ghost' && 'bg-transparent text-ink hover:bg-paper-2',
        variant === 'outline' && 'border border-line bg-card text-ink hover:border-ink/30',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
