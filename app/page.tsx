import Link from "next/link";

import { AddToCartButton } from "@/components/AddToCartButton";
import { CartBadge } from "@/components/CartBadge";
import { apiFetch } from "@/lib/api";
import type { PaginatedResponse, Product } from "@/lib/types";

export default async function Home() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    const data = await apiFetch<PaginatedResponse<Product> | Product[]>(
      "/api/v1/products",
    );
    products = Array.isArray(data)
      ? data
      : data && Array.isArray(data.results)
        ? data.results
        : [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Ürünler yüklenemedi";
    products = [];
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            SmartMeal
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/orders" className="text-gray-700 hover:text-gray-900">
              Siparişlerim
            </Link>
            <CartBadge />
            <Link
              href="/login"
              className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
            >
              Giriş
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Menü</h1>
        <p className="mb-8 text-gray-600">Taze malzemelerle hazırlanan yemekler</p>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
            Hata: {error}
          </div>
        )}

        {!error && products.length === 0 && (
          <div className="rounded border border-gray-200 bg-white p-8 text-center text-gray-600">
            Henüz aktif ürün yok. Admin panelinden ürün ekleyin.
          </div>
        )}

        {products.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
                  <span className="text-xs text-gray-500">{p.sku}</span>
                </div>
                {p.description && (
                  <p className="mt-1 text-sm text-gray-600">{p.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-medium text-gray-800">
                    {p.price} {p.currency}
                  </span>
                  <span className="text-xs text-gray-500">{p.category_name}</span>
                </div>
                {p.allergen_codes.length > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Alerjen: {p.allergen_codes.join(", ")}
                  </p>
                )}
                <AddToCartButton product={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}