import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { normalizeEmail } from "@/lib/validators";

export type EmailVerificationPurpose = "register" | "change-email" | "login" | "verify-email";

type EmailVerificationPayload = {
  email: string;
  purpose: EmailVerificationPurpose;
  codeHash: string;
  expiresAt: number;
  nonce: string;
};

const EMAIL_CODE_EXPIRES_MS = 10 * 60 * 1000;

function getVerificationSecret() {
  return (
    process.env.EMAIL_VERIFICATION_SECRET ||
    process.env.SUPPORT_EMAIL_APP_PASSWORD ||
    process.env.PIX_API_KEY ||
    "rovix-local-email-verification"
  );
}

function sign(value: string) {
  return createHmac("sha256", getVerificationSecret()).update(value).digest("base64url");
}

function hashCode(email: string, code: string) {
  return createHmac("sha256", getVerificationSecret())
    .update(`${normalizeEmail(email)}:${code.trim()}`)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createEmailCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createEmailVerificationToken(email: string, purpose: EmailVerificationPurpose, code: string) {
  const payload: EmailVerificationPayload = {
    email: normalizeEmail(email),
    purpose,
    codeHash: hashCode(email, code),
    expiresAt: Date.now() + EMAIL_CODE_EXPIRES_MS,
    nonce: randomBytes(12).toString("hex")
  };

  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyEmailCodeToken({
  token,
  email,
  code,
  purpose
}: {
  token: string;
  email: string;
  code: string;
  purpose?: EmailVerificationPurpose;
}) {
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(sign(body), signature)) {
    return { ok: false, error: "Codigo de verificacao invalido." };
  }

  let payload: EmailVerificationPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as EmailVerificationPayload;
  } catch {
    return { ok: false, error: "Codigo de verificacao invalido." };
  }

  if (payload.expiresAt < Date.now()) {
    return { ok: false, error: "Codigo expirado. Envie um novo codigo." };
  }

  if (payload.email !== normalizeEmail(email)) {
    return { ok: false, error: "Esse codigo pertence a outro e-mail." };
  }

  if (purpose && payload.purpose !== purpose) {
    return { ok: false, error: "Codigo de verificacao invalido." };
  }

  if (!safeEqual(payload.codeHash, hashCode(email, code))) {
    return { ok: false, error: "Codigo incorreto." };
  }

  return { ok: true, email: payload.email, purpose: payload.purpose };
}
