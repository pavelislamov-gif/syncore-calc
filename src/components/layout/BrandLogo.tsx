import { cn } from '@/utils/cn'

export function BrandWordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="flex min-w-0 items-end gap-2.5 overflow-visible">
      <img
        src="/logo.png"
        alt="SYNCORE"
        className={cn(
          'w-auto max-w-[min(16rem,58vw)] shrink-0 object-contain object-left',
          size === 'lg' ? 'h-14 sm:h-16' : 'h-10 sm:h-11',
        )}
      />
      <span
        className={cn(
          'mb-[0.42em] shrink-0 font-normal not-italic leading-none tracking-normal text-white [font-synthesis:none]',
          size === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-[0.95rem]',
        )}
      >
        Calc
      </span>
    </span>
  )
}
