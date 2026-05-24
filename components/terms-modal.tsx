"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, ShieldCheck, X } from "lucide-react";

type TermsModalProps = {
  open: boolean;
  onClose: () => void;
};

const sections = [
  {
    title: "Informações Gerais",
    content: [
      "A Rovix Store atua na venda de Robux e produtos relacionados ao ecossistema Roblox.",
      "Ao comprar conosco, o cliente confirma que possui autorização para utilizar a conta e o método de pagamento utilizados, tem ciência dos riscos envolvidos em transações digitais e leu e concordou integralmente com estes termos."
    ]
  },
  {
    title: "Entrega",
    content: [
      "O prazo de entrega pode variar dependendo da demanda, método de envio e disponibilidade.",
      "Em casos de alta demanda, atrasos podem ocorrer.",
      "O cliente deve fornecer corretamente todas as informações necessárias para entrega.",
      "Não nos responsabilizamos por erros enviados pelo próprio cliente."
    ]
  },
  {
    title: "Reembolsos",
    content: [
      "Após a entrega do produto, não realizamos reembolsos.",
      "Reembolsos só poderão ocorrer caso a entrega não seja realizada por responsabilidade da equipe Rovix Store.",
      "Chargebacks ou tentativas de fraude resultarão em blacklist permanente do servidor."
    ]
  },
  {
    title: "Segurança e Responsabilidade",
    content: [
      "A Rovix Store nunca solicitará senha da sua conta Roblox.",
      "O cliente é responsável pela segurança da própria conta.",
      "Não nos responsabilizamos por perdas causadas por terceiros, invasões ou compartilhamento de informações pessoais."
    ]
  },
  {
    title: "Alterações nos Termos",
    content: [
      "A Rovix Store pode alterar estes termos a qualquer momento sem aviso prévio.",
      "É responsabilidade do cliente verificar atualizações periodicamente."
    ]
  },
  {
    title: "Suporte",
    content: ["Caso tenha dúvidas, problemas ou precise de suporte, abra um ticket dentro do servidor."]
  },
  {
    title: "Observações Importantes",
    content: [
      "Compras realizadas fora dos canais oficiais da Rovix Store são de total responsabilidade do comprador.",
      "Não garantimos disponibilidade permanente de estoque.",
      "Ao permanecer no servidor e utilizar nossos serviços, você concorda automaticamente com estes termos."
    ]
  },
  {
    title: "Aceite",
    content: [
      "Ao comprar na Rovix Store ou permanecer no servidor, você declara estar de acordo com todos os termos citados acima.",
      "Obrigado por confiar na Rovix Store."
    ]
  }
];

export function TermsModal({ open, onClose }: TermsModalProps) {
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
          <div className="mx-auto max-w-4xl py-6">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="overflow-hidden rounded-2xl border border-white/12 bg-[#0d0d0d] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
            >
              <header className="relative border-b border-white/10 bg-gradient-to-br from-rovix-gold/18 via-white/[0.04] to-transparent p-6 sm:p-8">
                <button
                  aria-label="Fechar termos"
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/8 p-2 text-white/70 transition hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-rovix-gold text-black shadow-gold">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">Rovix Store</p>
                    <h2 className="mt-1 font-display text-3xl font-black uppercase text-white sm:text-4xl">
                      Termos de Serviço
                    </h2>
                  </div>
                </div>
                <p className="mt-6 max-w-2xl text-sm font-bold leading-6 text-white/68">
                  Última atualização: 12 de maio de 2026
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
                  Bem-vindo à Rovix Store. Ao realizar qualquer compra, negociação ou interação em nosso servidor do
                  Discord, você concorda com os termos abaixo.
                </p>
              </header>

              <div className="grid gap-4 p-5 sm:p-7">
                {sections.map((section, index) => (
                  <motion.section
                    key={section.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-rovix-gold/35"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-rovix-gold/12 text-rovix-gold">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <h3 className="text-base font-black uppercase tracking-wide text-white">{section.title}</h3>
                    </div>
                    <div className="grid gap-3">
                      {section.content.map((paragraph) => (
                        <p key={paragraph} className="text-sm font-medium leading-6 text-white/64">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
