"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LogIn, UserPlus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createUser, findUser, isUserNameTaken, setSession, type RovixUser } from "@/lib/auth-store";
import { verifyTotp } from "@/lib/totp";
import { getEmailValidationError, normalizeEmail } from "@/lib/validators";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthChange?: (user: RovixUser | null) => void;
};

type AuthTab = "login" | "register";

export function AuthModal({ open, onClose, onAuthChange }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [pendingUser, setPendingUser] = useState<RovixUser | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", code: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab("login");
    setPendingUser(null);
  }, [open]);

  const registerName = registerForm.name.trim();
  const registerEmail = normalizeEmail(registerForm.email);
  const registerEmailError = useMemo(() => getEmailValidationError(registerForm.email), [registerForm.email]);
  const registerNameTaken = useMemo(
    () => registerName.length >= 2 && isUserNameTaken(registerName),
    [registerName]
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const emailError = getEmailValidationError(loginForm.email);
      if (emailError) throw new Error(emailError);

      const user = findUser(loginForm.email);
      if (!user || user.password !== loginForm.password) {
        throw new Error("E-mail ou senha invalidos.");
      }

      if (user.twoFactorEnabled && user.twoFactorSecret) {
        if (!pendingUser) {
          setPendingUser(user);
          toast.message("Digite o codigo do Google Authenticator.");
          return;
        }

        const valid = await verifyTotp(user.twoFactorSecret, loginForm.code);
        if (!valid) throw new Error("Codigo 2FA invalido.");
      }

      setSession(user);
      onAuthChange?.(user);
      setPendingUser(null);
      setLoginForm({ email: "", password: "", code: "" });
      toast.success("Login realizado com sucesso.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (registerNameTaken) {
        throw new Error("Esse nome de usuario ja esta em uso. Escolha outro.");
      }

      if (registerEmailError) {
        throw new Error(registerEmailError);
      }

      const user = createUser(registerForm.name, registerEmail, registerForm.password);
      setSession(user);
      onAuthChange?.(user);
      setRegisterForm({ name: "", email: "", password: "" });
      toast.success("Conta criada. O 2FA fica opcional em Meu Perfil.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel criar conta.");
    }
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
            className="premium-card gold-border relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 sm:p-7"
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

            <p className="text-xs font-black uppercase tracking-[0.22em] text-rovix-gold">Area do cliente</p>
            <h2 className="mt-2 pr-10 font-display text-3xl font-black uppercase sm:text-4xl">Login Rovix</h2>

            <div className="mt-6 grid grid-cols-2 rounded-2xl border border-white/12 bg-black/40 p-1">
              {[
                { id: "login", label: "Login", icon: LogIn },
                { id: "register", label: "Criar", icon: UserPlus }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id as AuthTab);
                      setPendingUser(null);
                    }}
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
                  <>
                    <div className="rounded-2xl border border-rovix-gold/30 bg-rovix-gold/10 p-4 text-sm font-bold leading-6 text-white/75">
                      Essa conta ativou 2FA. Digite o codigo do Google Authenticator para concluir o login.
                    </div>
                    <AuthInput
                      label="Codigo Google Authenticator"
                      value={loginForm.code}
                      onChange={(value) => setLoginForm((current) => ({ ...current, code: value.replace(/\D/g, "").slice(0, 6) }))}
                      placeholder="000000"
                      inputMode="numeric"
                    />
                  </>
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
                  label="Nome de usuario"
                  value={registerForm.name}
                  onChange={(value) => setRegisterForm((current) => ({ ...current, name: value }))}
                  placeholder="Seu nome publico"
                />
                {registerName.length >= 2 && (
                  <ValidationMessage
                    valid={!registerNameTaken}
                    message={
                      registerNameTaken
                        ? "Nome indisponivel. Ja existe alguem usando esse nome."
                        : "Nome disponivel."
                    }
                  />
                )}
                <AuthInput
                  label="E-mail"
                  type="email"
                  value={registerForm.email}
                  onChange={(value) => setRegisterForm((current) => ({ ...current, email: value }))}
                  placeholder="voce@email.com"
                />
                {registerForm.email.trim().length > 0 && (
                  <ValidationMessage
                    valid={!registerEmailError}
                    message={registerEmailError || "E-mail com formato valido."}
                  />
                )}
                <AuthInput
                  label="Senha"
                  type="password"
                  value={registerForm.password}
                  onChange={(value) => setRegisterForm((current) => ({ ...current, password: value }))}
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
                />
                <Button type="submit" disabled={registerNameTaken || Boolean(registerEmailError)}>
                  <UserPlus className="h-5 w-5" />
                  Criar conta
                </Button>
              </form>
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

function ValidationMessage({ valid, message }: { valid: boolean; message: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black ${
        valid ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"
      }`}
    >
      {valid ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
    </div>
  );
}
