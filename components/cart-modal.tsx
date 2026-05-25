"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, History, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearCart,
  getCartLines,
  getCartSummary,
  removeFromCart,
  updateCartItem,
  type CartItem
} from "@/lib/cart";
import { formatCurrency, formatRobux } from "@/lib/format";
import { getProductContext, getProductLabel } from "@/lib/products";
import type { Product } from "@/lib/types";

type CartModalProps = {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onItemsChange: (items: CartItem[]) => void;
  onCheckout: (product: Product, quantity: number) => void;
  onCheckoutAll: () => void;
  onHistory: () => void;
};

export function CartModal({
  open,
  items,
  onClose,
  onItemsChange,
  onCheckout,
  onCheckoutAll,
  onHistory
}: CartModalProps) {
  const lines = getCartLines(items);
  const summary = getCartSummary(items);
  const summaryLabel =
    summary.robux > 0 && summary.gamepasses > 0
      ? `${formatRobux(summary.robux)} Robux + ${summary.gamepasses} gamepass${summary.gamepasses === 1 ? "" : "es"}`
      : summary.robux > 0
        ? `${formatRobux(summary.robux)} Robux`
        : `${summary.gamepasses} gamepass${summary.gamepasses === 1 ? "" : "es"}`;

  function handleQuantity(productId: string, quantity: number) {
    onItemsChange(updateCartItem(productId, quantity));
  }

  function handleRemove(productId: string) {
    onItemsChange(removeFromCart(productId));
    toast.message("Pacote removido do carrinho.");
  }

  function handleClear() {
    onItemsChange(clearCart());
    toast.message("Carrinho limpo.");
  }

  function openHistory() {
    onClose();
    onHistory();
  }

  function choosePackages() {
    onClose();
    window.setTimeout(() => {
      document.getElementById("precos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  return (
    <AnimatePresence>
      {open && (
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
            className="premium-card gold-border relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-5 sm:p-7"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
          >
            <button
              aria-label="Fechar carrinho"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.08] p-2 text-white/70 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">Carrinho Rovix</p>
              <h2 className="mt-2 font-display text-3xl font-black uppercase text-white sm:text-4xl">
                Seus pacotes
              </h2>
              <p className="mt-2 max-w-xl text-sm font-bold leading-6 text-white/55">
                Revise seus itens antes de gerar o PIX. O carrinho fica salvo neste navegador.
              </p>
            </div>

            {lines.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-white/10 bg-black/35 p-8 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-rovix-gold/10 text-rovix-gold shadow-gold">
                  <ShoppingCart className="h-9 w-9" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-black uppercase">Carrinho vazio</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-6 text-white/55">
                  Adicione um pacote ou uma gamepass para finalizar sua compra por PIX.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button onClick={choosePackages}>Escolher pacotes</Button>
                  <Button variant="dark" onClick={openHistory}>
                    <History className="h-5 w-5" />
                    Histórico
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-8 grid gap-3">
                  {lines.map((line) => (
                    <motion.article
                      key={line.productId}
                      layout
                      className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-rovix-gold/35"
                    >
                      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="flex items-center gap-4">
                          <div className="coin-face h-16 w-16 shrink-0 rounded-full" />
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-rovix-gold">
                              {getProductContext(line.product)}
                            </p>
                            <h3 className="mt-1 truncate font-display text-2xl font-black uppercase">
                              {getProductLabel(line.product)}
                            </h3>
                            <p className="mt-1 text-sm font-bold text-white/55">
                              {formatCurrency(line.product.price)} por item
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
                          <div className="flex h-11 items-center justify-between rounded-xl border border-white/12 bg-white/[0.06] px-2">
                            <button
                              aria-label="Diminuir quantidade"
                              onClick={() => handleQuantity(line.productId, line.quantity - 1)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-black">{line.quantity}</span>
                            <button
                              aria-label="Aumentar quantidade"
                              onClick={() => handleQuantity(line.productId, line.quantity + 1)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-left sm:min-w-[132px] sm:text-right">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Total</p>
                            <p className="mt-1 text-xl font-black text-rovix-gold">{formatCurrency(line.total)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                        <p className="text-sm font-bold text-white/50">
                          {line.product.kind === "gamepass"
                            ? `${line.quantity} gamepass${line.quantity === 1 ? "" : "es"} nesta linha.`
                            : `${formatRobux(line.robuxTotal)} Robux no total desta linha.`}
                        </p>
                        <Button variant="dark" onClick={() => onCheckout(line.product, line.quantity)} className="min-h-11">
                          <CreditCard className="h-4 w-4" />
                          Comprar item
                        </Button>
                        <button
                          aria-label="Remover pacote"
                          onClick={() => handleRemove(line.productId)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-400/25 px-4 text-sm font-black uppercase tracking-[0.08em] text-red-200 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-rovix-gold/25 bg-rovix-gold/10 p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-rovix-gold">Resumo</p>
                      <h3 className="mt-2 font-display text-3xl font-black uppercase">
                        {summaryLabel}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-white/60">
                        {summary.quantity} item{summary.quantity === 1 ? "" : "s"} no carrinho.
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">Subtotal</p>
                      <p className="mt-1 text-3xl font-black text-rovix-gold">{formatCurrency(summary.subtotal)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <Button onClick={onCheckoutAll}>
                      <CreditCard className="h-5 w-5" />
                      Finalizar carrinho
                    </Button>
                    <Button variant="dark" onClick={openHistory}>
                      <History className="h-5 w-5" />
                      Histórico
                    </Button>
                    <Button variant="dark" onClick={handleClear}>
                      <Trash2 className="h-5 w-5" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
