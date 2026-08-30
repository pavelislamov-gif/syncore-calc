import { cn } from '@/utils/cn'

/**
 * SYNCORE in public/logo.png (365×160): ink y=47–76, x=214–344.
 * Calc is SVG text in the same viewBox so baseline and cap height match the wordmark.
 */
const LOGO_W = 365
const LOGO_H = 160
const LETTER_BOTTOM = 76
const LETTER_H = 29
/** Optical: system sans cap-height is a bit shorter than the SYNCORE gothic. */
const CAP_RATIO = 0.65
const CALC_SIZE = LETTER_H / CAP_RATIO
const CALC_X = 352
const CALC_BASELINE = LETTER_BOTTOM - 5

export function BrandWordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-visible',
        size === 'lg' ? '[--brand-h:3.75rem] sm:[--brand-h:4.5rem]' : '[--brand-h:2.85rem] sm:[--brand-h:3.15rem]',
      )}
    >
      <img
        src="/logo.png"
        alt=""
        className="h-[var(--brand-h)] w-auto max-w-none object-contain object-left"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
        viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
        preserveAspectRatio="xMinYMin meet"
        style={{
          height: 'var(--brand-h)',
          width: `calc(var(--brand-h) * ${LOGO_W} / ${LOGO_H})`,
        }}
      >
        <text
          x={CALC_X}
          y={CALC_BASELINE}
          fill="#ffffff"
          fontFamily="Segoe UI, Inter, ui-sans-serif, system-ui, sans-serif"
          fontSize={CALC_SIZE}
          fontWeight={400}
          letterSpacing="0.02em"
        >
          Calc
        </text>
      </svg>
      <span className="sr-only">SYNCORE Calc</span>
      <span
        aria-hidden
        className="inline-block h-px"
        style={{ width: 'calc(var(--brand-h) * 0.85)' }}
      />
    </span>
  )
}
