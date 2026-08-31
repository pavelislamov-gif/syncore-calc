import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Product, Problem } from "../types";
import { Card, DataTable, StatusBadge, Button } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

interface Doc {
  id: number;
  name: string;
  doc_type: string;
  versions: { id: number; revision: string; validity_status: string; is_current: boolean }[];
}

export function EngineeringPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const { hasRole } = useAuth();

  useEffect(() => {
    api<Product[]>("/products").then((p) => {
      setProducts(p);
      if (p[0]) setSelected(p[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api<Doc[]>(`/documents/product/${selected}`).then(setDocs);
  }, [selected]);

  const confirmDoc = async (versionId: number) => {
    await api(`/documents/versions/${versionId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ validity_status: "current", comment: "Актуально" }),
    });
    if (selected) setDocs(await api<Doc[]>(`/documents/product/${selected}`));
  };

  const createDoc = async () => {
    if (!selected) return;
    await api("/documents", {
      method: "POST",
      body: JSON.stringify({ product_id: selected, name: "Чертёж корпуса", doc_type: "drawing" }),
    });
    setDocs(await api<Doc[]>(`/documents/product/${selected}`));
  };

  const statusColor = (s: string) => (s === "current" ? "green" : s === "outdated" ? "red" : "yellow") as "green" | "red" | "yellow";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Конструктор</h1>
      <select className="rounded border px-3 py-2" value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {hasRole("constructor", "admin") && <Button onClick={createDoc}>Добавить документ</Button>}
      {docs.map((d) => (
        <Card key={d.id} title={d.name}>
          {d.versions.map((v) => (
            <div key={v.id} className="mb-2 flex items-center gap-3 text-sm">
              <span>{v.revision}</span>
              <StatusBadge status={statusColor(v.validity_status)}>
                {v.validity_status === "current" ? "Актуально" : v.validity_status === "outdated" ? "Устарело" : "Требует проверки"}
              </StatusBadge>
              {hasRole("constructor", "admin") && (
                <Button variant="secondary" onClick={() => confirmDoc(v.id)}>
                  Подтвердить
                </Button>
              )}
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

export function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    api<Problem[]>("/problems").then(setProblems);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Проблемы</h1>
      <Card>
        <DataTable
          headers={["Название", "Категория", "Приоритет", "Статус", "Авто"]}
          rows={problems.map((p) => [
            p.title,
            p.category,
            p.priority,
            p.status,
            p.auto_generated ? "да" : "нет",
          ])}
        />
      </Card>
    </div>
  );
}
