import { cn } from '@/utils/cn'

export function BrandWordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="flex min-w-0 items-center gap-3 overflow-visible">
      <img
        src="/logo.png"
        alt="SYNCORE"
        className={cn(
          'w-auto max-w-[min(15rem,52vw)] shrink-0 object-contain object-left',
          size === 'lg' ? 'h-12 sm:h-14' : 'h-9 sm:h-10',
        )}
      />
      <span
        className={cn(
          'shrink-0 font-extrabold leading-none tracking-tight text-white',
          size === 'lg' ? 'text-[1.7rem] sm:text-[1.95rem]' : 'text-[1.15rem] sm:text-[1.25rem]',
        )}
      >
        Calc
      </span>
    </span>
  )
}
