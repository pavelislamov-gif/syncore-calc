import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Shortage } from "../types";
import { Card, DataTable, StatusBadge, Button } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

interface Delivery {
  id: number;
  component_sku?: string;
  quantity: number;
  expected_date?: string;
  status: string;
  supplier?: string;
}

export function ProcurementPage() {
  const [shortages, setShortages] = useState<Shortage[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const { hasRole } = useAuth();

  const load = async () => {
    setShortages(await api<Shortage[]>("/procurement/shortages"));
    setDeliveries(await api<Delivery[]>("/procurement/deliveries"));
  };

  useEffect(() => {
    load();
  }, []);

  const updateShortage = async (id: number) => {
    const date = prompt("Дата поставки (YYYY-MM-DD):", "2026-09-12");
    await api(`/procurement/shortages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ procurement_status: "expected", expected_date: date }),
    });
    load();
  };

  const receive = async (id: number) => {
    await api(`/procurement/deliveries/${id}/receive`, { method: "POST", body: "{}" });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Снабжение</h1>
      <Card title="Дефициты">
        <DataTable
          headers={["Комплектующая", "Требуется", "Свободно", "Дефицит", "Статус", ""]}
          rows={shortages.map((s) => [
            s.component_sku,
            s.required,
            s.available,
            <StatusBadge status="red">{s.deficit}</StatusBadge>,
            s.procurement_status,
            hasRole("supply", "admin") ? (
              <Button variant="secondary" onClick={() => updateShortage(s.id)}>
                Ожидается
              </Button>
            ) : (
              "—"
            ),
          ])}
        />
      </Card>
      <Card title="Поставки">
        <DataTable
          headers={["Комплектующая", "Кол-во", "Ожидание", "Статус", ""]}
          rows={deliveries.map((d) => [
            d.component_sku,
            d.quantity,
            d.expected_date || "—",
            d.status,
            d.status !== "received" && hasRole("supply", "admin") ? (
              <Button variant="secondary" onClick={() => receive(d.id)}>
                Получено
              </Button>
            ) : (
              "—"
            ),
          ])}
        />
      </Card>
    </div>
  );
}
