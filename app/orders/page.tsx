"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiRequestError, apiFetch } from "@/lib/api";
import type { Order, PaginatedResponse } from "@/lib/types";

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch<PaginatedResponse<Order>>("/api/v1/orders")
            .then((d) => {
                console.log("[orders] raw response:", d);
                // Hem paginated ({results}) hem bare array durumunu ele al
                const list = Array.isArray(d) ? d : (d?.results ?? []);
                setOrders(list);
            })
            .catch((e) => {
                if (e instanceof ApiRequestError && e.status === 403) {
                    router.push("/login");
                    return;
                }
                setError(e instanceof Error ? e.message : "Bilinmeyen hata");
            })
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <main className="p-8 text-gray-600">Yükleniyor...</main>;
    if (error) return <main className="p-8 text-red-700">Hata: {error}</main>;

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl p-8">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Siparişlerim</h1>

                {orders.length === 0 ? (
                    <div className="rounded border border-gray-200 bg-white p-8 text-center text-gray-600">
                        Henüz sipariş yok.
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {orders.map((o) => (
                            <li
                                key={o.id}
                                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{o.order_number}</p>
                                        <p className="mt-1 text-lg font-semibold text-gray-900">
                                            {o.total_amount} {o.currency}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${o.status === "CONFIRMED"
                                                ? "bg-green-100 text-green-800"
                                                : o.status === "CANCELLED"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {o.status}
                                    </span>
                                </div>
                                <div className="mt-3 text-sm text-gray-600">
                                    {o.lines.map((l) => (
                                        <div key={l.id}>
                                            {l.product_name_snapshot} × {l.quantity} = {l.line_total}{" "}
                                            {o.currency}
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                    Teslimat: {o.delivery_date}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}