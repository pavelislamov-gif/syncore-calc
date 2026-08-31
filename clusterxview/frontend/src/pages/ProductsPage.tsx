import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Product } from "../types";
import { Card, DataTable, Button } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { hasRole } = useAuth();

  useEffect(() => {
    api<Product[]>("/products").then(setProducts);
  }, []);

  const create = async () => {
    const sku = `PRD-${Date.now().toString().slice(-4)}`;
    await api("/products", {
      method: "POST",
      body: JSON.stringify({ name: "Новое изделие", sku }),
    });
    setProducts(await api<Product[]>("/products"));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Изделия</h1>
        {hasRole("technologist", "admin") && <Button onClick={create}>Создать изделие</Button>}
      </div>
      <Card>
        <DataTable
          headers={["Название", "Артикул", "Статус", ""]}
          rows={products.map((p) => [
            p.name,
            p.sku,
            p.status,
            <Link to={`/products/${p.id}`} className="text-sky-600">
              Открыть
            </Link>,
          ])}
        />
      </Card>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [specs, setSpecs] = useState<
    { id: number; versions: { id: number; revision: string; status: string; items: { component_sku?: string; quantity: number; unit: string; group_name?: string }[] }[] }[]
  >([]);

  useEffect(() => {
    api<Product>(`/products/${productId}`).then(setProduct);
    api<typeof specs>(`/specifications/product/${productId}`).then(setSpecs);
  }, [productId]);

  if (!product) return <p>Загрузка...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-slate-600">Артикул: {product.sku}</p>
      {specs.flatMap((s) =>
        s.versions.map((v) => (
          <Card key={v.id} title={`Спецификация ${v.revision}`}>
            <DataTable
              headers={["Группа", "Комплектующая", "Кол-во", "Ед."]}
              rows={v.items.map((i) => [i.group_name || "—", i.component_sku || "—", i.quantity, i.unit])}
            />
          </Card>
        )),
      )}
    </div>
  );
}
