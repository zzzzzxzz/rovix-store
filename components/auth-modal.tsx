"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LogIn, UserPlus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createUser,
  findUser,
  isEmailTaken,
  isUserNameTaken,
  setSession,
  updateUser,
  verifyUserPassword,
  type RovixUser
} from "@/lib/auth-store";
import { verifyTotp } from "@/lib/totp";
import { getEmailValidationError, normalizeEmail } from "@/lib/validators";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthChange?: (user: RovixUser | null) => void;
};

type AuthTab = "login" | "register";
type PendingStep = "email" | "2fa" | null;

export function AuthModal({ open, onClose, onAuthChange }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [pendingUser, setPendingUser] = useState<RovixUser | null>(null);
  const [pendingStep, setPendingStep] = useState<PendingStep>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", code: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [registerToken, setRegisterToken] = useState("");
  const [registerCode, setRegisterCode] = useState("");
  const [registerCodeSent, setRegisterCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab("login");
    setPendingUser(null);
    setPendingStep(null);
    setVerificationToken("");
    setRegisterToken("");
    setRegisterCode("");
    setRegisterCodeSent(false);
  }, [open]);

  const registerName = registerForm.name.trim();
  const registerEmail = normalizeEmail(registerForm.email);
  const registerEmailError = useMemo(() => getEmailValidationError(registerForm.email), [registerForm.email]);
  const registerNameTaken = useMemo(
    () => registerName.length >= 2 && isUserNameTaken(registerName),
    [registerName]
  );
  const registerEmailTaken = useMemo(
    () => !registerEmailError && registerEmail.length > 0 && isEmailTaken(registerEmail),
    [registerEmail, registerEmailError]
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const emailError = getEmailValidationError(loginForm.email);
      if (emailError) throw new Error(emailError);

      let user = findUser(loginForm.email);
      if (!user || !verifyUserPassword(user, loginForm.password)) {
        throw new Error("E-mail ou senha invalidos.");
      }

      if (!user.emailVerified) {
        if (pendingStep !== "email" || pendingUser?.id !== user.id || !verificationToken) {
          const token = await requestEmailVerification(user.email, "login");
          setPendingUser(user);
          setPendingStep("email");
          setVerificationToken(token);
          setLoginForm((current) => ({ ...current, code: "" }));
          toast.success("Enviamos um codigo para o seu e-mail.");
          return;
        }

        await confirmEmailVerification(user.email, loginForm.code, verificationToken, "login");
        user = updateUser({ ...user, emailVerified: true });
        toast.success("E-mail verificado com sucesso.");
      }

      if (user.twoFactorEnabled && user.twoFactorSecret) {
        if (pendingStep !== "2fa" || pendingUser?.id !== user.id) {
          setPendingUser(user);
          setPendingStep("2fa");
          setLoginForm((current) => ({ ...current, code: "" }));
          toast.message("Digite o codigo do Google Authenticator.");
          return;
        }

        const valid = await verifyTotp(user.twoFactorSecret, loginForm.code);
        if (!valid) throw new Error("Codigo 2FA invalido.");
      }

      setSession(user);
      onAuthChange?.(user);
      setPendingUser(null);
      setPendingStep(null);
      setVerificationToken("");
      setLoginForm({ email: "", password: "", code: "" });
      toast.success("Login realizado com sucesso.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      if (registerNameTaken) {
        throw new Error("Esse nome de usuario ja esta em uso. Escolha outro.");
      }

      if (registerEmailError) {
        throw new Error(registerEmailError);
      }

      if (registerEmailTaken) {
        throw new Error("Esse e-mail ja esta cadastrado.");
      }

      if (registerForm.password.trim().length < 6) {
        throw new Error("A senha precisa ter no minimo 6 caracteres.");
      }

      if (!registerCodeSent || !registerToken) {
        const token = await requestEmailVerification(registerEmail, "register");
        setRegisterToken(token);
        setRegisterCode("");
        setRegisterCodeSent(true);
        toast.success("Codigo enviado. Confira seu e-mail para criar a conta.");
        return;
      }

      await confirmEmailVerification(registerEmail, registerCode, registerToken, "register");
      const user = createUser(registerForm.name, registerEmail, registerForm.password, { emailVerified: true });
      setSession(user);
      onAuthChange?.(user);
      setRegisterForm({ name: "", email: "", password: "" });
      setRegisterToken("");
      setRegisterCode("");
      setRegisterCodeSent(false);
      toast.success("Conta criada. O 2FA fica opcional em Meu Perfil.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel criar conta.");
    } finally {
      setLoading(false);
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
                      setPendingStep(null);
                      setVerificationToken("");
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
                    setPendingStep(null);
                    setVerificationToken("");
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
                    setPendingStep(null);
                    setVerificationToken("");
                    setLoginForm((current) => ({ ...current, password: value }));
                  }}
                  placeholder="Sua senha"
                />
                {pendingUser && pendingStep && (
                  <>
                    <div className="rounded-2xl border border-rovix-gold/30 bg-rovix-gold/10 p-4 text-sm font-bold leading-6 text-white/75">
                      {pendingStep === "email"
                        ? "Esse e-mail precisa ser verificado. Digite o codigo enviado para continuar."
                        : "Essa conta ativou 2FA. Digite o codigo do Google Authenticator para concluir o login."}
                    </div>
                    <AuthInput
                      label={pendingStep === "email" ? "Codigo recebido no e-mail" : "Codigo Google Authenticator"}
                      value={loginForm.code}
                      onChange={(value) => setLoginForm((current) => ({ ...current, code: value.replace(/\D/g, "").slice(0, 6) }))}
                      placeholder="000000"
                      inputMode="numeric"
                    />
                  </>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
                  {pendingStep === "email" ? "Verificar e entrar" : pendingStep === "2fa" ? "Validar 2FA" : "Entrar"}
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
                  onChange={(value) => {
                    setRegisterForm((current) => ({ ...current, email: value }));
                    setRegisterToken("");
                    setRegisterCode("");
                    setRegisterCodeSent(false);
                  }}
                  placeholder="voce@email.com"
                />
                {registerForm.email.trim().length > 0 && (
                  <ValidationMessage
                    valid={!registerEmailError && !registerEmailTaken}
                    message={
                      registerEmailError ||
                      (registerEmailTaken ? "Esse e-mail ja esta cadastrado." : "E-mail com formato valido.")
                    }
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
                {registerCodeSent && (
                  <>
                    <div className="rounded-2xl border border-rovix-gold/30 bg-rovix-gold/10 p-4 text-sm font-bold leading-6 text-white/75">
                      Enviamos um codigo para {registerEmail}. Digite os 6 digitos para confirmar seu e-mail.
                    </div>
                    <AuthInput
                      label="Codigo recebido no e-mail"
                      value={registerCode}
                      onChange={(value) => setRegisterCode(value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      inputMode="numeric"
                    />
                  </>
                )}
                <Button type="submit" disabled={loading || registerNameTaken || Boolean(registerEmailError) || registerEmailTaken}>
                  <UserPlus className="h-5 w-5" />
                  {registerCodeSent ? "Verificar e criar conta" : "Enviar codigo no e-mail"}
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type EmailVerificationPurpose = "register" | "change-email" | "login";

async function requestEmailVerification(email: string, purpose: EmailVerificationPurpose) {
  const response = await fetch("/api/auth/email-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, purpose })
  });
  const data = (await response.json().catch(() => ({}))) as { token?: string; error?: string };

  if (!response.ok || !data.token) {
    throw new Error(data.error || "Nao foi possivel enviar o codigo.");
  }

  return data.token;
}

async function confirmEmailVerification(
  email: string,
  code: string,
  token: string,
  purpose: EmailVerificationPurpose
) {
  const response = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, token, purpose })
  });
  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Codigo de verificacao invalido.");
  }
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
