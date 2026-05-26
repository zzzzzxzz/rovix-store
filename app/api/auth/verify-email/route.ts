import { NextResponse } from "next/server";
import { verifyEmailCodeToken, type EmailVerificationPurpose } from "@/lib/email-verification";
import { getEmailValidationError, normalizeEmail } from "@/lib/validators";

type VerifyEmailPayload = {
  email?: string;
  code?: string;
  token?: string;
  purpose?: EmailVerificationPurpose;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VerifyEmailPayload;
    const email = normalizeEmail(payload.email || "");
    const code = (payload.code || "").replace(/\D/g, "");
    const token = payload.token || "";
    const purpose = payload.purpose;

    const emailError = getEmailValidationError(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    if (code.length !== 6 || !token) {
      return NextResponse.json({ error: "Informe o codigo de 6 digitos." }, { status: 400 });
    }

    const result = verifyEmailCodeToken({ token, email, code, purpose });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, email: result.email, purpose: result.purpose });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel verificar o codigo agora." }, { status: 500 });
  }
}
