"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiRequestError, apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<User>("/api/v1/me")
      .then(setUser)
      .catch((e) => {
        if (e instanceof ApiRequestError && e.status === 403) {
          router.push("/login");
          return;
        }
        setError(e instanceof Error ? e.message : "Bilinmeyen hata");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  }

  if (loading) {
    return <main className="p-8 text-gray-600">Yükleniyor...</main>;
  }

  if (error) {
    return <main className="p-8 text-red-700">Hata: {error}</main>;
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl p-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Hesabım</h1>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user.email}</dd>
            </div>
            {user.phone && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Telefon</dt>
                <dd className="text-gray-900">{user.phone}</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Roller</dt>
              <dd className="text-gray-900">
                {user.roles.length > 0 ? user.roles.join(", ") : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Personel</dt>
              <dd className="text-gray-900">{user.is_staff ? "Evet" : "Hayır"}</dd>
            </div>
          </dl>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleLogout}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Çıkış Yap
            </button>
            <a
              href="/orders"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Siparişlerim
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}