"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/hooks/useCart";
import { ApiRequestError, apiFetch } from "@/lib/api";
import { clearCart, removeFromCart, updateQuantity } from "@/lib/cart";
import type { Order } from "@/lib/types";

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function CartPage() {
  const router = useRouter();
  const { items, hydrated, total } = useCart();

  const [deliveryDate, setDeliveryDate] = useState(todayPlus(2));
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("SE");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Her form yüklemesinde yeni key; ağ hatası retry'ında aynı key kalır
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const order = await apiFetch<Order>("/api/v1/orders", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          delivery_date: deliveryDate,
          delivery_address: {
            street_address: streetAddress,
            city,
            postal_code: postalCode,
            country,
          },
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
          notes,
        }),
      });
      clearCart();
      router.push(`/orders?new=${order.order_number}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        if (e.status === 401 || e.status === 403) {
          router.push("/login");
          return;
        }
        if (e.code === "IDEMPOTENCY_CONFLICT") {
          setIdempotencyKey(crypto.randomUUID());
          setError("Sepet değişmişti. Lütfen tekrar deneyin.");
          return;
        }
        setError(e.message);
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated)
    return <main className="p-8 text-gray-600">Yükleniyor...</main>;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl p-8">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Sepet</h1>
          <div className="rounded border border-gray-200 bg-white p-8 text-center text-gray-600">
            Sepetiniz boş.{" "}
            <a href="/" className="text-blue-600 underline">
              Menüye dön
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Sepet</h1>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.product_id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-600">
                    {item.unit_price} {item.currency}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity - 1)
                    }
                    className="h-8 w-8 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    aria-label="Azalt"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity + 1)
                    }
                    className="h-8 w-8 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    aria-label="Arttır"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-gray-200 p-4">
            <span className="font-medium text-gray-700">Toplam</span>
            <span className="text-lg font-semibold text-gray-900">
              {total.subtotal} {total.currency}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Teslimat</h2>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Teslimat Tarihi
            </span>
            <input
              type="date"
              required
              min={todayPlus(1)}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Adres
            </span>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Testgatan 1"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Şehir
              </span>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Stockholm"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Posta Kodu
              </span>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="11122"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
          </div>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Ülke
            </span>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Notlar (opsiyonel)
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? "Gönderiliyor..."
              : `Sipariş Ver — ${total.subtotal} ${total.currency}`}
          </button>
        </form>
      </div>
    </main>
  );
}