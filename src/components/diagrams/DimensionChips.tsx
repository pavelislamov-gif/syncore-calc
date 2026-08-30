interface Props {
  items: { label: string; value: string }[]
}

export function DimensionChips({ items }: Props) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.label} className="rounded-lg bg-paper-2 px-2.5 py-1.5 text-xs">
          <span className="font-semibold text-muted">{item.label}</span>
          <span className="ml-1.5 font-semibold text-ink">{item.value}</span>
        </li>
      ))}
    </ul>
  )
}
