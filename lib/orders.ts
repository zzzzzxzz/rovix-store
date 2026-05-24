import type { Order, Product, CheckoutForm } from "@/lib/types";
import { createId } from "@/lib/utils";

const ORDERS_KEY = "rovix-orders";

export function createLocalOrder(product: Product, customer: CheckoutForm, paymentId: string): Order {
  const order: Order = {
    id: createId("rvx"),
    productId: product.id,
    productAmount: product.amount,
    value: product.price,
    customerName: customer.username,
    customerEmail: customer.email,
    paymentId,
    status: "processing",
    createdAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    const current = getLocalOrders();
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...current]));
  }

  return order;
}

export function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}
