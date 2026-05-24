import { NextResponse } from "next/server";
import { getPixPaymentStatus } from "@/lib/pix-service";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await getPixPaymentStatus(params.id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao consultar pagamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
