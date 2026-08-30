import { Info } from 'lucide-react'
import { useId, useState } from 'react'

interface Props {
  title: string
  text: string
}

export function Hint({ title, text }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
      >
        <Info className="h-4 w-4" />
        <span className="sr-only">{title}</span>
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-8 z-20 w-64 rounded-xl border border-line bg-card p-3 text-sm leading-5 text-ink-soft shadow-lg"
        >
          <strong className="mb-1 block text-ink">{title}</strong>
          {text}
        </span>
      ) : null}
    </span>
  )
}
