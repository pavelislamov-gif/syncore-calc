import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearTokens, setTokens } from "../api/client";
import type { User } from "../types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<User>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const tokens = await api<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setTokens(tokens.access_token, tokens.refresh_token);
    const me = await api<User>("/auth/me");
    setUser(me);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const hasRole = (...roles: string[]) => {
    if (!user) return false;
    const codes = user.roles.map((r) => r.code);
    if (codes.includes("admin")) return true;
    return roles.some((r) => codes.includes(r));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
