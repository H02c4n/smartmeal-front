export type CartItem = {
  product_id: string;
  product_name: string;
  unit_price: string;
  currency: string;
  quantity: number;
};

const CART_KEY = "smartmeal_cart";
const CART_EVENT = "smartmeal_cart_changed";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(
  input: Omit<CartItem, "quantity">,
  qty = 1,
): void {
  const items = getCart();
  const found = items.find((i) => i.product_id === input.product_id);
  if (found) {
    found.quantity += qty;
  } else {
    items.push({ ...input, quantity: qty });
  }
  writeCart(items);
}

export function updateQuantity(productId: string, qty: number): void {
  const items = getCart();
  const idx = items.findIndex((i) => i.product_id === productId);
  if (idx < 0) return;
  if (qty <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].quantity = qty;
  }
  writeCart(items);
}

export function removeFromCart(productId: string): void {
  writeCart(getCart().filter((i) => i.product_id !== productId));
}

export function clearCart(): void {
  writeCart([]);
}

export function subscribeCart(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener("storage", handler); // sekmeler arası senkron
  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function cartTotal(items: CartItem[]): {
  subtotal: string;
  currency: string;
} {
  const currency = items[0]?.currency ?? "SEK";
  const total = items.reduce(
    (acc, i) => acc + Number(i.unit_price) * i.quantity,
    0,
  );
  return { subtotal: total.toFixed(2), currency };
}