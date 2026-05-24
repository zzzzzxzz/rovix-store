import type { Product } from "@/lib/types";

export const products: Product[] = [
  { id: "robux-400", amount: 400, price: 10, badge: "Entrada" },
  { id: "robux-1000", amount: 1000, price: 28, badge: "Popular" },
  { id: "robux-2000", amount: 2000, price: 52, badge: "Mais valor" },
  { id: "robux-3000", amount: 3000, price: 76, badge: "Premium" },
  { id: "robux-5000", amount: 5000, price: 98, badge: "Oferta top" }
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
