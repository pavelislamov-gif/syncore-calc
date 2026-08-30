import { cn } from '@/utils/cn'

export function BrandWordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <img
        src="/mark.png"
        alt=""
        className={cn('shrink-0 object-contain', size === 'lg' ? 'h-14 sm:h-16' : 'h-10')}
      />
      <span
        className={cn(
          'flex items-baseline gap-1.5 font-extrabold leading-none tracking-tight',
          size === 'lg' ? 'text-[1.7rem] sm:text-[1.95rem]' : 'text-[1.2rem]',
        )}
      >
        <span className="whitespace-nowrap">
          <span className="text-white">SYN</span>
          <span className="text-accent">CORE</span>
        </span>
        <span className="whitespace-nowrap text-white">Calc</span>
      </span>
    </span>
  )
}
