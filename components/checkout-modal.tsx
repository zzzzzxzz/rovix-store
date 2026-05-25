"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Copy, Loader2, PartyPopper, ShieldCheck, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { RovixUser } from "@/lib/auth-store";
import { getCartLines, getCartSummary, type CartItem } from "@/lib/cart";
import { getPixReceiver } from "@/lib/pix-emv";
import { createLocalOrder } from "@/lib/orders";
import { formatCurrency, formatRobux } from "@/lib/format";
import { getProductContext, getProductLabel } from "@/lib/products";
import type { CheckoutForm, Order, PixPayment, Product } from "@/lib/types";
import { usePaymentStatus } from "@/hooks/use-payment-status";

type CheckoutModalProps = {
  product: Product | null;
  quantity?: number;
  cartItems?: CartItem[];
  accountUser?: RovixUser | null;
  onClose: () => void;
  onApproved?: () => void;
};

export function CheckoutModal({ product, quantity = 1, cartItems = [], accountUser, onClose, onApproved }: CheckoutModalProps) {
  const [form, setForm] = useState<CheckoutForm>({
    username: accountUser?.name || "",
    email: accountUser?.email || "",
    document: ""
  });
  const [payment, setPayment] = useState<PixPayment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { status, error: statusError } = usePaymentStatus(payment?.id);
  const cartLines = useMemo(() => getCartLines(cartItems), [cartItems]);
  const cartSummary = useMemo(() => getCartSummary(cartItems), [cartItems]);
  const isCartCheckout = cartLines.length > 0;
  const normalizedQuantity = Math.max(1, Math.min(20, Math.floor(quantity)));
  const checkoutProduct = useMemo<Product | null>(() => {
    if (cartLines.length > 0) {
      return {
        id: "cart-checkout",
        kind: "cart",
        title: "Carrinho Rovix",
        amount: cartSummary.robux,
        price: cartSummary.subtotal,
        badge: "Carrinho",
        itemCount: cartSummary.quantity,
        gamepassCount: cartSummary.gamepasses
      };
    }

    if (!product) return null;

    return {
      ...product,
      amount: product.amount * normalizedQuantity,
      price: Number((product.price * normalizedQuantity).toFixed(2)),
      badge: normalizedQuantity > 1 ? `${normalizedQuantity} itens` : product.badge,
      itemCount: normalizedQuantity,
      gamepassCount: product.kind === "gamepass" ? normalizedQuantity : 0
    };
  }, [cartLines.length, cartSummary.gamepasses, cartSummary.quantity, cartSummary.robux, cartSummary.subtotal, normalizedQuantity, product]);

  const approved = status === "approved";
  const checkoutTitle = checkoutProduct ? getProductLabel(checkoutProduct) : "";
  const checkoutContext = checkoutProduct ? getProductContext(checkoutProduct) : "";
  const cartSummaryLabel =
    cartSummary.robux > 0 && cartSummary.gamepasses > 0
      ? `${formatRobux(cartSummary.robux)} Robux + ${cartSummary.gamepasses} gamepass${cartSummary.gamepasses === 1 ? "" : "es"}`
      : cartSummary.robux > 0
        ? `${formatRobux(cartSummary.robux)} Robux`
        : `${cartSummary.gamepasses} gamepass${cartSummary.gamepasses === 1 ? "" : "es"}`;

  useEffect(() => {
    if (!approved || !checkoutProduct || !payment || order) return;
    const created = createLocalOrder(checkoutProduct, form, payment.id);
    setOrder(created);
    onApproved?.();
    toast.success("Pagamento aprovado com sucesso!");
  }, [approved, checkoutProduct, form, onApproved, order, payment]);

  useEffect(() => {
    if (!checkoutProduct) {
      setPayment(null);
      setOrder(null);
      setError("");
      setForm({ username: "", email: "", document: "" });
    }
  }, [checkoutProduct]);

  useEffect(() => {
    if (!accountUser || payment) return;

    setForm((current) => ({
      ...current,
      username: accountUser.name,
      email: accountUser.email
    }));
  }, [accountUser, payment]);

  const qrSource = useMemo(() => {
    if (!payment) return "";
    if (payment.qrCode.startsWith("http") || payment.qrCode.startsWith("data:")) return payment.qrCode;
    return `data:image/png;base64,${payment.qrCode}`;
  }, [payment]);
  const pixReceiver = useMemo(() => (payment?.copyPaste ? getPixReceiver(payment.copyPaste) : null), [payment?.copyPaste]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checkoutProduct) return;

    if (!accountUser) {
      const message = "Faca login ou crie uma conta para gerar o PIX.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 35_000);

    try {
      const payload = isCartCheckout
        ? {
            items: cartLines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
            ...form
          }
        : {
            productId: product?.id,
            quantity: normalizedQuantity,
            ...form
          };

      const response = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const data = (await response.json()) as { payment?: PixPayment; error?: string };

      if (!response.ok || !data.payment) throw new Error(data.error || "Erro ao gerar PIX.");
      setPayment(data.payment);
      toast.success("PIX gerado. Aguardando pagamento.");
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "A gateway demorou para responder. Tente gerar o PIX novamente."
          : err instanceof Error
            ? err.message
            : "Erro ao gerar PIX.";
      setError(message);
      toast.error(message);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!payment?.copyPaste) return;
    await navigator.clipboard.writeText(payment.copyPaste);
    toast.success("Código PIX copiado.");
  }

  return (
    <AnimatePresence>
      {checkoutProduct && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="premium-card gold-border relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 sm:p-7"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
          >
            <button
              aria-label="Fechar checkout"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/8 p-2 text-white/70 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">Checkout PIX</p>
              <h2 className="mt-2 font-display text-3xl font-black uppercase text-white sm:text-4xl">
                {checkoutTitle}
              </h2>
              <p className="mt-2 text-white/65">
                {isCartCheckout
                  ? `${cartSummaryLabel} em ${cartSummary.quantity} item${cartSummary.quantity === 1 ? "" : "s"}. `
                  : normalizedQuantity > 1
                    ? `${normalizedQuantity} itens selecionados. `
                    : `${checkoutContext}. `}
                Total: <span className="font-black text-rovix-gold">{formatCurrency(checkoutProduct.price)}</span>
              </p>
            </div>

            {!payment ? (
              <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                {isCartCheckout && (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/45">Itens do carrinho</p>
                    <div className="grid gap-2">
                      {cartLines.map((line) => (
                        <div key={line.productId} className="flex items-center justify-between gap-3 text-sm font-bold">
                          <span className="text-white/70">
                            {line.quantity}x {getProductLabel(line.product)}
                          </span>
                          <span className="text-rovix-gold">{formatCurrency(line.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label className="grid gap-2 text-sm font-bold text-white/80">
                  Username Roblox
                  <input
                    required
                    minLength={3}
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.trim() }))}
                    className="h-[52px] rounded-xl border border-white/12 bg-black/45 px-4 text-white outline-none transition focus:border-rovix-gold"
                    placeholder="Seu usuário no Roblox"
                  />
                  <span className="text-xs font-bold text-white/45">
                    Voce pode alterar o username antes de pagar. Confira bem, pois e por ele que sua entrega sera localizada.
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-bold text-white/80">
                  E-mail
                  <input
                    required
                    type="email"
                    value={form.email}
                    readOnly={Boolean(accountUser)}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="h-[52px] rounded-xl border border-white/12 bg-black/45 px-4 text-white outline-none transition read-only:cursor-not-allowed read-only:border-rovix-gold/30 read-only:text-white/70 focus:border-rovix-gold"
                    placeholder="voce@email.com"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-white/80">
                  CPF ou CNPJ
                  <input
                    required
                    minLength={11}
                    value={form.document}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, document: event.target.value.replace(/\D/g, "").slice(0, 14) }))
                    }
                    className="h-[52px] rounded-xl border border-white/12 bg-black/45 px-4 text-white outline-none transition focus:border-rovix-gold"
                    placeholder="Somente números"
                    inputMode="numeric"
                  />
                </label>
                {error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
                <Button type="submit" disabled={loading} className="mt-2 w-full">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Gerar PIX
                </Button>
              </form>
            ) : approved ? (
              <PaymentApprovedView order={order} onClose={onClose} />
            ) : (
              <div className="mt-7 grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="rounded-2xl border border-white/12 bg-white p-3 shadow-gold">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrSource} alt="QR Code PIX" className="aspect-square w-full rounded-xl object-cover" />
                </div>
                <div className="grid content-start gap-4">
                  <div className="rounded-2xl border border-white/12 bg-black/45 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Status</p>
                    <div className="mt-2 flex items-center gap-2 text-lg font-black">
                      {approved ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-rovix-gold" />
                          Pagamento aprovado com sucesso!
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-rovix-gold" />
                          Aguardando pagamento em tempo real
                        </>
                      )}
                    </div>
                  </div>
                  {pixReceiver?.name && (
                    <div className="rounded-2xl border border-rovix-gold/25 bg-rovix-gold/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-rovix-gold">Recebedor do PIX</p>
                      <p className="mt-2 break-words text-sm font-black text-white">{pixReceiver.name.replace(/_/g, " ")}</p>
                      <p className="mt-1 text-xs font-bold text-white/55">
                        {pixReceiver.city ? `${pixReceiver.city.replace(/_/g, " ")}` : "Cidade nao informada"}
                        {pixReceiver.country ? `, ${pixReceiver.country}` : ""}
                      </p>
                      <p className="mt-3 text-xs font-bold leading-5 text-white/60">
                        Confira esse nome no app do banco antes de pagar.
                      </p>
                    </div>
                  )}
                  <div className="rounded-2xl border border-white/12 bg-black/45 p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">Copia e cola</p>
                    <p className="max-h-24 overflow-hidden break-all text-xs text-white/70">{payment.copyPaste}</p>
                  </div>
                  <Button onClick={copyPix} variant="dark">
                    <Copy className="h-5 w-5" />
                    Copiar código
                  </Button>
                  {statusError && <p className="text-sm text-red-200">{statusError}</p>}
                  {order && (
                    <div className="rounded-2xl border border-rovix-gold/35 bg-rovix-gold/10 p-4 text-sm text-white">
                      <p className="font-black text-rovix-gold">Seu pedido foi enviado para processamento.</p>
                      <p className="mt-1 text-white/70">ID do pedido: {order.id}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaymentApprovedView({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <motion.div
      className="relative mt-7 overflow-hidden rounded-3xl border border-rovix-gold/35 bg-rovix-gold/10 p-6 text-center shadow-gold"
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, index) => (
          <motion.span
            key={index}
            className="absolute h-2 w-2 rounded-full bg-rovix-gold"
            style={{
              left: `${8 + ((index * 17) % 84)}%`,
              top: `${12 + ((index * 29) % 72)}%`
            }}
            initial={{ opacity: 0, y: 12, scale: 0.3 }}
            animate={{ opacity: [0, 1, 0], y: [-8, -34, -52], rotate: [0, 120, 240], scale: [0.6, 1, 0.4] }}
            transition={{ duration: 1.8, delay: index * 0.05, repeat: 1 }}
          />
        ))}
      </div>

      <motion.div
        className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-rovix-gold text-black shadow-gold-strong"
        initial={{ scale: 0, rotate: -18 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-rovix-gold">Pagamento aprovado</p>
        <h3 className="mt-2 font-display text-3xl font-black uppercase text-white sm:text-4xl">Tudo certo!</h3>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-white/70">
          Seu pedido foi enviado para processamento. Agora é só aguardar nossa equipe finalizar a entrega.
        </p>
      </motion.div>

      {order && (
        <motion.div
          className="relative mt-6 rounded-2xl border border-white/12 bg-black/35 p-4 text-left"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">ID do pedido</p>
          <p className="mt-2 break-all text-sm font-black text-rovix-gold">{order.id}</p>
        </motion.div>
      )}

      <motion.button
        onClick={onClose}
        className="relative mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rovix-gold px-5 text-sm font-black uppercase tracking-[0.08em] text-black shadow-gold transition hover:bg-[#ffe45a] sm:w-fit"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <PartyPopper className="h-5 w-5" />
        Fechar checkout
      </motion.button>
    </motion.div>
  );
}
