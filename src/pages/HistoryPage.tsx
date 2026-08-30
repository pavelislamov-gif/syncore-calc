import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listHistory, removeHistoryItem } from '@/services/storage'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function HistoryPage() {
  const [items, setItems] = useState(() => listHistory())

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">История</h1>
      <p className="mt-2 text-ink-soft">Сохраняется в этом браузере. Позже история будет привязана к аккаунту.</p>
      {items.length === 0 ? (
        <Card className="mt-6">
          <p>Пока нет сохранённых расчётов.</p>
          <Link to="/milling" className="mt-3 inline-block text-sm font-semibold text-accent-2">
            Открыть фрезерование
          </Link>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted">{new Date(item.createdAt).toLocaleString('ru-RU')}</p>
                  <p className="mt-1 text-sm">{item.summary}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    removeHistoryItem(item.id)
                    setItems(listHistory())
                  }}
                >
                  Удалить
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
