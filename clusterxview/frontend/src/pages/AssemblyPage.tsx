import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Product } from "../types";
import { Card, StatusBadge, Button, DataTable } from "../components/ui";

interface AssemblyResult {
  product_id: number;
  product_name: string;
  product_sku: string;
  max_buildable: number;
  limiting_component: {
    component_sku: string;
    component_name: string;
    free_stock: number;
    qty_per_unit: number;
  } | null;
  lines: {
    component_sku: string;
    component_name: string;
    qty_per_unit: number;
    free_stock: number;
    buildable: number;
  }[];
}

export function AssemblyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AssemblyResult | null>(null);
  const [targetQty, setTargetQty] = useState(500);
  const [increase, setIncrease] = useState<{ additional_needed: { component_sku: string; additional_qty: number }[] } | null>(null);

  useEffect(() => {
    api<Product[]>("/products").then((p) => {
      setProducts(p);
      if (p[0]) setSelected(p[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api<AssemblyResult>(`/assembly/${selected}`).then(setResult);
    setIncrease(null);
  }, [selected]);

  const runIncrease = async () => {
    if (!selected) return;
    const data = await api<{ additional_needed: { component_sku: string; additional_qty: number }[] }>(
      `/assembly/${selected}/increase`,
      { method: "POST", body: JSON.stringify({ target_qty: targetQty }) },
    );
    setIncrease(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Сборка</h1>
      <select
        className="rounded-lg border px-3 py-2"
        value={selected ?? ""}
        onChange={(e) => setSelected(Number(e.target.value))}
      >
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {result && (
        <>
          <Card>
            <StatusBadge status="green">МОЖНО СОБРАТЬ {result.max_buildable} ШТ.</StatusBadge>
            {result.limiting_component && (
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-medium">Почему не больше?</p>
                <p>
                  {result.limiting_component.component_sku} — ограничивающая комплектующая
                </p>
                <p>Есть: {result.limiting_component.free_stock}</p>
                <p>Нужно: {result.limiting_component.qty_per_unit} на изделие</p>
              </div>
            )}
          </Card>

          <Card title="Детализация">
            <DataTable
              headers={["Комплектующая", "На 1", "Свободно", "Можно"]}
              rows={result.lines.map((l) => [
                `${l.component_name} (${l.component_sku})`,
                l.qty_per_unit,
                l.free_stock,
                l.buildable,
              ])}
            />
          </Card>

          <Card title="Увеличить производство">
            <div className="flex items-center gap-3">
              <label className="text-sm">Хочу собрать:</label>
              <input
                type="number"
                className="w-24 rounded border px-2 py-1"
                value={targetQty}
                onChange={(e) => setTargetQty(Number(e.target.value))}
              />
              <Button onClick={runIncrease}>Рассчитать</Button>
            </div>
            {increase && increase.additional_needed.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Не хватает:</p>
                <ul className="list-disc pl-5 text-sm">
                  {increase.additional_needed.map((a, i) => (
                    <li key={i}>
                      {a.component_sku} — {a.additional_qty}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {increase && increase.additional_needed.length === 0 && (
              <StatusBadge status="green">Достаточно комплектующих для {targetQty} шт.</StatusBadge>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export function AssemblyAllPage() {
  const [items, setItems] = useState<
    { product_name: string; max_buildable: number; limiting_component_sku?: string }[]
  >([]);

  useEffect(() => {
    api<typeof items>("/assembly").then(setItems);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Что можем собрать?</h1>
      <Card>
        <DataTable
          headers={["Изделие", "Можно собрать", "Ограничивающая комплектующая"]}
          rows={items.map((i) => [i.product_name, `${i.max_buildable} шт.`, i.limiting_component_sku || "—"])}
        />
      </Card>
    </div>
  );
}
