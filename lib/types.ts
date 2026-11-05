export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  category_name: string;
  price: string;
  currency: string;
  allergen_codes: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PaginatedResponse<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};

export type User = {
  id: string;
  email: string;
  phone: string;
  is_staff: boolean;
  roles: string[];
};

export type OrderLine = {
  id: string;
  product: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price_snapshot: string;
  line_total: string;
  recipe_version_snapshot: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  status: "PLACED" | "CONFIRMED" | "CANCELLED";
  delivery_date: string;
  delivery_address_snapshot: Record<string, string>;
  currency: string;
  subtotal: string;
  tax_amount: string;
  delivery_fee: string;
  total_amount: string;
  notes: string;
  cancellation_reason: string;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  lines: OrderLine[];
};