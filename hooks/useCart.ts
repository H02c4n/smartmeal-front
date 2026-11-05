"use client";

import { useEffect, useState } from "react";

import {
  type CartItem,
  cartTotal,
  getCart,
  subscribeCart,
} from "@/lib/cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setHydrated(true);
    return subscribeCart(() => setItems(getCart()));
  }, []);

  const total = cartTotal(items);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return { items, hydrated, total, count };
}