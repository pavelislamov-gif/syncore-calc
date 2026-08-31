import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Order, Requirement, Shortage } from "../types";
import { Card, DataTable, StatusBadge, Button } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

interface Readiness {
  readiness_percent: number;
  can_produce: boolean;
  launch_blocked: boolean;
  blocking_reasons: string[];
  checks: { label: string; status: string; message: string; ok: boolean }[];
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const [shortages, setShortages] = useState<Shortage[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const { hasRole } = useAuth();

  const load = async () => {
    const oid = Number(id);
    setOrder(await api<Order>(`/orders/${oid}`));
    setReqs(await api<Requirement[]>(`/orders/${oid}/requirements`));
    setShortages(await api<Shortage[]>(`/orders/${oid}/shortages`));
    setReadiness(await api<Readiness>(`/orders/${oid}/readiness`));
  };

  useEffect(() => {
    load();
  }, [id]);

  const calculate = async () => {
    await api(`/orders/${id}/calculate`, { method: "POST" });
    load();
  };

  const confirmTech = async () => {
    await api(`/technology/orders/${id}/confirm`, { method: "POST", body: "{}" });
    load();
  };

  const setStatus = async (status: string) => {
    try {
      await api(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    }
  };

  if (!order) return <p>Загрузка...</p>;

  const deficitCount = shortages.filter((s) => s.deficit > 0).length;
  const okCount = reqs.length - deficitCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Заказ №{order.number}</h1>
        <p className="text-slate-600">
          {order.product_name} — {order.quantity} шт.
        </p>
      </div>

      <Card title="Спецификация">
        <p>
          {order.spec_revision}{" "}
          <StatusBadge status="green">Привязана к заказу</StatusBadge>
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="secondary" onClick={calculate}>
            Пересчитать
          </Button>
          {hasRole("technologist") && (
            <Button variant="secondary" onClick={confirmTech}>
              Подтвердить технологию
            </Button>
          )}
        </div>
      </Card>

      <Card title="Комплектующие">
        <p className="mb-3 text-sm">
          <StatusBadge status="green">{okCount} позиций обеспечены</StatusBadge>{" "}
          {deficitCount > 0 && <StatusBadge status="red">{deficitCount} позиций имеют дефицит</StatusBadge>}
        </p>
        <DataTable
          headers={["Комплектующая", "На 1", "Требуется", "Свободно", "Дефицит"]}
          rows={reqs.map((r) => [
            `${r.component_name} (${r.component_sku})`,
            `${r.qty_per_unit} ${r.unit}`,
            r.qty_required,
            r.free_stock ?? "—",
            (r.deficit ?? 0) > 0 ? (
              <StatusBadge status="red">{(r.deficit ?? 0).toString()}</StatusBadge>
            ) : (
              <StatusBadge status="green">0</StatusBadge>
            ),
          ])}
        />
      </Card>

      {shortages.filter((s) => s.deficit > 0).length > 0 && (
        <Card title="Снабжение">
          {shortages
            .filter((s) => s.deficit > 0)
            .map((s) => (
              <div key={s.id} className="mb-2 text-sm">
                <StatusBadge status="red">
                  {s.component_sku}: не хватает {s.deficit}
                </StatusBadge>
                {s.expected_date && <span className="ml-2">Ожидаем: {s.expected_date}</span>}
              </div>
            ))}
        </Card>
      )}

      {readiness && (
        <Card title="Готовность">
          <p className="mb-3 text-lg font-semibold">{readiness.readiness_percent}%</p>
          <ul className="mb-4 space-y-2">
            {readiness.checks.map((c) => (
              <li key={c.label} className="text-sm">
                <strong>{c.label}:</strong>{" "}
                <StatusBadge status={c.status as "green" | "yellow" | "red"}>{c.message}</StatusBadge>
              </li>
            ))}
          </ul>
          {readiness.launch_blocked ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <StatusBadge status="red">ЗАПУСК ЗАБЛОКИРОВАН</StatusBadge>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {readiness.blocking_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : (
            <StatusBadge status="green">ГОТОВ К ПРОИЗВОДСТВУ</StatusBadge>
          )}
          {hasRole("director", "production", "admin") && order.status !== "ready_for_production" && (
            <div className="mt-4">
              <Button onClick={() => setStatus("ready_for_production")}>Готов к производству</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
