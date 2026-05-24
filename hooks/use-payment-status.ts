"use client";

import { useEffect, useState } from "react";
import type { PaymentStatus } from "@/lib/types";

export function usePaymentStatus(paymentId?: string) {
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) return;

    let cancelled = false;
    const check = async () => {
      try {
        const response = await fetch(`/api/pix/status/${paymentId}`, { cache: "no-store" });
        const data = (await response.json()) as { status?: PaymentStatus; error?: string };

        if (!response.ok) throw new Error(data.error || "Falha ao consultar pagamento.");
        if (!cancelled && data.status) setStatus(data.status);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao consultar pagamento.");
      }
    };

    void check();
    const timer = window.setInterval(check, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [paymentId]);

  return { status, error };
}
