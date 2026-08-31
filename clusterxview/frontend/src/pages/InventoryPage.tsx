import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { InventoryRow } from "../types";
import { Card, DataTable, Button } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [qty, setQty] = useState("");
  const [comment, setComment] = useState("");
  const { hasRole } = useAuth();

  const load = () => api<InventoryRow[]>("/inventory").then(setRows);

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editId) return;
    await api("/inventory/update", {
      method: "POST",
      body: JSON.stringify({ component_id: editId, quantity: Number(qty), comment }),
    });
    setEditId(null);
    setQty("");
    setComment("");
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Остатки</h1>
      <Card>
        <DataTable
          headers={["Комплектующая", "Артикул", "Остаток", "Ед.", ""]}
          rows={rows.map((r) => [
            r.component_name,
            r.component_sku,
            r.quantity,
            r.unit,
            hasRole("supply", "admin") ? (
              <Button variant="secondary" onClick={() => { setEditId(r.component_id); setQty(String(r.quantity)); }}>
                Изменить
              </Button>
            ) : (
              "—"
            ),
          ])}
        />
      </Card>
      {editId && (
        <Card title="Изменить остаток">
          <div className="flex flex-wrap gap-3">
            <input className="rounded border px-2 py-1" value={qty} onChange={(e) => setQty(e.target.value)} />
            <input
              className="rounded border px-2 py-1"
              placeholder="Комментарий"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={save}>Сохранить</Button>
            <Button variant="secondary" onClick={() => setEditId(null)}>
              Отмена
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
