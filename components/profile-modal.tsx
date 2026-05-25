"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, Camera, CheckCircle2, Copy, Loader2, Shield, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  changeUserName,
  getNameChangeState,
  getSessionUser,
  isUserNameTaken,
  updateUser,
  type RovixUser
} from "@/lib/auth-store";
import { createOtpAuthUrl, createQrUrl, generateTotpSecret, verifyTotp } from "@/lib/totp";

type ProfileModalProps = {
  open: boolean;
  user: RovixUser | null;
  onClose: () => void;
  onUserChange: (user: RovixUser) => void;
};

export function ProfileModal({ open, user, onClose, onUserChange }: ProfileModalProps) {
  const [clock, setClock] = useState(Date.now());
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("Nenhum arquivo escolhido");
  const [displayName, setDisplayName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setPreview(user.avatarDataUrl || "");
    setFileName("Nenhum arquivo escolhido");
    setDisplayName(user.name);
    setPassword("");
    setCode("");
    if (!user.twoFactorEnabled) setSetupSecret(generateTotpSecret());
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  const initials = useMemo(() => {
    if (!user) return "RV";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const qrUrl = user && setupSecret ? createQrUrl(createOtpAuthUrl(user.email, setupSecret)) : "";
  const cleanDisplayName = displayName.trim().replace(/\s+/g, " ");
  const nameChanged = Boolean(user && cleanDisplayName && cleanDisplayName !== user.name);
  const nameTaken = Boolean(user && cleanDisplayName.length >= 2 && isUserNameTaken(cleanDisplayName, user.id));
  const nameChangeState = user ? getNameChangeState(user, clock) : null;
  const nameCooldownMs = nameChangeState?.remainingMs || 0;

  function saveUpdatedUser(nextUser: RovixUser) {
    const saved = updateUser(nextUser);
    onUserChange(saved);
  }

  async function saveName() {
    if (!user) return;

    if (cleanDisplayName.length < 2) {
      toast.error("Digite um nome de usuário válido.");
      return;
    }

    if (nameTaken) {
      toast.error("Esse nome de usuário já está em uso.");
      return;
    }

    if (nameCooldownMs > 0) {
      toast.error(`Aguarde ${formatCooldown(nameCooldownMs)} para alterar o nome novamente.`);
      return;
    }

    setNameLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const updated = changeUserName(user, cleanDisplayName);
      onUserChange(updated);
      setDisplayName(updated.name);
      toast.success("Nome de usuário atualizado.");
    } catch (error) {
      const refreshed = getSessionUser();
      if (refreshed?.id === user.id) onUserChange(refreshed);
      toast.error(error instanceof Error ? error.message : "Não foi possível alterar o nome.");
    } finally {
      setNameLoading(false);
    }
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem precisa ter até 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result));
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function savePhoto() {
    if (!user || !preview) return;
    setPhotoLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    saveUpdatedUser({ ...user, avatarDataUrl: preview });
    setPhotoLoading(false);
    toast.success("Foto salva com sucesso.");
  }

  async function handleTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    if (password !== user.password) {
      toast.error("Senha da conta incorreta.");
      return;
    }

    const secret = user.twoFactorEnabled ? user.twoFactorSecret : setupSecret;
    if (!secret) return;

    setTwoFactorLoading(true);
    const valid = await verifyTotp(secret, code);
    setTwoFactorLoading(false);

    if (!valid) {
      toast.error("Código atual inválido.");
      return;
    }

    const updated = user.twoFactorEnabled
      ? { ...user, twoFactorEnabled: false, twoFactorSecret: undefined }
      : { ...user, twoFactorEnabled: true, twoFactorSecret: setupSecret };

    saveUpdatedUser(updated);
    setPassword("");
    setCode("");
    if (updated.twoFactorEnabled) {
      toast.success("Autenticador ativado.");
    } else {
      setSetupSecret(generateTotpSecret());
      toast.success("Autenticador desativado.");
    }
  }

  async function copyTwoFactorSecret() {
    if (!setupSecret) return;
    await navigator.clipboard.writeText(setupSecret);
    toast.success("Chave manual copiada.");
  }

  async function enableNotifications() {
    if (!user) return;
    if (!("Notification" in window)) {
      toast.error("Seu navegador não suporta notificações.");
      return;
    }

    setNotificationLoading(true);
    const permission = await Notification.requestPermission();
    setNotificationLoading(false);

    if (permission !== "granted") {
      toast.error("Permissao de notificacao recusada.");
      return;
    }

    saveUpdatedUser({ ...user, notificationToken: `notif_${Date.now().toString(36)}` });
    toast.success("Notificações ativadas neste dispositivo.");
  }

  return (
    <AnimatePresence>
      {open && user && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/84 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div className="mx-auto max-w-[860px] py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl font-black uppercase text-white">Meu Perfil</h2>
              <button
                aria-label="Fechar perfil"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/8 p-2 text-white/70 transition hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-7">
              <PanelCard title="Nome de usuário" icon={CheckCircle2}>
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <ProfileInput label="Novo nome" value={displayName} onChange={setDisplayName} />
                    <p className="mt-3 text-xs font-bold text-white/55">
                      Esse nome aparece no menu da conta e precisa ser único na Rovix Store.
                    </p>
                    <p className="mt-2 text-xs font-bold text-white/45">
                      {nameCooldownMs > 0
                        ? `Cooldown ativo: altere novamente em ${formatCooldown(nameCooldownMs)}.`
                        : `${nameChangeState?.changesInWindow || 0}/${nameChangeState?.limit || 3} alterações usadas nos últimos 5 minutos.`}
                    </p>
                    {nameCooldownMs === 0 && (nameChangeState?.remainingChanges || 0) === 0 && (
                      <p className="mt-2 text-xs font-black text-amber-200">
                        Limite atingido. Tentar alterar agora ativa cooldown de 7 horas.
                      </p>
                    )}
                    {cleanDisplayName.length >= 2 && nameChanged && (
                      <p className={`mt-3 text-sm font-black ${nameTaken ? "text-red-200" : "text-emerald-200"}`}>
                        {nameTaken ? "Nome indisponível. Já existe alguém usando esse nome." : "Nome disponível."}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={saveName}
                    disabled={!nameChanged || nameTaken || nameLoading || nameCooldownMs > 0}
                    className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-black transition hover:bg-rovix-gold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {nameLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar nome
                  </button>
                </div>
              </PanelCard>

              <PanelCard title="Foto de perfil" icon={Camera}>
                <div className="grid gap-7 sm:grid-cols-[96px_1fr] sm:items-center">
                  <Avatar preview={preview} initials={initials} />
                  <div>
                    <p className="mb-3 text-sm font-black text-white">Nova foto</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-white/12 bg-white/10 px-5 text-sm font-black text-white/75 transition hover:bg-white/15">
                        Escolher arquivo
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
                      </label>
                      <span className="rounded-lg bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/55">{fileName}</span>
                    </div>
                    <button
                      onClick={savePhoto}
                      disabled={!preview || photoLoading}
                      className="mt-4 inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-black transition hover:bg-rovix-gold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {photoLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Salvar foto
                    </button>
                    <p className="mt-3 text-xs font-bold text-white/70">JPG, PNG ou WebP, até 2 MB.</p>
                  </div>
                </div>
              </PanelCard>

              <PanelCard title="Google Authenticator (2FA)" icon={Shield}>
                <form onSubmit={handleTwoFactor}>
                  <p className="mb-5 text-sm font-bold text-white/75">
                    {user.twoFactorEnabled
                      ? "Protecao ativa: o login pede o codigo do app autenticador."
                      : "Opcional: ative apenas se quiser proteger sua conta com Google Authenticator."}
                  </p>
                  {!user.twoFactorEnabled && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-[150px_1fr]">
                      <div className="rounded-xl bg-white p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrUrl} alt="QR Code 2FA" className="aspect-square w-full rounded-lg object-cover" />
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">Chave manual</p>
                          <button
                            type="button"
                            onClick={copyTwoFactorSecret}
                            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/12 px-3 text-xs font-black uppercase text-white/70 transition hover:border-rovix-gold/60 hover:text-rovix-gold"
                          >
                            <Copy className="h-4 w-4" />
                            Copiar
                          </button>
                        </div>
                        <input
                          readOnly
                          value={setupSecret}
                          onFocus={(event) => event.currentTarget.select()}
                          onClick={(event) => event.currentTarget.select()}
                          className="mt-3 h-11 w-full overflow-x-auto rounded-lg border border-white/10 bg-black/45 px-3 font-mono text-sm font-bold text-white/80 outline-none focus:border-rovix-gold/60"
                        />
                        <p className="mt-2 text-xs font-bold text-white/45">
                          Toque ou clique no campo para selecionar, ou use o botao Copiar.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <ProfileInput label="Senha da conta" type="password" value={password} onChange={setPassword} />
                    <ProfileInput
                      label="Código atual (6 dígitos)"
                      value={code}
                      onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </div>
                  <button
                    disabled={twoFactorLoading || code.length !== 6}
                    className={`mt-4 inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-md border px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      user.twoFactorEnabled
                        ? "border-red-400/70 bg-red-500/5 text-red-200 hover:bg-red-500/10"
                        : "border-rovix-gold/50 bg-rovix-gold text-black hover:bg-[#ffe45a]"
                    }`}
                  >
                    {twoFactorLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {user.twoFactorEnabled ? "Desativar autenticador" : "Ativar autenticador"}
                  </button>
                </form>
              </PanelCard>

              <PanelCard title="Notificações" icon={Bell}>
                <p className="text-sm font-bold text-white/75">
                  Ative para receber avisos no navegador neste dispositivo. É necessário HTTPS e permissão do navegador.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={enableNotifications}
                    disabled={notificationLoading || Boolean(user.notificationToken)}
                    className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-black transition hover:bg-rovix-gold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {notificationLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Ativar notificações neste dispositivo
                  </button>
                  {user.notificationToken && (
                    <span className="inline-flex items-center gap-2 text-sm font-black text-rovix-gold">
                      <CheckCircle2 className="h-4 w-4" />
                      Ativado
                    </span>
                  )}
                </div>
              </PanelCard>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatCooldown(ms: number) {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}

function PanelCard({ title, icon: Icon, children }: { title: string; icon: typeof Camera; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/12 bg-[#101010] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.35)] sm:p-8"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-white/85" />
        <h3 className="text-base font-black uppercase tracking-wide text-white">{title}</h3>
      </div>
      <div className="mt-14">{children}</div>
    </motion.section>
  );
}

function Avatar({ preview, initials }: { preview: string; initials: string }) {
  return (
    <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-rovix-gold text-2xl font-black text-black shadow-gold">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Foto de perfil" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-white">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-lg border border-transparent bg-[#1a1a1a] px-4 text-white outline-none transition focus:border-rovix-gold/60"
      />
    </label>
  );
}
