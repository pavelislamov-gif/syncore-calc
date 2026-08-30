import { cn } from '@/utils/cn'

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="SYNCORE"
      className={cn('h-10 w-auto max-w-[min(14rem,58vw)] object-contain object-left', className)}
    />
  )
}

export function BrandWordmark({
  markClassName,
  captionClassName,
}: {
  markClassName?: string
  captionClassName?: string
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <BrandMark className={markClassName} />
      <span
        className={cn(
          'shrink-0 font-extrabold leading-none tracking-tight text-white',
          captionClassName ?? 'text-[1.35rem]',
        )}
      >
        Calc
      </span>
    </span>
  )
}
