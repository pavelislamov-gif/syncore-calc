import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { AssemblyPage, AssemblyAllPage } from "./pages/AssemblyPage";
import { ProductsPage, ProductDetailPage } from "./pages/ProductsPage";
import { ComponentsPage, ComponentDetailPage } from "./pages/ComponentsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { ProcurementPage } from "./pages/ProcurementPage";
import { EngineeringPage, ProblemsPage } from "./pages/EngineeringPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8">Загрузка...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/assembly" element={<AssemblyPage />} />
            <Route path="/assembly/all" element={<AssemblyAllPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/components" element={<ComponentsPage />} />
            <Route path="/components/:id" element={<ComponentDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/procurement" element={<ProcurementPage />} />
            <Route path="/engineering" element={<EngineeringPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
