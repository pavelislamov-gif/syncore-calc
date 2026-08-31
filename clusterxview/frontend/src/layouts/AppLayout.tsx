import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/orders", label: "Заказы" },
  { to: "/assembly", label: "Сборка" },
  { to: "/assembly/all", label: "Что можем собрать?" },
  { to: "/products", label: "Изделия" },
  { to: "/components", label: "Комплектующие" },
  { to: "/inventory", label: "Остатки" },
  { to: "/procurement", label: "Снабжение" },
  { to: "/engineering", label: "Конструктор" },
  { to: "/problems", label: "Проблемы" },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; link: string }[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api<{ label: string; link: string }[]>(`/search?q=${encodeURIComponent(query)}`).then(setResults).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">ClusterXview</h1>
          <p className="text-xs text-slate-500">Производственная система</p>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <div className="relative flex-1 max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск: заказ, изделие, артикул..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg">
                {results.map((r, i) => (
                  <button
                    key={i}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      navigate(r.link);
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-sm text-slate-600">{user?.full_name}</span>
          <Button variant="secondary" onClick={logout}>
            Выйти
          </Button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
