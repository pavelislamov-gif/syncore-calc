import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Order } from "../types";
import { Card, DataTable, StatusBadge, Button } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

const statusMap: Record<string, { label: string; color: "green" | "yellow" | "red" | "blue" }> = {
  new: { label: "Новый", color: "blue" },
  on_review: { label: "На проверке", color: "yellow" },
  has_problems: { label: "Есть проблемы", color: "red" },
  awaiting_resolution: { label: "Ожидает решения", color: "yellow" },
  ready_for_production: { label: "Готов к производству", color: "green" },
  in_production: { label: "В производстве", color: "blue" },
  completed: { label: "Завершён", color: "green" },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { hasRole } = useAuth();

  useEffect(() => {
    api<Order[]>("/orders").then(setOrders);
  }, []);

  const createDemo = async () => {
    const products = await api<{ id: number }[]>("/products");
    if (!products[0]) return;
    await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        number: String(Date.now()).slice(-6),
        product_id: products[0].id,
        quantity: 100,
        customer: "Новый заказчик",
      }),
    });
    setOrders(await api<Order[]>("/orders"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Заказы</h1>
        {hasRole("director", "admin") && <Button onClick={createDemo}>Создать заказ</Button>}
      </div>
      <Card>
        <DataTable
          headers={["№", "Изделие", "Кол-во", "Статус", ""]}
          rows={orders.map((o) => [
            o.number,
            o.product_name || o.product_id,
            `${o.quantity} шт.`,
            <StatusBadge status={statusMap[o.status]?.color || "blue"}>
              {statusMap[o.status]?.label || o.status}
            </StatusBadge>,
            <Link to={`/orders/${o.id}`} className="text-sky-600 hover:underline">
              Открыть
            </Link>,
          ])}
        />
      </Card>
    </div>
  );
}
