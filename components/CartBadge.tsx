"use client";

import Link from "next/link";

import { useCart } from "@/hooks/useCart";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative text-gray-700 hover:text-gray-900">
      Sepet
      {count > 0 && (
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}