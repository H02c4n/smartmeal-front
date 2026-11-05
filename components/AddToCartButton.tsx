"use client";

import { useState } from "react";

import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      currency: product.currency,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      onClick={handleClick}
      className={`mt-3 w-full rounded px-3 py-2 text-sm font-medium text-white transition ${
        added ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {added ? "Eklendi ✓" : "Sepete Ekle"}
    </button>
  );
}