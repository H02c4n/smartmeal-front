export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  category_name: string;
  price: string; // backend Decimal'i string döner
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