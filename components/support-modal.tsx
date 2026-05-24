"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mail, Send, Ticket, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type SupportModalProps = {
  open: boolean;
  onClose: () => void;
};

const supportEmail = "rovixstoresupport@gmail.com";

export function SupportModal({ open, onClose }: SupportModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "Compra",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const raw = await response.text();
      let data: { ok?: boolean; ticketId?: string; error?: string };

      try {
        data = JSON.parse(raw) as { ok?: boolean; ticketId?: string; error?: string };
      } catch {
        throw new Error("O servidor respondeu em formato inválido. Reinicie o site e tente novamente.");
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Não foi possível enviar o ticket.");
      }

      toast.success(`Ticket ${data.ticketId} enviado com sucesso.`);
      setForm({ name: "", email: "", category: "Compra", subject: "", message: "" });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o ticket.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/84 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div className="mx-auto flex min-h-full max-w-3xl items-center py-6">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="w-full overflow-hidden rounded-2xl border border-white/12 bg-[#0d0d0d] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
            >
              <header className="relative border-b border-white/10 bg-gradient-to-br from-rovix-gold/18 via-white/[0.04] to-transparent p-6 sm:p-8">
                <button
                  aria-label="Fechar suporte"
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/8 p-2 text-white/70 transition hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-rovix-gold text-black shadow-gold">
                    <Ticket className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">Central de suporte</p>
                    <h2 className="mt-1 font-display text-3xl font-black uppercase text-white sm:text-4xl">
                      Abrir ticket
                    </h2>
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/62">
                  Descreva o que aconteceu com sua compra ou conta. Vamos preparar um e-mail com todos os dados para a
                  equipe da Rovix Store.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TicketInput
                    label="Nome"
                    value={form.name}
                    onChange={(value) => updateField("name", value)}
                    placeholder="Seu nome"
                  />
                  <TicketInput
                    label="E-mail"
                    type="email"
                    value={form.email}
                    onChange={(value) => updateField("email", value)}
                    placeholder="voce@email.com"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <label className="grid gap-2 text-sm font-black text-white/85">
                    Categoria
                    <select
                      value={form.category}
                      onChange={(event) => updateField("category", event.target.value)}
                      className="h-12 rounded-xl border border-white/10 bg-[#171717] px-4 text-white outline-none transition focus:border-rovix-gold/60"
                    >
                      <option>Compra</option>
                      <option>Pagamento PIX</option>
                      <option>Entrega</option>
                      <option>Conta</option>
                      <option>Outro</option>
                    </select>
                  </label>
                  <TicketInput
                    label="Assunto"
                    value={form.subject}
                    onChange={(value) => updateField("subject", value)}
                    placeholder="Ex: meu pagamento foi aprovado"
                  />
                </div>

                <label className="grid gap-2 text-sm font-black text-white/85">
                  O que ocorreu?
                  <textarea
                    required
                    minLength={12}
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    placeholder="Explique o problema com detalhes, incluindo ID do pedido se tiver."
                    className="min-h-36 resize-none rounded-xl border border-white/10 bg-[#171717] px-4 py-4 text-white outline-none transition focus:border-rovix-gold/60"
                  />
                </label>

                <div className="rounded-xl border border-rovix-gold/20 bg-rovix-gold/8 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-rovix-gold">
                    <Mail className="h-4 w-4" />
                    Destino: {supportEmail}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/55">
                    Ao enviar, o ticket será encaminhado diretamente pelo servidor da Rovix Store.
                  </p>
                </div>

                <button
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rovix-gold px-5 text-sm font-black uppercase tracking-[0.08em] text-black shadow-gold transition hover:bg-[#ffe45a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  Enviar ticket
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TicketInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-white/85">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-xl border border-white/10 bg-[#171717] px-4 text-white outline-none transition focus:border-rovix-gold/60"
      />
    </label>
  );
}
