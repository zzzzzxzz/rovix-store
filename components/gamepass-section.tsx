"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crown,
  Gamepad2,
  RotateCcw,
  ShipWheel,
  ShoppingCart,
  Sparkles,
  Swords,
  TerminalSquare,
  Ticket,
  Zap
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { gamepassGames, gamepassProducts, getProductLabel } from "@/lib/products";
import type { Product } from "@/lib/types";

type GamepassSectionProps = {
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
};

const iconMap = {
  banknote: Banknote,
  bell: BellRing,
  coins: Coins,
  crown: Crown,
  rotate: RotateCcw,
  ship: ShipWheel,
  skip: Zap,
  sparkles: Sparkles,
  sword: Swords,
  swords: Swords,
  terminal: TerminalSquare,
  ticket: Ticket,
  vip: Crown
};

function getIcon(product: Product) {
  const Icon = iconMap[product.icon as keyof typeof iconMap];
  return Icon || Sparkles;
}

function getSlotNumber(product: Product) {
  const match = product.icon?.match(/\d+/);
  return match?.[0] || "";
}

export function GamepassSection({ onAddToCart, onBuyNow }: GamepassSectionProps) {
  const [activeGame, setActiveGame] = useState(gamepassGames[0]?.slug || "");
  const tabsRef = useRef<HTMLDivElement>(null);
  const currentGame = gamepassGames.find((game) => game.slug === activeGame) || gamepassGames[0];
  const activeProducts = useMemo(
    () => gamepassProducts.filter((product) => product.gameSlug === activeGame),
    [activeGame]
  );

  function scrollTabs(direction: "left" | "right") {
    tabsRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth"
    });
  }

  return (
    <section id="gamepasses" className="relative overflow-hidden border-y border-white/10 bg-black/45 px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-16 h-80 w-80 rounded-full bg-rovix-gold/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-rovix-gold">Gamepasses Roblox</p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-tight sm:text-5xl">
              Passes premium para seus jogos favoritos
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-white/58">
              Escolha o jogo, adicione suas gamepasses ao carrinho e finalize pelo mesmo checkout PIX da Rovix.
            </p>
          </div>

          <div className="flex max-w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              aria-label="Mover jogos para a esquerda"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/55 text-white/70 transition hover:border-rovix-gold/60 hover:bg-rovix-gold hover:text-black"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={tabsRef}
              className="flex max-w-[min(100vw-9rem,48rem)] gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {gamepassGames.map((game) => {
                const selected = game.slug === activeGame;

                return (
                  <button
                    key={game.slug}
                    type="button"
                    onClick={() => setActiveGame(game.slug)}
                    className={`shrink-0 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.06em] transition ${
                      selected
                        ? "bg-rovix-gold text-black shadow-gold"
                        : "text-white/62 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {game.name}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollTabs("right")}
              aria-label="Mover jogos para a direita"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/55 text-white/70 transition hover:border-rovix-gold/60 hover:bg-rovix-gold hover:text-black"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <motion.div
          key={currentGame.slug}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${currentGame.accent} p-[1px] shadow-gold`}
        >
          <div className="grid gap-6 rounded-3xl bg-[#080808]/95 p-5 sm:p-7 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div>
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-rovix-gold text-black shadow-gold">
                  <Gamepad2 className="h-8 w-8" />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-rovix-gold">Jogo selecionado</p>
                <h3 className="mt-2 font-display text-4xl font-black uppercase leading-none">{currentGame.name}</h3>
                <p className="mt-4 text-sm font-bold leading-6 text-white/58">{currentGame.description}</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-white/35">Passes</p>
                  <p className="mt-2 text-2xl font-black text-rovix-gold">{activeProducts.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-white/35">A partir de</p>
                  <p className="mt-2 text-2xl font-black text-rovix-gold">
                    {formatCurrency(Math.min(...activeProducts.map((product) => product.price)))}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeProducts.map((product, index) => (
                <GamepassCard
                  key={product.id}
                  product={product}
                  index={index}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function GamepassCard({
  product,
  index,
  onAddToCart,
  onBuyNow
}: {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}) {
  const Icon = getIcon(product);
  const slotNumber = getSlotNumber(product);

  return (
    <motion.article
      className="group rounded-3xl border border-white/10 bg-black/45 p-4 transition duration-300 hover:-translate-y-1 hover:border-rovix-gold/45 hover:shadow-gold"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35, delay: index * 0.035 }}
    >
      <div className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${product.accent || "from-rovix-gold to-orange-600"} p-[1px]`}>
        <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-2xl bg-[#202126]">
          <div className={`absolute inset-0 bg-gradient-to-br ${product.accent || "from-rovix-gold to-orange-600"} opacity-65`} />
          <div className="absolute inset-5 rounded-full border-4 border-black/25 bg-black/25 shadow-inner" />
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/18 blur-2xl" />
          {slotNumber && (
            <span className="absolute left-5 top-4 font-display text-5xl font-black text-black/45">{slotNumber}</span>
          )}
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-white/25 bg-black/30 text-white shadow-2xl transition duration-300 group-hover:scale-105">
            <Icon className="h-12 w-12 drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-rovix-gold px-3 py-1 text-[11px] font-black uppercase text-black">
            {product.badge}
          </span>
          <span className="truncate text-xs font-black uppercase tracking-[0.12em] text-white/38">{product.game}</span>
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[3.1rem] font-display text-2xl font-black uppercase leading-[1.05]">
          {getProductLabel(product)}
        </h3>
        <p className="mt-3 text-3xl font-black text-rovix-gold">{formatCurrency(product.price)}</p>

        <div className="mt-4 grid gap-2">
          <Button onClick={() => onAddToCart(product)} className="min-h-11 w-full">
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </Button>
          <button
            onClick={() => onBuyNow(product)}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/12 px-4 text-xs font-black uppercase tracking-[0.08em] text-white/70 transition hover:border-rovix-gold/60 hover:text-rovix-gold"
          >
            Comprar agora
          </button>
        </div>
      </div>
    </motion.article>
  );
}
