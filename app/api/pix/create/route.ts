import { NextResponse } from "next/server";
import { z } from "@/lib/zod-lite";
import { getProductById } from "@/lib/products";
import { createPixPayment } from "@/lib/pix-service";
import type { Product } from "@/lib/types";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  document: z.string().min(11)
});

function parseQuantity(value: unknown) {
  const quantity = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(20, Math.max(1, Math.floor(quantity)));
}

function getCheckoutProduct(body: Record<string, unknown>): Product | null {
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length > 0) {
    const cartProduct = items.reduce<Product>(
      (summary, item) => {
        if (!item || typeof item !== "object") return summary;

        const source = item as { productId?: unknown; quantity?: unknown };
        const productId = typeof source.productId === "string" ? source.productId : "";
        const product = getProductById(productId);

        if (!product) return summary;

        const quantity = parseQuantity(source.quantity);

        return {
          id: "cart-checkout",
          amount: summary.amount + product.amount * quantity,
          price: Number((summary.price + product.price * quantity).toFixed(2)),
          badge: "Carrinho"
        };
      },
      { id: "cart-checkout", amount: 0, price: 0, badge: "Carrinho" }
    );

    return cartProduct.amount > 0 && cartProduct.price > 0 ? cartProduct : null;
  }

  const productId = typeof body.productId === "string" ? body.productId : "";
  const product = getProductById(productId);

  if (!product) return null;

  const quantity = parseQuantity(body.quantity);

  return {
    ...product,
    amount: product.amount * quantity,
    price: Number((product.price * quantity).toFixed(2))
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.username && typeof body.name === "string") {
      body.username = body.name;
    }

    const parsed = schema.parse(body);
    const checkoutProduct = getCheckoutProduct(body);

    if (!checkoutProduct) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const document = parsed.document.replace(/\D/g, "");

    if (![11, 14].includes(document.length)) {
      return NextResponse.json({ error: "Informe um CPF ou CNPJ válido." }, { status: 400 });
    }

    const payment = await createPixPayment(checkoutProduct, {
      username: parsed.username,
      email: parsed.email,
      document
    });

    return NextResponse.json({ payment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar PIX.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
