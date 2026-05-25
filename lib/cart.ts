import { getProductById } from "@/lib/products";
import type { Product } from "@/lib/types";

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
};

export type CartLine = CartItem & {
  product: Product;
  total: number;
  robuxTotal: number;
  gamepassTotal: number;
};

const CART_KEY = "rovix-cart";
const MAX_QUANTITY = 20;

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

function normalizeItems(items: CartItem[]) {
  return items
    .filter((item) => getProductById(item.productId))
    .map((item) => ({
      productId: item.productId,
      quantity: clampQuantity(item.quantity),
      addedAt: item.addedAt || new Date().toISOString()
    }));
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? normalizeItems(JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  const normalized = normalizeItems(items);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(CART_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export function addToCart(productId: string, quantity = 1) {
  const product = getProductById(productId);
  if (!product) return getCartItems();

  const current = getCartItems();
  const existing = current.find((item) => item.productId === productId);

  if (existing) {
    return saveCartItems(
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item
      )
    );
  }

  return saveCartItems([
    ...current,
    {
      productId,
      quantity: clampQuantity(quantity),
      addedAt: new Date().toISOString()
    }
  ]);
}

export function updateCartItem(productId: string, quantity: number) {
  if (quantity <= 0) return removeFromCart(productId);

  return saveCartItems(
    getCartItems().map((item) => (item.productId === productId ? { ...item, quantity: clampQuantity(quantity) } : item))
  );
}

export function removeFromCart(productId: string) {
  return saveCartItems(getCartItems().filter((item) => item.productId !== productId));
}

export function clearCart() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CART_KEY);
  }

  return [];
}

export function getCartLines(items = getCartItems()): CartLine[] {
  return normalizeItems(items).flatMap((item) => {
    const product = getProductById(item.productId);
    if (!product) return [];

    return [
      {
        ...item,
        product,
        total: Number((product.price * item.quantity).toFixed(2)),
        robuxTotal: product.kind === "gamepass" ? 0 : product.amount * item.quantity,
        gamepassTotal: product.kind === "gamepass" ? item.quantity : 0
      }
    ];
  });
}

export function getCartSummary(items = getCartItems()) {
  const lines = getCartLines(items);

  return lines.reduce(
    (summary, line) => ({
          quantity: summary.quantity + line.quantity,
          subtotal: Number((summary.subtotal + line.total).toFixed(2)),
          robux: summary.robux + line.robuxTotal,
          gamepasses: summary.gamepasses + line.gamepassTotal
        }),
    { quantity: 0, subtotal: 0, robux: 0, gamepasses: 0 }
  );
}
