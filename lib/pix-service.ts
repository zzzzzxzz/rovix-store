import type { CheckoutForm, PaymentStatus, PixPayment, Product } from "@/lib/types";
import { createId } from "@/lib/utils";

type ProviderPaymentResponse = Record<string, unknown>;

function getConfig() {
  return {
    apiKey: process.env.PIX_API_KEY,
    baseUrl: process.env.PIX_API_BASE_URL || "https://hidepay.site/api",
    createPath: process.env.PIX_API_CREATE_PATH || "/v1/gateway/",
    statusPath: process.env.PIX_API_STATUS_PATH || "/v1/webhook/"
  };
}

function getByPath(data: ProviderPaymentResponse, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, data);
}

function firstString(data: ProviderPaymentResponse, paths: string[]) {
  for (const path of paths) {
    const value = getByPath(data, path);
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return "";
}

function endpoint(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function qrUrl(paymentCode: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(paymentCode)}`;
}

async function gatewayFetch(url: string, init: RequestInit, timeoutMs = 25_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A HidePay demorou para responder. Tente gerar o PIX novamente.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function mapProviderPayment(data: ProviderPaymentResponse): PixPayment {
  const id =
    firstString(data, [
      "idTransaction",
      "idtransaction",
      "transaction_id",
      "transactionId",
      "id",
      "data.idTransaction",
      "data.idtransaction",
      "data.transaction_id",
      "data.id"
    ]) || createId("pix");
  const paymentCode = firstString(data, [
    "paymentCode",
    "payment_code",
    "pixCode",
    "pix_code",
    "copyPaste",
    "copy_paste",
    "emv",
    "brcode",
    "data.paymentCode",
    "data.payment_code",
    "data.pixCode",
    "data.pix_code",
    "data.copyPaste",
    "data.copy_paste",
    "data.emv"
  ]);

  if (!paymentCode) {
    throw new Error("A HidePay não retornou o paymentCode do PIX.");
  }

  return {
    id,
    status: mapStatus(firstString(data, ["status", "data.status"]) || "WAITING_FOR_APPROVAL"),
    qrCode: qrUrl(paymentCode),
    copyPaste: paymentCode,
    expiresAt:
      firstString(data, ["expiresAt", "expires_at", "expiration", "data.expiresAt", "data.expires_at"]) ||
      new Date(Date.now() + 30 * 60_000).toISOString()
  };
}

function mapStatus(status: string): PaymentStatus {
  const normalized = status.toUpperCase();
  if (["PAID_OUT", "APPROVED", "PAID", "CONFIRMED", "COMPLETED", "SUCCESS"].includes(normalized)) return "approved";
  if (["DECLINED", "REJECTED", "FAILED", "CANCELED", "CANCELLED", "REFUSED", "REFUNDED"].includes(normalized)) {
    return "rejected";
  }
  if (normalized === "EXPIRED") return "expired";
  return "pending";
}

function assertGatewayConfig(config: ReturnType<typeof getConfig>) {
  if (!config.apiKey) {
    throw new Error("Chave da HidePay não configurada. Defina PIX_API_KEY no .env.local.");
  }
}

export async function createPixPayment(product: Product, customer: CheckoutForm): Promise<PixPayment> {
  const config = getConfig();
  assertGatewayConfig(config);

  const response = await gatewayFetch(endpoint(config.baseUrl, config.createPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "api-key": config.apiKey,
      amount: product.price,
      method: "pix",
      external_reference: product.id,
      client: {
        name: customer.username,
        document: customer.document.replace(/\D/g, ""),
        email: customer.email
      }
    }),
    cache: "no-store"
  });

  const raw = await response.text();
  let data: ProviderPaymentResponse = {};

  try {
    data = raw ? (JSON.parse(raw) as ProviderPaymentResponse) : {};
  } catch {
    throw new Error("A HidePay respondeu em formato inválido.");
  }

  if (!response.ok) {
    const message = firstString(data, ["error", "message", "detail", "data.error", "data.message"]);
    throw new Error(message || "Não foi possível gerar o PIX na HidePay.");
  }

  return mapProviderPayment(data);
}

export async function getPixPaymentStatus(paymentId: string): Promise<{ status: PaymentStatus }> {
  const config = getConfig();
  assertGatewayConfig(config);

  const response = await gatewayFetch(endpoint(config.baseUrl, config.statusPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "api-key": config.apiKey,
      idtransaction: paymentId
    }),
    cache: "no-store"
  });

  const raw = await response.text();
  let data: ProviderPaymentResponse = {};

  try {
    data = raw ? (JSON.parse(raw) as ProviderPaymentResponse) : {};
  } catch {
    throw new Error("A HidePay respondeu em formato inválido ao consultar o status.");
  }

  if (!response.ok) {
    const message = firstString(data, ["error", "message", "detail", "data.error", "data.message"]);
    throw new Error(message || "Não foi possível consultar o status do pagamento na HidePay.");
  }

  return { status: mapStatus(firstString(data, ["status", "data.status"]) || "WAITING_FOR_APPROVAL") };
}
