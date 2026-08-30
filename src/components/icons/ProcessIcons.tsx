import { cn } from '@/utils/cn'

interface IconProps {
  className?: string
  title?: string
}

function MaskIcon({ src, className, title }: { src: string; className?: string; title: string }) {
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={cn('inline-block shrink-0 bg-current', className)}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

export function MillingProcessIcon({ className, title = 'Фрезерование' }: IconProps) {
  return <MaskIcon src="/icons/milling.png" className={className} title={title} />
}

export function TurningProcessIcon({ className, title = 'Токарная обработка' }: IconProps) {
  return <MaskIcon src="/icons/turning.png" className={className} title={title} />
}

export function LaserProcessIcon({ className, title = 'Лазерная резка' }: IconProps) {
  return <MaskIcon src="/icons/laser.png" className={className} title={title} />
}
