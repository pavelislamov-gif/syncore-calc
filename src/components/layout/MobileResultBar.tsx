interface Item {
  code: string
  value: string
  unit: string
}

export function MobileResultBar({ items }: { items: Item[] }) {
  if (items.length === 0) return null
  return (
    <div className="sticky top-[3.6rem] z-20 -mx-4 mb-4 border-b border-white/10 bg-graphite px-3 py-2 text-white md:-mx-6 lg:hidden">
      <div className="flex gap-3 overflow-x-auto">
        {items.map((item) => (
          <div key={item.code} className="min-w-0 shrink-0">
            <p className="text-[10px] font-bold tracking-[0.16em] text-accent">{item.code}</p>
            <p className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums">
              {item.value} <span className="text-xs font-normal text-white/70">{item.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
