import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Component } from "../types";
import { Card, DataTable, StatusBadge } from "../components/ui";

export function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [critical, setCritical] = useState<{ sku: string; name: string; limits_products_count: number }[]>([]);

  useEffect(() => {
    api<Component[]>("/components").then(setComponents);
    api<typeof critical>("/components/critical/list").then(setCritical);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Комплектующие</h1>
      {critical.length > 0 && (
        <Card title="Критические комплектующие">
          <ol className="list-decimal pl-5 text-sm">
            {critical.map((c) => (
              <li key={c.sku}>
                {c.name} ({c.sku}) — ограничивает {c.limits_products_count} изделий
              </li>
            ))}
          </ol>
        </Card>
      )}
      <Card>
        <DataTable
          headers={["Название", "Артикул", "Остаток", "Ед.", ""]}
          rows={components.map((c) => [
            c.name,
            c.sku,
            c.current_stock ?? 0,
            c.unit,
            <Link to={`/components/${c.id}`} className="text-sky-600">
              Открыть
            </Link>,
          ])}
        />
      </Card>
    </div>
  );
}

export function ComponentDetailPage() {
  const { id } = useParams();
  const [comp, setComp] = useState<Component | null>(null);
  const [usage, setUsage] = useState<{ product_name: string; qty_per_unit: number; spec_revision: string }[]>([]);
  const [availability, setAvailability] = useState<{
    free: number;
    usage: { product_name: string; qty_per_unit: number; buildable_units: number }[];
  } | null>(null);

  useEffect(() => {
    const cid = Number(id);
    api<Component>(`/components/${cid}`).then(setComp);
    api<typeof usage>(`/components/${cid}/usage`).then(setUsage);
    api<typeof availability>(`/components/${cid}/availability`).then(setAvailability);
  }, [id]);

  if (!comp) return <p>Загрузка...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{comp.name}</h1>
      <p className="text-slate-600">{comp.sku}</p>
      <Card title="Остаток">
        <p>
          Свободно: <strong>{availability?.free ?? comp.current_stock}</strong> {comp.unit}
        </p>
      </Card>
      <Card title="Где используется?">
        <DataTable
          headers={["Изделие", "Расход", "Ревизия"]}
          rows={usage.map((u) => [u.product_name, `${u.qty_per_unit} ${comp.unit}/изд.`, u.spec_revision])}
        />
      </Card>
      <Card title="На сколько хватит">
        {availability?.usage.map((u) => (
          <p key={u.product_name} className="text-sm">
            <StatusBadge status="green">
              Хватит на {u.buildable_units} × {u.product_name}
            </StatusBadge>
          </p>
        ))}
      </Card>
    </div>
  );
}
