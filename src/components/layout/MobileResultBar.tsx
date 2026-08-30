interface Item {
  code: string
  value: string
  unit: string
}

export function MobileResultBar({ items }: { items: Item[] }) {
  if (items.length === 0) return null
  return (
    <div className="sticky top-[var(--app-header-height)] z-20 -mx-4 mb-4 border-b border-white/10 bg-graphite px-3 pb-2.5 pt-3 text-white md:-mx-6 lg:hidden">
      <div className="flex gap-3">
        {items.map((item) => (
          <div key={item.code} className="min-w-0 shrink-0">
            <p className="text-[10px] font-bold leading-none tracking-[0.16em] text-accent">{item.code}</p>
            <p className="mt-1 whitespace-nowrap font-mono text-sm font-semibold tabular-nums">
              {item.value} <span className="text-xs font-normal text-white/70">{item.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
