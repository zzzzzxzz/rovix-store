import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const supportEmail = "rovixstoresupport@gmail.com";

type SupportPayload = {
  name?: string;
  email?: string;
  category?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SupportPayload;
    const name = payload.name?.trim();
    const email = payload.email?.trim();
    const category = payload.category?.trim();
    const subject = payload.subject?.trim();
    const message = payload.message?.trim();

    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json({ error: "Preencha todos os campos do ticket." }, { status: 400 });
    }

    if (!process.env.SUPPORT_EMAIL_USER || !process.env.SUPPORT_EMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Envio de suporte ainda não está configurado no servidor." },
        { status: 500 }
      );
    }

    const ticketId = `RVX-${Date.now().toString(36).toUpperCase()}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SUPPORT_EMAIL_USER,
        pass: process.env.SUPPORT_EMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Rovix Store" <${process.env.SUPPORT_EMAIL_USER}>`,
      to: supportEmail,
      replyTo: email,
      subject: `[${ticketId}] ${category} - ${subject}`,
      text: [
        "Novo ticket de suporte - Rovix Store",
        "",
        `ID do ticket: ${ticketId}`,
        `Nome: ${name}`,
        `E-mail: ${email}`,
        `Categoria: ${category}`,
        `Assunto: ${subject}`,
        "",
        "Descrição do problema:",
        message,
        "",
        "Enviado pelo site Rovix Store."
      ].join("\n")
    });

    return NextResponse.json({ ok: true, ticketId });
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar o ticket agora." }, { status: 500 });
  }
}
