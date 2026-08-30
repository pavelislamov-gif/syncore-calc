import { cn } from '@/utils/cn'
import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(18,21,26,0.04)]', className)} {...props} />
}
