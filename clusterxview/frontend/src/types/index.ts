export interface User {
  id: number;
  username: string;
  full_name: string;
  roles: { code: string; name: string }[];
  must_change_password: boolean;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  status: string;
}

export interface Component {
  id: number;
  name: string;
  sku: string;
  unit: string;
  current_stock?: number;
  min_stock: number;
}

export interface Order {
  id: number;
  number: string;
  product_id: number;
  product_name?: string;
  spec_revision?: string;
  quantity: number;
  status: string;
  priority: string;
  customer?: string;
}

export interface Requirement {
  id: number;
  component_id: number;
  component_name?: string;
  component_sku?: string;
  qty_per_unit: number;
  qty_required: number;
  unit: string;
  free_stock?: number;
  deficit?: number;
}

export interface Shortage {
  id: number;
  order_id?: number;
  component_id: number;
  component_name?: string;
  component_sku?: string;
  required: number;
  available: number;
  deficit: number;
  procurement_status: string;
  expected_date?: string;
}

export interface InventoryRow {
  component_id: number;
  component_name: string;
  component_sku: string;
  quantity: number;
  unit: string;
}

export interface Problem {
  id: number;
  title: string;
  description?: string;
  category: string;
  status: string;
  priority: string;
  auto_generated: boolean;
}

export interface DashboardData {
  active_orders_count: number;
  ready_count: number;
  attention_count: number;
  blocked_count: number;
  blocked_orders: { order_id: number; number: string; reasons: string[] }[];
  critical_problems: { title: string; order_number?: string; expected_date?: string }[];
  assembly_now: {
    product_id: number;
    product_name: string;
    max_buildable: number;
    limiting_component_sku?: string;
  }[];
}
