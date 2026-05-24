"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Copy, KeyRound, Loader2, LogIn, LogOut, QrCode, Shield, UserPlus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearSession,
  createUser,
  findUser,
  getSessionUser,
  isUserNameTaken,
  setSession,
  updateUser,
  type RovixUser
} from "@/lib/auth-store";
import { createOtpAuthUrl, createQrUrl, generateTotpSecret, verifyTotp } from "@/lib/totp";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthChange?: (user: RovixUser | null) => void;
};

type AuthTab = "login" | "register" | "security";

export function AuthModal({ open, onClose, onAuthChange }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [sessionUser, setSessionUser] = useState<RovixUser | null>(null);
  const [pendingUser, setPendingUser] = useState<RovixUser | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", code: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [setupCode, setSetupCode] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const user = getSessionUser();
    setSessionUser(user);
    setTab(user ? "security" : "login");
  }, [open]);

  useEffect(() => {
    if (tab === "security" && sessionUser && !sessionUser.twoFactorEnabled && !setupSecret) {
      setSetupSecret(generateTotpSecret());
    }
  }, [sessionUser, setupSecret, tab]);

  const otpAuthUrl = useMemo(() => {
    if (!sessionUser || !setupSecret) return "";
    return createOtpAuthUrl(sessionUser.email, setupSecret);
  }, [sessionUser, setupSecret]);
  const registerName = registerForm.name.trim();
  const registerNameTaken = useMemo(
    () => registerName.length >= 2 && isUserNameTaken(registerName),
    [registerName]
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const user = findUser(loginForm.email);
      if (!user || user.password !== loginForm.password) {
        throw new Error("E-mail ou senha inválidos.");
      }

      if (user.twoFactorEnabled && user.twoFactorSecret) {
        if (!pendingUser) {
          setPendingUser(user);
          toast.message("Digite o código do Google Authenticator.");
          return;
        }

        const valid = await verifyTotp(user.twoFactorSecret, loginForm.code);
        if (!valid) throw new Error("Código 2FA inválido.");
      }

      setSession(user);
      setSessionUser(user);
      onAuthChange?.(user);
      setPendingUser(null);
      setLoginForm({ email: "", password: "", code: "" });
      setTab("security");
      toast.success("Login realizado com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (registerNameTaken) {
        throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
      }

      const user = createUser(registerForm.name, registerForm.email, registerForm.password);
      setSession(user);
      setSessionUser(user);
      onAuthChange?.(user);
      setRegisterForm({ name: "", email: "", password: "" });
      setSetupSecret(generateTotpSecret());
      setTab("security");
      toast.success("Conta criada. Agora você pode vincular o 2FA.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar conta.");
    }
  }

  async function handleEnable2fa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionUser || !setupSecret) return;

    setLoading(true);
    const valid = await verifyTotp(setupSecret, setupCode);
    setLoading(false);

    if (!valid) {
      toast.error("Código 2FA inválido.");
      return;
    }

    const updated = updateUser({
      ...sessionUser,
      twoFactorEnabled: true,
      twoFactorSecret: setupSecret
    });

    setSessionUser(updated);
    onAuthChange?.(updated);
    setSetupCode("");
    toast.success("2FA vinculado com sucesso.");
  }

  function handleDisable2fa() {
    if (!sessionUser) return;
    const updated = updateUser({
      ...sessionUser,
      twoFactorEnabled: false,
      twoFactorSecret: undefined
    });

    setSessionUser(updated);
    onAuthChange?.(updated);
    setSetupSecret(generateTotpSecret());
    toast.success("2FA removido.");
  }

  function handleLogout() {
    clearSession();
    setSessionUser(null);
    onAuthChange?.(null);
    setPendingUser(null);
    setTab("login");
    toast.message("Voce saiu da conta.");
  }

  async function copySecret() {
    if (!setupSecret) return;
    await navigator.clipboard.writeText(setupSecret);
    toast.success("Segredo 2FA copiado.");
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
              aria-label="Fechar login"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/8 p-2 text-white/70 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">Área do cliente</p>
            <h2 className="mt-2 pr-10 font-display text-3xl font-black uppercase sm:text-4xl">
              Login Rovix
            </h2>

            <div className="mt-6 grid grid-cols-3 rounded-2xl border border-white/12 bg-black/40 p-1">
              {[
                { id: "login", label: "Login", icon: LogIn },
                { id: "register", label: "Criar", icon: UserPlus },
                { id: "security", label: "2FA", icon: Shield }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as AuthTab)}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-[0.08em] transition ${
                      tab === item.id ? "bg-rovix-gold text-black" : "text-white/60 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {tab === "login" && (
              <form onSubmit={handleLogin} className="mt-6 grid gap-4">
                <AuthInput
                  label="E-mail"
                  type="email"
                  value={loginForm.email}
                  onChange={(value) => {
                    setPendingUser(null);
                    setLoginForm((current) => ({ ...current, email: value }));
                  }}
                  placeholder="voce@email.com"
                />
                <AuthInput
                  label="Senha"
                  type="password"
                  value={loginForm.password}
                  onChange={(value) => {
                    setPendingUser(null);
                    setLoginForm((current) => ({ ...current, password: value }));
                  }}
                  placeholder="Sua senha"
                />
                {pendingUser && (
                  <AuthInput
                    label="Código Google Authenticator"
                    value={loginForm.code}
                    onChange={(value) => setLoginForm((current) => ({ ...current, code: value.replace(/\D/g, "").slice(0, 6) }))}
                    placeholder="000000"
                    inputMode="numeric"
                  />
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
                  {pendingUser ? "Validar 2FA" : "Entrar"}
                </Button>
              </form>
            )}

            {tab === "register" && (
              <form onSubmit={handleRegister} className="mt-6 grid gap-4">
                <AuthInput
                  label="Nome de usuário"
                  value={registerForm.name}
                  onChange={(value) => setRegisterForm((current) => ({ ...current, name: value }))}
                  placeholder="Seu nome público"
                />
                {registerName.length >= 2 && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black ${
                      registerNameTaken
                        ? "border-red-400/30 bg-red-500/10 text-red-200"
                        : "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {registerNameTaken ? (
                      <>
                        <X className="h-4 w-4" />
                        Nome indisponível. Já existe alguém usando esse nome.
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Nome disponível.
                      </>
                    )}
                  </div>
                )}
                <AuthInput
                  label="E-mail"
                  type="email"
                  value={registerForm.email}
                  onChange={(value) => setRegisterForm((current) => ({ ...current, email: value }))}
                  placeholder="voce@email.com"
                />
                <AuthInput
                  label="Senha"
                  type="password"
                  value={registerForm.password}
                  onChange={(value) => setRegisterForm((current) => ({ ...current, password: value }))}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <Button type="submit" disabled={registerNameTaken}>
                  <UserPlus className="h-5 w-5" />
                  Criar conta
                </Button>
              </form>
            )}

            {tab === "security" && (
              <div className="mt-6">
                {!sessionUser ? (
                  <div className="rounded-2xl border border-white/12 bg-black/45 p-5 text-white/70">
                    Entre ou crie uma conta para vincular o Google Authenticator.
                  </div>
                ) : sessionUser.twoFactorEnabled ? (
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-rovix-gold/35 bg-rovix-gold/10 p-5">
                      <div className="flex items-center gap-3 font-black text-rovix-gold">
                        <CheckCircle2 className="h-6 w-6" />
                        2FA ativo para {sessionUser.email}
                      </div>
                      <p className="mt-2 text-sm text-white/65">
                        O próximo login vai pedir o código do Google Authenticator.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button variant="dark" onClick={handleDisable2fa}>Remover 2FA</Button>
                      <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                        Sair
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEnable2fa} className="grid gap-5 lg:grid-cols-[260px_1fr]">
                    <div className="rounded-2xl border border-white/12 bg-white p-3 shadow-gold">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={createQrUrl(otpAuthUrl)} alt="QR Code Google Authenticator" className="aspect-square w-full rounded-xl object-cover" />
                    </div>
                    <div className="grid content-start gap-4">
                      <div className="rounded-2xl border border-white/12 bg-black/45 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Como vincular</p>
                        <p className="mt-2 text-sm leading-6 text-white/68">
                          Abra o Google Authenticator, escaneie o QR Code e digite o código de 6 dígitos para confirmar.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/12 bg-black/45 p-4">
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">Chave manual</p>
                        <p className="break-all font-mono text-sm text-white/80">{setupSecret}</p>
                      </div>
                      <Button type="button" variant="dark" onClick={copySecret}>
                        <Copy className="h-5 w-5" />
                        Copiar chave
                      </Button>
                      <AuthInput
                        label="Código 2FA"
                        value={setupCode}
                        onChange={(value) => setSetupCode(value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        inputMode="numeric"
                      />
                      <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5" />}
                        Vincular 2FA
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type AuthInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  minLength?: number;
  inputMode?: "text" | "numeric";
};

function AuthInput({ label, value, onChange, placeholder, type = "text", minLength, inputMode }: AuthInputProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/80">
      {label}
      <input
        required
        type={type}
        minLength={minLength}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] rounded-xl border border-white/12 bg-black/45 px-4 text-white outline-none transition focus:border-rovix-gold"
        placeholder={placeholder}
      />
    </label>
  );
}
