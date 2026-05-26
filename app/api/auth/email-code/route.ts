import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import {
  createEmailCode,
  createEmailVerificationToken,
  type EmailVerificationPurpose
} from "@/lib/email-verification";
import { getEmailValidationError, normalizeEmail } from "@/lib/validators";

type EmailCodePayload = {
  email?: string;
  purpose?: EmailVerificationPurpose;
};

const purposeLabels: Record<EmailVerificationPurpose, string> = {
  register: "criar sua conta",
  "change-email": "alterar seu e-mail",
  login: "verificar seu login",
  "verify-email": "verificar seu e-mail"
};

function getMailErrorMessage(error: unknown) {
  const mailError = error as {
    code?: string;
    command?: string;
    response?: string;
    responseCode?: number;
    message?: string;
  };

  console.error("[Rovix email verification]", {
    code: mailError.code,
    command: mailError.command,
    responseCode: mailError.responseCode,
    message: mailError.message
  });

  if (mailError.code === "EAUTH" || mailError.responseCode === 534 || mailError.responseCode === 535) {
    return "Falha ao autenticar no Gmail. Confira SUPPORT_EMAIL_USER e SUPPORT_EMAIL_APP_PASSWORD na Vercel, sem espacos, e faca redeploy.";
  }

  if (mailError.code === "ECONNECTION" || mailError.code === "ETIMEDOUT" || mailError.code === "ESOCKET") {
    return "Nao foi possivel conectar ao Gmail agora. Tente novamente em alguns minutos.";
  }

  if (mailError.responseCode === 550 || mailError.responseCode === 553) {
    return "O Gmail recusou o endereco de destino. Confira se o e-mail digitado existe.";
  }

  return "Nao foi possivel enviar o codigo agora.";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmailCodePayload;
    const email = normalizeEmail(payload.email || "");
    const purpose = payload.purpose || "register";

    if (!["register", "change-email", "login", "verify-email"].includes(purpose)) {
      return NextResponse.json({ error: "Tipo de verificacao invalido." }, { status: 400 });
    }

    const emailError = getEmailValidationError(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    if (!process.env.SUPPORT_EMAIL_USER || !process.env.SUPPORT_EMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Verificacao por e-mail ainda nao esta configurada no servidor." },
        { status: 500 }
      );
    }

    const code = createEmailCode();
    const token = createEmailVerificationToken(email, purpose, code);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SUPPORT_EMAIL_USER,
        pass: process.env.SUPPORT_EMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Rovix Store" <${process.env.SUPPORT_EMAIL_USER}>`,
      to: email,
      subject: "Codigo de verificacao - Rovix Store",
      text: [
        "Rovix Store",
        "",
        `Use este codigo para ${purposeLabels[purpose]}:`,
        "",
        code,
        "",
        "O codigo expira em 10 minutos.",
        "Se voce nao pediu isso, ignore este e-mail."
      ].join("\n")
    });

    return NextResponse.json({ ok: true, token, expiresInSeconds: 600 });
  } catch (error) {
    return NextResponse.json({ error: getMailErrorMessage(error) }, { status: 500 });
  }
}
