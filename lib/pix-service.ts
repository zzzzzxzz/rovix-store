import "server-only";

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

function compactRaw(raw: string) {
  return raw.replace(/\s+/g, " ").trim().slice(0, 180);
}

function parseProviderResponse(raw: string, fallbackMessage: string): ProviderPaymentResponse {
  const clean = raw.trim();

  if (!clean) return {};

  if (clean.startsWith("{") || clean.startsWith("[") || clean.startsWith("\"")) {
    try {
      const parsed = JSON.parse(clean) as unknown;
      if (typeof parsed === "string") {
        return parsed.startsWith("000201") ? { paymentCode: parsed } : { message: parsed };
      }
      if (Array.isArray(parsed)) return { data: parsed };
      if (parsed && typeof parsed === "object") return parsed as ProviderPaymentResponse;
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  if (clean.startsWith("000201")) {
    return { paymentCode: clean };
  }

  if (clean.includes("=") && clean.includes("&")) {
    const params = new URLSearchParams(clean);
    return Object.fromEntries(params.entries());
  }

  if (clean.startsWith("<")) {
    console.error("[HidePay] HTML response:", compactRaw(clean));
    throw new Error(
      "A HidePay retornou uma pagina HTML em vez de JSON. Confira as variaveis PIX_API_BASE_URL, PIX_API_CREATE_PATH e se a API key esta ativa."
    );
  }

  console.error("[HidePay] Non JSON response:", compactRaw(clean));
  throw new Error(fallbackMessage);
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

function deepFirstString(value: unknown, keys: string[]): string {
  if (!value || typeof value !== "object") return "";

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = deepFirstString(item, keys);
      if (found) return found;
    }
    return "";
  }

  const source = value as Record<string, unknown>;
  const normalizedKeys = keys.map((key) => key.toLowerCase());

  for (const [key, item] of Object.entries(source)) {
    if (normalizedKeys.includes(key.toLowerCase())) {
      if (typeof item === "string" && item.trim()) return item;
      if (typeof item === "number") return String(item);
    }
  }

  for (const item of Object.values(source)) {
    const found = deepFirstString(item, keys);
    if (found) return found;
  }

  return "";
}

function endpoint(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function qrUrl(paymentCode: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(paymentCode)}`;
}

function gatewayHeaders() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "RovixStore/1.0"
  };
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
    ]) ||
    deepFirstString(data, ["idTransaction", "idtransaction", "transaction_id", "transactionId", "id"]) ||
    createId("pix");

  const paymentCode =
    firstString(data, [
      "paymentCode",
      "payment_code",
      "paymentcode",
      "pixCode",
      "pix_code",
      "qrcode",
      "qrCode",
      "qr_code",
      "copyPaste",
      "copy_paste",
      "pixCopiaECola",
      "copia_e_cola",
      "copiaecola",
      "payload",
      "emv",
      "brcode",
      "brCode",
      "data.paymentCode",
      "data.payment_code",
      "data.paymentcode",
      "data.pixCode",
      "data.pix_code",
      "data.qrcode",
      "data.qrCode",
      "data.qr_code",
      "data.copyPaste",
      "data.copy_paste",
      "data.payload",
      "data.emv",
      "data.brcode"
    ]) ||
    deepFirstString(data, [
      "paymentCode",
      "payment_code",
      "paymentcode",
      "pixCode",
      "pix_code",
      "qrcode",
      "qrCode",
      "qr_code",
      "copyPaste",
      "copy_paste",
      "pixCopiaECola",
      "copia_e_cola",
      "copiaecola",
      "payload",
      "emv",
      "brcode",
      "brCode"
    ]);

  if (!paymentCode) {
    console.error("[HidePay] Payment code missing. Response keys:", Object.keys(data).join(", "));
    throw new Error("A HidePay nao retornou o codigo PIX. Confira se sua API key tem PIX habilitado.");
  }

  const status =
    firstString(data, ["status", "data.status"]) ||
    deepFirstString(data, ["status", "payment_status", "paymentStatus"]) ||
    "WAITING_FOR_APPROVAL";

  return {
    id,
    status: mapStatus(status),
    qrCode: qrUrl(paymentCode),
    copyPaste: paymentCode,
    expiresAt:
      firstString(data, ["expiresAt", "expires_at", "expiration", "data.expiresAt", "data.expires_at"]) ||
      deepFirstString(data, ["expiresAt", "expires_at", "expiration"]) ||
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
    throw new Error("Chave da HidePay nao configurada. Defina PIX_API_KEY no .env.local e na Vercel.");
  }
}

export async function createPixPayment(product: Product, customer: CheckoutForm): Promise<PixPayment> {
  const config = getConfig();
  assertGatewayConfig(config);

  const response = await gatewayFetch(endpoint(config.baseUrl, config.createPath), {
    method: "POST",
    headers: gatewayHeaders(),
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
  const data = parseProviderResponse(raw, "A HidePay respondeu em formato invalido.");

  if (!response.ok) {
    const message =
      firstString(data, ["error", "message", "detail", "data.error", "data.message"]) ||
      deepFirstString(data, ["error", "message", "detail"]);
    throw new Error(message || "Nao foi possivel gerar o PIX na HidePay.");
  }

  return mapProviderPayment(data);
}

export async function getPixPaymentStatus(paymentId: string): Promise<{ status: PaymentStatus }> {
  const config = getConfig();
  assertGatewayConfig(config);

  const response = await gatewayFetch(endpoint(config.baseUrl, config.statusPath), {
    method: "POST",
    headers: gatewayHeaders(),
    body: JSON.stringify({
      "api-key": config.apiKey,
      idtransaction: paymentId
    }),
    cache: "no-store"
  });

  const raw = await response.text();
  const data = parseProviderResponse(raw, "A HidePay respondeu em formato invalido ao consultar o status.");

  if (!response.ok) {
    const message =
      firstString(data, ["error", "message", "detail", "data.error", "data.message"]) ||
      deepFirstString(data, ["error", "message", "detail"]);
    throw new Error(message || "Nao foi possivel consultar o status do pagamento na HidePay.");
  }

  const status =
    firstString(data, ["status", "data.status"]) ||
    deepFirstString(data, ["status", "payment_status", "paymentStatus"]) ||
    "WAITING_FOR_APPROVAL";

  return { status: mapStatus(status) };
}
