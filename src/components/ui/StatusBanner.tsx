import { cn } from '@/utils/cn'
import type { CheckSeverity } from '@/types/milling'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export function StatusBanner({
  status,
  title,
  children,
}: {
  status: CheckSeverity
  title: string
  children?: string
}) {
  const Icon = status === 'ok' ? CheckCircle2 : status === 'warning' ? AlertTriangle : XCircle
  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border p-4',
        status === 'ok' && 'border-ok/30 bg-ok/8',
        status === 'warning' && 'border-warn/40 bg-warn/10',
        status === 'error' && 'border-danger/30 bg-danger/8',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          status === 'ok' && 'text-ok',
          status === 'warning' && 'text-warn',
          status === 'error' && 'text-danger',
        )}
      />
      <div>
        <p className="font-semibold">{title}</p>
        {children ? <p className="mt-1 text-sm text-ink-soft">{children}</p> : null}
      </div>
    </div>
  )
}
