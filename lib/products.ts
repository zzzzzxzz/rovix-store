import type { Product } from "@/lib/types";

export const robuxProducts: Product[] = [
  { id: "robux-400", kind: "robux", title: "400 Robux", amount: 400, price: 10, badge: "Entrada" },
  { id: "robux-1000", kind: "robux", title: "1.000 Robux", amount: 1000, price: 28, badge: "Popular" },
  { id: "robux-2000", kind: "robux", title: "2.000 Robux", amount: 2000, price: 52, badge: "Mais valor" },
  { id: "robux-3000", kind: "robux", title: "3.000 Robux", amount: 3000, price: 76, badge: "Premium" },
  { id: "robux-5000", kind: "robux", title: "5.000 Robux", amount: 5000, price: 98, badge: "Oferta top" }
];

export const gamepassGames = [
  {
    slug: "blade-ball",
    name: "Blade Ball",
    description: "Passes rápidos para evoluir seu jogo com vantagens premium.",
    accent: "from-amber-300 via-orange-500 to-red-500"
  },
  {
    slug: "blox-fruits",
    name: "Blox Fruits",
    description: "Boosts, barcos, lâmina e notificador para sua jornada.",
    accent: "from-lime-300 via-emerald-500 to-cyan-500"
  },
  {
    slug: "brainrot",
    name: "Roube um Brainrot",
    description: "VIP, dinheiro em dobro e comandos para quem quer dominar.",
    accent: "from-fuchsia-400 via-violet-500 to-sky-500"
  },
  {
    slug: "volleyball-legends",
    name: "Volleyball Legends",
    description: "Slots extras, VIP e recursos para montar seu melhor setup.",
    accent: "from-yellow-300 via-orange-500 to-purple-500"
  },
  {
    slug: "strongest-battlegrounds",
    name: "The Strongest Battlegrounds",
    description: "Acesso antecipado, VIP, emotes e vantagens para batalhas premium.",
    accent: "from-red-400 via-orange-500 to-yellow-400"
  },
  {
    slug: "jujutsu-shenanigans",
    name: "Jujutsu Shenanigans",
    description: "Passes de emote, saves, roupas e acesso antecipado para jogar com estilo.",
    accent: "from-violet-400 via-fuchsia-500 to-red-500"
  },
  {
    slug: "murder-mystery-2",
    name: "Murder Mystery 2",
    description: "Passes clássicos para deixar sua conta mais completa no MM2.",
    accent: "from-sky-300 via-blue-600 to-indigo-900"
  }
];

export const gamepassProducts: Product[] = [
  { id: "gp-blade-vip", kind: "gamepass", title: "VIP", game: "Blade Ball", gameSlug: "blade-ball", amount: 0, price: 3.5, badge: "Passe", icon: "crown", accent: "from-yellow-300 via-orange-500 to-amber-700" },
  { id: "gp-blade-moedas-dobro", kind: "gamepass", title: "Moedas em Dobro", game: "Blade Ball", gameSlug: "blade-ball", amount: 0, price: 3.5, badge: "Boost", icon: "coins", accent: "from-yellow-300 via-red-500 to-rose-700" },
  { id: "gp-blade-placa-troca", kind: "gamepass", title: "Placa de Troca", game: "Blade Ball", gameSlug: "blade-ball", amount: 0, price: 2, badge: "Utilidade", icon: "ticket", accent: "from-cyan-300 via-blue-500 to-violet-700" },
  { id: "gp-blade-giro-instantaneo", kind: "gamepass", title: "Giro Instantâneo", game: "Blade Ball", gameSlug: "blade-ball", amount: 0, price: 2, badge: "Giro", icon: "rotate", accent: "from-lime-300 via-green-500 to-emerald-800" },

  { id: "gp-blox-2x-maestria", kind: "gamepass", title: "2x Maestria", game: "Blox Fruits", gameSlug: "blox-fruits", amount: 0, price: 11.5, badge: "Boost", icon: "swords", accent: "from-orange-300 via-yellow-500 to-red-600" },
  { id: "gp-blox-2x-dinheiro", kind: "gamepass", title: "2x Dinheiro", game: "Blox Fruits", gameSlug: "blox-fruits", amount: 0, price: 11.5, badge: "Boost", icon: "coins", accent: "from-lime-300 via-emerald-500 to-green-800" },
  { id: "gp-blox-barcos-rapidos", kind: "gamepass", title: "Barcos Rápidos", game: "Blox Fruits", gameSlug: "blox-fruits", amount: 0, price: 9, badge: "Mobilidade", icon: "ship", accent: "from-red-400 via-rose-600 to-slate-900" },
  { id: "gp-blox-queda-chefe", kind: "gamepass", title: "2x Queda de Chefe", game: "Blox Fruits", gameSlug: "blox-fruits", amount: 0, price: 9, badge: "Drop", icon: "sparkles", accent: "from-sky-300 via-blue-600 to-indigo-900" },
  { id: "gp-blox-lamina-negra", kind: "gamepass", title: "Lâmina Negra", game: "Blox Fruits", gameSlug: "blox-fruits", amount: 0, price: 30, badge: "Arma", icon: "sword", accent: "from-lime-300 via-green-600 to-black" },
  { id: "gp-blox-notificador-frutas", kind: "gamepass", title: "Notificador de Frutas", game: "Blox Fruits", gameSlug: "blox-fruits", amount: 0, price: 68, badge: "Premium", icon: "bell", accent: "from-emerald-300 via-lime-500 to-blue-700" },

  { id: "gp-brainrot-vip", kind: "gamepass", title: "VIP", game: "Roube um Brainrot", gameSlug: "brainrot", amount: 0, price: 2.5, badge: "Passe", icon: "vip", accent: "from-yellow-300 via-orange-500 to-amber-800" },
  { id: "gp-brainrot-dinheiro-x2", kind: "gamepass", title: "Dinheiro x2", game: "Roube um Brainrot", gameSlug: "brainrot", amount: 0, price: 4.5, badge: "Boost", icon: "banknote", accent: "from-lime-300 via-green-500 to-emerald-800" },
  { id: "gp-brainrot-admin", kind: "gamepass", title: "Comandos de Admin", game: "Roube um Brainrot", gameSlug: "brainrot", amount: 0, price: 140, badge: "Admin", icon: "terminal", accent: "from-slate-200 via-zinc-500 to-slate-900" },

  { id: "gp-volley-girar-pulando", kind: "gamepass", title: "Girar Pulando", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 1.5, badge: "Giro", icon: "skip", accent: "from-yellow-300 via-orange-500 to-red-600" },
  { id: "gp-volley-vip", kind: "gamepass", title: "VIP", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 7.5, badge: "Passe", icon: "vip", accent: "from-yellow-200 via-yellow-500 to-orange-700" },
  { id: "gp-volley-equip-3", kind: "gamepass", title: "Slot de Equipamento 3", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 3, badge: "Slot", icon: "slot-3", accent: "from-fuchsia-300 via-purple-600 to-black" },
  { id: "gp-volley-equip-4", kind: "gamepass", title: "Slot de Equipamento 4", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 5.5, badge: "Slot", icon: "slot-4", accent: "from-fuchsia-300 via-purple-600 to-black" },
  { id: "gp-volley-equip-5", kind: "gamepass", title: "Slot de Equipamento 5", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 9, badge: "Slot", icon: "slot-5", accent: "from-fuchsia-300 via-purple-600 to-black" },
  { id: "gp-volley-style-4", kind: "gamepass", title: "Slot de Estilo 4", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 3, badge: "Estilo", icon: "style-4", accent: "from-yellow-300 via-orange-500 to-black" },
  { id: "gp-volley-style-5", kind: "gamepass", title: "Slot de Estilo 5", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 5.5, badge: "Estilo", icon: "style-5", accent: "from-yellow-300 via-orange-500 to-black" },
  { id: "gp-volley-style-7", kind: "gamepass", title: "Slot de Estilo 7", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 9, badge: "Estilo", icon: "style-7", accent: "from-yellow-300 via-orange-500 to-black" },
  { id: "gp-volley-style-9", kind: "gamepass", title: "Slot de Estilo 9", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 9, badge: "Estilo", icon: "style-9", accent: "from-yellow-300 via-orange-500 to-black" },
  { id: "gp-volley-style-10", kind: "gamepass", title: "Slot de Estilo 10", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 9, badge: "Estilo", icon: "style-10", accent: "from-yellow-300 via-orange-500 to-black" },
  { id: "gp-volley-style-12", kind: "gamepass", title: "Slot de Estilo 12", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 9, badge: "Estilo", icon: "style-12", accent: "from-yellow-300 via-orange-500 to-black" },
  { id: "gp-volley-style-13", kind: "gamepass", title: "Slot de Estilo 13", game: "Volleyball Legends", gameSlug: "volleyball-legends", amount: 0, price: 9, badge: "Estilo", icon: "style-13", accent: "from-yellow-300 via-orange-500 to-black" },

  { id: "gp-strongest-acesso-antecipado", kind: "gamepass", title: "Acesso Antecipado", game: "The Strongest Battlegrounds", gameSlug: "strongest-battlegrounds", amount: 0, price: 7.5, badge: "Acesso", icon: "zap", accent: "from-yellow-300 via-orange-500 to-red-700" },
  { id: "gp-strongest-servidor-privado-plus", kind: "gamepass", title: "Servidor Privado+", game: "The Strongest Battlegrounds", gameSlug: "strongest-battlegrounds", amount: 0, price: 12.5, badge: "Servidor", icon: "terminal", accent: "from-slate-200 via-zinc-500 to-black" },
  { id: "gp-strongest-slots-emote", kind: "gamepass", title: "Slots Extras de Emote", game: "The Strongest Battlegrounds", gameSlug: "strongest-battlegrounds", amount: 0, price: 2.5, badge: "Emote", icon: "sparkles", accent: "from-pink-300 via-fuchsia-500 to-purple-800" },
  { id: "gp-strongest-vip", kind: "gamepass", title: "VIP", game: "The Strongest Battlegrounds", gameSlug: "strongest-battlegrounds", amount: 0, price: 7.5, badge: "Passe", icon: "vip", accent: "from-yellow-200 via-yellow-500 to-orange-700" },
  { id: "gp-strongest-som-kill", kind: "gamepass", title: "Som de Kill", game: "The Strongest Battlegrounds", gameSlug: "strongest-battlegrounds", amount: 0, price: 5, badge: "Som", icon: "bell", accent: "from-cyan-300 via-blue-500 to-indigo-800" },
  { id: "gp-strongest-segunda-pagina-emotes", kind: "gamepass", title: "Segunda Página de Emotes", game: "The Strongest Battlegrounds", gameSlug: "strongest-battlegrounds", amount: 0, price: 2.5, badge: "Emote", icon: "ticket", accent: "from-violet-300 via-purple-600 to-black" },
  { id: "gp-strongest-roupa-despertar", kind: "gamepass", title: "Roupa de Despertar", game: "The Strongest Battlegrounds", gameSlug: "strongest-battlegrounds", amount: 0, price: 2.5, badge: "Roupa", icon: "crown", accent: "from-red-300 via-orange-600 to-black" },

  { id: "gp-jujutsu-som-kill", kind: "gamepass", title: "Som de Kill Personalizado", game: "Jujutsu Shenanigans", gameSlug: "jujutsu-shenanigans", amount: 0, price: 2.5, badge: "Som", icon: "bell", accent: "from-cyan-300 via-blue-500 to-violet-800" },
  { id: "gp-jujutsu-acesso-antecipado", kind: "gamepass", title: "Acesso Antecipado", game: "Jujutsu Shenanigans", gameSlug: "jujutsu-shenanigans", amount: 0, price: 7.5, badge: "Acesso", icon: "zap", accent: "from-yellow-300 via-orange-500 to-red-700" },
  { id: "gp-jujutsu-slots-emote", kind: "gamepass", title: "Mais Slots de Emote", game: "Jujutsu Shenanigans", gameSlug: "jujutsu-shenanigans", amount: 0, price: 4, badge: "Emote", icon: "sparkles", accent: "from-pink-300 via-fuchsia-500 to-purple-800" },
  { id: "gp-jujutsu-roupas-despertar", kind: "gamepass", title: "Roupas de Despertar", game: "Jujutsu Shenanigans", gameSlug: "jujutsu-shenanigans", amount: 0, price: 2.5, badge: "Roupa", icon: "crown", accent: "from-red-300 via-orange-600 to-black" },
  { id: "gp-jujutsu-saves-construcao", kind: "gamepass", title: "Mais Saves de Construção", game: "Jujutsu Shenanigans", gameSlug: "jujutsu-shenanigans", amount: 0, price: 3.5, badge: "Save", icon: "ticket", accent: "from-lime-300 via-emerald-500 to-teal-800" },
  { id: "gp-jujutsu-segunda-pagina-emotes", kind: "gamepass", title: "Segunda Página de Emotes", game: "Jujutsu Shenanigans", gameSlug: "jujutsu-shenanigans", amount: 0, price: 4.5, badge: "Emote", icon: "ticket", accent: "from-violet-300 via-purple-600 to-black" },

  { id: "gp-mm2-elite", kind: "gamepass", title: "Elite", game: "Murder Mystery 2", gameSlug: "murder-mystery-2", amount: 0, price: 12.5, badge: "Elite", icon: "crown", accent: "from-yellow-200 via-yellow-500 to-orange-700" },
  { id: "gp-mm2-radio", kind: "gamepass", title: "Rádio", game: "Murder Mystery 2", gameSlug: "murder-mystery-2", amount: 0, price: 12, badge: "Som", icon: "bell", accent: "from-sky-300 via-blue-500 to-indigo-900" }
];

export const products: Product[] = [...robuxProducts, ...gamepassProducts];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getProductLabel(product: Product) {
  if (product.kind === "gamepass") return product.title || "Gamepass";
  if (product.kind === "cart") return product.title || "Carrinho Rovix";
  return product.title || `${product.amount} Robux`;
}

export function getProductContext(product: Product) {
  if (product.kind === "gamepass") return product.game || "Gamepass Roblox";
  if (product.kind === "cart") return "Pedido com multiplos itens";
  return "Robux";
}
