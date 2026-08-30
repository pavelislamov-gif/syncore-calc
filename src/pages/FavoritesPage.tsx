import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listFavorites, removeFavorite } from '@/services/storage'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function FavoritesPage() {
  const [items, setItems] = useState(() => listFavorites())

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Избранное</h1>
      <p className="mt-2 text-ink-soft">Частые комбинации материала и инструмента. Локально в браузере.</p>
      {items.length === 0 ? (
        <Card className="mt-6">
          <p>Список пуст. Сохраните комбинацию со страницы расчёта.</p>
          <Link to="/milling" className="mt-3 inline-block text-sm font-semibold text-accent-2">
            К калькулятору
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
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    removeFavorite(item.id)
                    setItems(listFavorites())
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
