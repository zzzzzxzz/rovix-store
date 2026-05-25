"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock3, History, PackageCheck, ReceiptText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRobux } from "@/lib/format";
import { getLocalOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";

type PurchaseHistoryModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PurchaseHistoryModal({ open, onClose }: PurchaseHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (open) setOrders(getLocalOrders());
  }, [open]);

  const total = useMemo(
    () =>
      orders.reduce(
        (summary, order) => ({
          value: Number((summary.value + order.value).toFixed(2)),
          robux: summary.robux + order.productAmount,
          gamepasses: summary.gamepasses + (order.productGamepassCount || (order.productKind === "gamepass" ? 1 : 0))
        }),
        { value: 0, robux: 0, gamepasses: 0 }
      ),
    [orders]
  );
  const totalLabel =
    total.robux > 0 && total.gamepasses > 0
      ? `${formatRobux(total.robux)} Robux + ${total.gamepasses} gamepass${total.gamepasses === 1 ? "" : "es"}`
      : total.robux > 0
        ? `${formatRobux(total.robux)} Robux`
        : `${total.gamepasses} gamepass${total.gamepasses === 1 ? "" : "es"}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/78 p-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="premium-card gold-border relative w-full max-w-4xl rounded-3xl p-5 sm:p-7"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
          >
            <button
              aria-label="Fechar histórico"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.08] p-2 text-white/70 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">Histórico</p>
              <h2 className="mt-2 font-display text-3xl font-black uppercase text-white sm:text-4xl">
                Suas compras
              </h2>
              <p className="mt-2 max-w-xl text-sm font-bold leading-6 text-white/55">
                Pedidos aprovados neste navegador aparecem aqui com ID, valor e status.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-white/10 bg-black/35 p-8 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-rovix-gold/10 text-rovix-gold shadow-gold">
                  <History className="h-9 w-9" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-black uppercase">Nenhuma compra ainda</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-6 text-white/55">
                  Quando um pagamento PIX for aprovado, o pedido será salvo automaticamente no histórico.
                </p>
                <Button onClick={onClose} className="mt-6">Voltar para loja</Button>
              </div>
            ) : (
              <>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/40">
                      <ReceiptText className="h-4 w-4" />
                      Total comprado
                    </p>
                    <p className="mt-3 font-display text-3xl font-black uppercase text-rovix-gold">
                      {totalLabel}
                    </p>
                    <p className="mt-1 text-sm font-bold text-white/50">{formatCurrency(total.value)} em pedidos</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/40">
                      <PackageCheck className="h-4 w-4" />
                      Pedidos salvos
                    </p>
                    <p className="mt-3 font-display text-3xl font-black uppercase text-rovix-gold">
                      {orders.length}
                    </p>
                    <p className="mt-1 text-sm font-bold text-white/50">Neste dispositivo</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {orders.map((order, index) => (
                    <motion.article
                      key={order.id}
                      className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-rovix-gold/35"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-rovix-gold/25 bg-rovix-gold/10 px-3 py-1 text-xs font-black uppercase text-rovix-gold">
                              <Clock3 className="h-3.5 w-3.5" />
                              Em processamento
                            </span>
                            <span className="text-xs font-bold text-white/40">
                              {new Intl.DateTimeFormat("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short"
                              }).format(new Date(order.createdAt))}
                            </span>
                          </div>
                          <h3 className="mt-3 truncate font-display text-2xl font-black uppercase">
                            {order.productTitle || `${formatRobux(order.productAmount)} Robux`}
                          </h3>
                          {order.productGame && (
                            <p className="mt-1 truncate text-xs font-bold text-white/50">Jogo: {order.productGame}</p>
                          )}
                          <p className="mt-1 truncate text-xs font-bold text-rovix-gold">Username: {order.customerName}</p>
                          <p className="mt-1 break-all text-xs font-bold text-white/45">Pedido: {order.id}</p>
                          <p className="mt-1 break-all text-xs font-bold text-white/45">Pagamento: {order.paymentId}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left lg:min-w-[210px] lg:text-right">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Valor</p>
                          <p className="mt-1 text-2xl font-black text-rovix-gold">{formatCurrency(order.value)}</p>
                          <p className="mt-2 truncate text-xs font-bold text-white/45">{order.customerEmail}</p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
