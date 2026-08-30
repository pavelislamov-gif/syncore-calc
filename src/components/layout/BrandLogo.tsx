import { cn } from '@/utils/cn'

export function BrandMark({ className }: { className?: string }) {
  return <img src="/logo.svg" alt="" className={cn('h-9 w-9 shrink-0', className)} />
}

export function BrandWordmark({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-extrabold tracking-tight">
      <BrandMark />
      <span className="leading-none">
        SYNCORE
        {compact ? null : <span className="ml-1.5 font-semibold text-accent-2">calc</span>}
      </span>
    </span>
  )
}
