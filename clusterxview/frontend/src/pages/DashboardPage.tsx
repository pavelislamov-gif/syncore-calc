import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { DashboardData } from "../types";
import { Card, StatusBadge, Button } from "../components/ui";

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api<DashboardData>("/dashboard").then(setData).catch(console.error);
  }, []);

  if (!data) return <p>Загрузка...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Производство</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Активные заказы">
          <p className="text-3xl font-bold">{data.active_orders_count}</p>
        </Card>
        <Card>
          <StatusBadge status="green">Готовы: {data.ready_count}</StatusBadge>
        </Card>
        <Card>
          <StatusBadge status="yellow">Требуют внимания: {data.attention_count}</StatusBadge>
        </Card>
        <Card>
          <StatusBadge status="red">Заблокированы: {data.blocked_count}</StatusBadge>
        </Card>
      </div>

      <Card title="Что мешает производству">
        {data.critical_problems.length === 0 ? (
          <p className="text-slate-500">Критических проблем нет</p>
        ) : (
          <ul className="space-y-2">
            {data.critical_problems.map((p, i) => (
              <li key={i} className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm">
                <StatusBadge status="red">{p.title}</StatusBadge>
                {p.order_number && <span className="ml-2">Заказ №{p.order_number}</span>}
                {p.expected_date && <span className="ml-2 text-slate-500">Ожидаем: {p.expected_date}</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Что можно собрать сейчас">
        <ul className="space-y-2">
          {data.assembly_now.map((a) => (
            <li key={a.product_id} className="flex justify-between text-sm">
              <span>{a.product_name}</span>
              <span className="font-semibold">{a.max_buildable} шт.</span>
            </li>
          ))}
        </ul>
        <Link to="/assembly/all" className="mt-4 inline-block">
          <Button variant="secondary">Открыть анализ</Button>
        </Link>
      </Card>
    </div>
  );
}
