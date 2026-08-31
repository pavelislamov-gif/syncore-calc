import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button, Card } from "../components/ui";

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const [username, setUsername] = useState("director");
  const [password, setPassword] = useState("director123");
  const [error, setError] = useState("");

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold">ClusterXview</h1>
        <p className="mb-6 text-sm text-slate-500">Вход в производственную систему</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit">Войти</Button>
        </form>
        <p className="mt-4 text-xs text-slate-400">Demo: director / director123</p>
      </Card>
    </div>
  );
}
