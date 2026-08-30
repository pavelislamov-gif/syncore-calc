import { cn } from '@/utils/cn'

export function BrandMark({ className }: { className?: string }) {
  return (
    <img src="/logo.png" alt="SYNCORE" className={cn('h-8 w-auto max-w-[12.5rem] object-contain object-left', className)} />
  )
}

export function BrandWordmark() {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <BrandMark />
      <span className="hidden text-[13px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:inline">calc</span>
    </span>
  )
}
