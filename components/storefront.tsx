"use client";

import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Disc3,
  Headphones,
  History,
  Instagram,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserCircle,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { AuthModal } from "@/components/auth-modal";
import { CartModal } from "@/components/cart-modal";
import { CheckoutModal } from "@/components/checkout-modal";
import { FloatingCoins } from "@/components/floating-coins";
import { ProfileModal } from "@/components/profile-modal";
import { PurchaseHistoryModal } from "@/components/purchase-history-modal";
import { RobloxHero } from "@/components/roblox-hero";
import { SupportModal } from "@/components/support-modal";
import { TermsModal } from "@/components/terms-modal";
import { Button } from "@/components/ui/button";
import { clearSession, getSessionUser, type RovixUser } from "@/lib/auth-store";
import { addToCart, clearCart, getCartItems, getCartSummary, removeFromCart, type CartItem } from "@/lib/cart";
import { formatCurrency, formatRobux } from "@/lib/format";
import { products } from "@/lib/products";
import type { Product } from "@/lib/types";

const benefits = [
  { title: "Preços baixos", description: "Pacotes competitivos para comprar mais Robux pagando menos.", icon: BadgeDollarSign },
  { title: "Entrega rápida", description: "Pedido enviado para processamento assim que o PIX é aprovado.", icon: Zap },
  { title: "Compra segura", description: "Checkout protegido, status em tempo real e confirmação automática.", icon: ShieldCheck },
  { title: "Suporte ágil", description: "Canais de atendimento para acompanhar sua compra sem estresse.", icon: Headphones }
];

export function Storefront() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<"direct" | "cart" | "cart-line">("direct");
  const [checkoutProductId, setCheckoutProductId] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<RovixUser | null>(null);
  const cartSummary = useMemo(() => getCartSummary(cartItems), [cartItems]);

  useEffect(() => {
    setSessionUser(getSessionUser());
    setCartItems(getCartItems());
  }, []);

  function scrollToPrices() {
    document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
  }

  function openProductCheckout(product: Product, quantity = 1, mode: "direct" | "cart-line" = "direct") {
    setSelectedProduct(product);
    setSelectedQuantity(quantity);
    setSelectedCartItems([]);
    setCheckoutMode(mode);
    setCheckoutProductId(mode === "cart-line" ? product.id : "");
  }

  function openCartCheckout() {
    const currentItems = getCartItems();

    if (!currentItems.length) {
      toast.message("Seu carrinho está vazio.");
      return;
    }

    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedCartItems(currentItems);
    setCheckoutMode("cart");
    setCheckoutProductId("");
    setCartOpen(false);
  }

  function closeCheckout() {
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedCartItems([]);
    setCheckoutMode("direct");
    setCheckoutProductId("");
  }

  function handleAddToCart(product: Product) {
    const nextItems = addToCart(product.id);
    setCartItems(nextItems);
    toast.success(`${formatRobux(product.amount)} Robux adicionado ao carrinho.`);
  }

  function handleCheckoutApproved() {
    if (checkoutMode === "cart") {
      setCartItems(clearCart());
    }

    if (checkoutMode === "cart-line" && checkoutProductId) {
      setCartItems(removeFromCart(checkoutProductId));
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-rovix-ink text-white">
      <Toaster richColors position="top-right" theme="dark" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-rovix-gold/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-0 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-rovix-gold text-xl font-black text-black shadow-gold">
              R
            </span>
            <span className="font-display text-2xl font-black tracking-wide">ROVIX</span>
          </a>
          <div className="hidden items-center gap-7 text-sm font-bold text-white/70 md:flex">
            <a href="#beneficios" className="transition hover:text-rovix-gold">Benefícios</a>
            <a href="#precos" className="transition hover:text-rovix-gold">Preços</a>
            <a href="#suporte" className="transition hover:text-rovix-gold">Suporte</a>
          </div>
          <div className="flex items-center gap-2">
            {sessionUser ? (
              <AccountMenu
                user={sessionUser}
                open={accountOpen}
                onToggle={() => setAccountOpen((current) => !current)}
                onClose={() => setAccountOpen(false)}
                onProfile={() => {
                  setAccountOpen(false);
                  setProfileOpen(true);
                }}
                onSettings={() => {
                  setAccountOpen(false);
                  setProfileOpen(true);
                }}
                onHistory={() => {
                  setAccountOpen(false);
                  setHistoryOpen(true);
                }}
                onLogout={() => {
                  clearSession();
                  setSessionUser(null);
                  setAccountOpen(false);
                  toast.message("Voce saiu da conta.");
                }}
              />
            ) : (
              <Button variant="dark" onClick={() => setAuthOpen(true)} className="min-h-11 px-4">
                <UserCircle className="h-4 w-4" />
                Login
              </Button>
            )}
            <Button variant="dark" onClick={() => setHistoryOpen(true)} className="hidden min-h-11 px-4 lg:inline-flex">
              <History className="h-4 w-4" />
              Histórico
            </Button>
            <button
              aria-label="Abrir carrinho"
              onClick={() => setCartOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[0.08] text-white transition hover:border-rovix-gold/70 hover:bg-white/[0.12]"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartSummary.quantity > 0 && (
                <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-rovix-gold px-1 text-xs font-black text-black shadow-gold">
                  {cartSummary.quantity}
                </span>
              )}
            </button>
            <Button onClick={scrollToPrices} className="hidden min-h-11 px-4 sm:inline-flex">
              <ShoppingCart className="h-4 w-4" />
              Comprar
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative min-h-[calc(100vh-76px)] overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
        <FloatingCoins />
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-rovix-gold/30 bg-rovix-gold/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">
              <Sparkles className="h-4 w-4" />
              Loja premium Roblox
            </div>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-black uppercase leading-[0.95] sm:text-7xl lg:text-8xl">
              <span className="gold-text">Robux</span> barato, rápido e seguro
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/68 sm:text-xl">
              Compre Robux com checkout PIX automático, visual premium e acompanhamento do status em tempo real.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={scrollToPrices} className="text-base">
                <ShoppingCart className="h-5 w-5" />
                Comprar Agora
              </Button>
              <Button variant="dark" onClick={() => document.getElementById("beneficios")?.scrollIntoView({ behavior: "smooth" })}>
                <CheckCircle2 className="h-5 w-5" />
                Ver vantagens
              </Button>
            </div>
          </motion.div>
          <RobloxHero />
        </div>
      </section>

      <section className="border-y border-white/10 bg-rovix-gold py-3 text-black">
        <div className="flex w-[200%] animate-marquee gap-8 whitespace-nowrap font-display text-xl font-black uppercase tracking-wide">
          {[...Array(2)].flatMap((_, group) =>
            ["ROVIX STORE", "Robux premium", "PIX automático", "Entrega rápida", "Compra segura"].map((item) => (
              <span key={`${group}-${item}`} className="flex items-center gap-8">
                {item}
                <Disc3 className="h-5 w-5" />
              </span>
            ))
          )}
        </div>
      </section>

      <section id="beneficios" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-rovix-gold">Benefícios</p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Experiência de loja real</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.article
                  key={benefit.title}
                  className="premium-card rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-rovix-gold/50 hover:shadow-gold"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <div className="grid h-[52px] w-[52px] place-items-center rounded-xl bg-rovix-gold text-black shadow-gold">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black uppercase">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{benefit.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="precos" className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-rovix-gold">Tabela de preços</p>
              <h2 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Escolha seu pacote</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/60">
              Todos os pacotes usam checkout PIX com QR Code, copia e cola, estados de carregamento e acompanhamento automático.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {products.map((product, index) => (
              <motion.article
                key={product.id}
                className="gold-border premium-card group relative rounded-3xl p-5"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <span className="inline-flex rounded-full bg-rovix-gold px-3 py-1 text-xs font-black uppercase text-black">
                  {product.badge}
                </span>
                <div className="coin-face relative mx-auto mt-7 h-24 w-24 rounded-full transition duration-300 group-hover:scale-105" />
                <h3 className="mt-7 text-center font-display text-3xl font-black uppercase">
                  {formatRobux(product.amount)}
                  <span className="block text-base text-rovix-gold">Robux</span>
                </h3>
                <p className="mt-4 text-center text-3xl font-black">{formatCurrency(product.price)}</p>
                <Button onClick={() => handleAddToCart(product)} className="mt-6 w-full">
                  <ShoppingCart className="h-5 w-5" />
                  Adicionar
                </Button>
                <button
                  onClick={() => openProductCheckout(product)}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/12 px-4 text-sm font-black uppercase tracking-[0.08em] text-white/72 transition hover:border-rovix-gold/60 hover:text-rovix-gold"
                >
                  Comprar agora
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <footer id="suporte" className="border-t border-white/10 bg-black/60 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-rovix-gold font-black text-black">R</span>
              <span className="font-display text-xl font-black">ROVIX STORE</span>
            </div>
            <p className="mt-3 text-sm text-white/50">Rovix Store © 2026</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://discord.gg/xaVq8X6kWj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-rovix-gold hover:text-rovix-gold"
            >
              <MessageCircle className="h-4 w-4" />
              Discord
            </a>
            <a
              href="https://www.instagram.com/rovixstoreoficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-rovix-gold hover:text-rovix-gold"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
            <button
              onClick={() => setTermsOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-rovix-gold hover:text-rovix-gold"
            >
              <LockKeyhole className="h-4 w-4" />
              Termos
            </button>
            <button
              onClick={() => setSupportOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-rovix-gold hover:text-rovix-gold"
            >
              <Clock3 className="h-4 w-4" />
              Suporte
            </button>
          </div>
        </div>
      </footer>

      <CartModal
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onItemsChange={setCartItems}
        onCheckout={(product, quantity) => {
          setCartOpen(false);
          openProductCheckout(product, quantity, "cart-line");
        }}
        onCheckoutAll={openCartCheckout}
        onHistory={() => setHistoryOpen(true)}
      />
      <PurchaseHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <CheckoutModal
        product={selectedProduct}
        quantity={selectedQuantity}
        cartItems={selectedCartItems}
        onClose={closeCheckout}
        onApproved={handleCheckoutApproved}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthChange={setSessionUser} />
      <ProfileModal open={profileOpen} user={sessionUser} onClose={() => setProfileOpen(false)} onUserChange={setSessionUser} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </main>
  );
}

function AccountMenu({
  user,
  open,
  onToggle,
  onClose,
  onProfile,
  onSettings,
  onHistory,
  onLogout
}: {
  user: RovixUser;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onHistory: () => void;
  onLogout: () => void;
}) {
  const firstName = user.name.split(" ")[0] || "Cliente";
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [onClose, open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={onToggle}
        className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 pr-4 text-left transition hover:border-rovix-gold/60 hover:bg-white/[0.09]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-[#141414] text-sm font-black text-rovix-gold shadow-[0_0_0_1px_rgba(255,208,0,0.18)]">
          {user.avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarDataUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[140px] truncate text-sm font-black text-white">Olá, {firstName}</span>
          <span className="block text-xs font-bold text-white/45">Produtor</span>
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute right-0 top-[62px] z-50 w-[260px] overflow-hidden rounded-2xl border border-white/12 bg-[#070707] shadow-2xl shadow-black/60"
        >
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-[#141414] text-sm font-black text-rovix-gold shadow-[0_0_0_1px_rgba(255,208,0,0.18)]">
              {user.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarDataUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{user.name}</p>
              <p className="text-xs font-bold text-white/55">Produtor</p>
            </div>
          </div>
          <button onClick={onProfile} className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-black text-white transition hover:bg-white/8">
            <UserCircle className="h-4 w-4 text-white/80" />
            Meu Perfil
          </button>
          <button onClick={onSettings} className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-black text-white transition hover:bg-white/8">
            <Settings className="h-4 w-4 text-white/80" />
            Configurações
          </button>
          <button onClick={onHistory} className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-black text-white transition hover:bg-white/8">
            <History className="h-4 w-4 text-white/80" />
            Histórico de compras
          </button>
          <button onClick={onLogout} className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-4 text-left text-sm font-black text-red-200 transition hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </motion.div>
      )}
    </div>
  );
}
