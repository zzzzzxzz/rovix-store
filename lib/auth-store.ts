import { getEmailValidationError, normalizeEmail } from "@/lib/validators";

export type RovixUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  password: string;
  avatarDataUrl?: string;
  notificationToken?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  nameChangeLog?: number[];
  nameChangeCooldownUntil?: number;
};

const USERS_KEY = "rovix-users";
const SESSION_KEY = "rovix-session";
const NAME_CHANGE_WINDOW_MS = 5 * 60 * 1000;
const NAME_CHANGE_LIMIT = 3;
const NAME_CHANGE_COOLDOWN_MS = 7 * 60 * 60 * 1000;

function normalizeUserName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function displayUserName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function normalizePassword(password: string) {
  return password.trim();
}

function getRecentNameChanges(user: RovixUser, now = Date.now()) {
  const log = Array.isArray(user.nameChangeLog) ? user.nameChangeLog : [];
  return log.filter((timestamp) => typeof timestamp === "number" && now - timestamp < NAME_CHANGE_WINDOW_MS);
}

function normalizeStoredUser(value: unknown): RovixUser | null {
  if (!value || typeof value !== "object") return null;

  const user = value as Partial<RovixUser>;
  const id = typeof user.id === "string" ? user.id.trim() : "";
  const name = typeof user.name === "string" ? displayUserName(user.name) : "";
  const email = typeof user.email === "string" ? normalizeEmail(user.email) : "";
  const password = typeof user.password === "string" ? normalizePassword(user.password) : "";

  if (!id || !name || !email || !password) return null;

  return {
    id,
    name,
    email,
    emailVerified: Boolean(user.emailVerified),
    password,
    avatarDataUrl: typeof user.avatarDataUrl === "string" ? user.avatarDataUrl : undefined,
    notificationToken: typeof user.notificationToken === "string" ? user.notificationToken : undefined,
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    twoFactorSecret: typeof user.twoFactorSecret === "string" ? user.twoFactorSecret : undefined,
    nameChangeLog: Array.isArray(user.nameChangeLog)
      ? user.nameChangeLog.filter((timestamp) => typeof timestamp === "number")
      : undefined,
    nameChangeCooldownUntil:
      typeof user.nameChangeCooldownUntil === "number" ? user.nameChangeCooldownUntil : undefined
  };
}

export function getUsers(): RovixUser[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(USERS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    const users = parsed
      .map((item) => normalizeStoredUser(item))
      .filter((user): user is RovixUser => Boolean(user));

    if (users.length !== parsed.length) {
      saveUsers(users);
    }

    return users;
  } catch {
    return [];
  }
}

export function saveUsers(users: RovixUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function createUser(name: string, email: string, password: string, options?: { emailVerified?: boolean }) {
  const users = getUsers();
  const cleanName = displayUserName(name);
  const normalizedName = normalizeUserName(cleanName);
  const cleanPassword = normalizePassword(password);
  const emailError = getEmailValidationError(email);
  if (emailError) {
    throw new Error(emailError);
  }

  const normalizedEmail = normalizeEmail(email);

  if (cleanName.length < 2) {
    throw new Error("Digite um nome de usuário válido.");
  }

  if (users.some((user) => normalizeUserName(user.name) === normalizedName)) {
    throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
  }

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Esse e-mail já está cadastrado.");
  }

  if (cleanPassword.length < 6) {
    throw new Error("A senha precisa ter no minimo 6 caracteres.");
  }

  const user: RovixUser = {
    id: `user_${Date.now().toString(36)}`,
    name: cleanName,
    email: normalizedEmail,
    emailVerified: Boolean(options?.emailVerified),
    password: cleanPassword,
    twoFactorEnabled: false
  };

  saveUsers([user, ...users]);
  return user;
}

export function updateUser(updatedUser: RovixUser) {
  const users = getUsers();
  const cleanName = displayUserName(updatedUser.name);
  const normalizedName = normalizeUserName(cleanName);
  const normalizedEmail = normalizeEmail(updatedUser.email);

  if (cleanName.length < 2) {
    throw new Error("Digite um nome de usuário válido.");
  }

  const emailError = getEmailValidationError(updatedUser.email);
  if (emailError) {
    throw new Error(emailError);
  }

  if (users.some((user) => user.id !== updatedUser.id && normalizeUserName(user.name) === normalizedName)) {
    throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
  }

  if (users.some((user) => user.id !== updatedUser.id && normalizeEmail(user.email) === normalizedEmail)) {
    throw new Error("Esse e-mail ja esta cadastrado.");
  }

  const nextUser = {
    ...updatedUser,
    name: cleanName,
    email: normalizedEmail,
    password: normalizePassword(updatedUser.password)
  };
  const nextUsers = users.map((user) => (user.id === nextUser.id ? nextUser : user));
  saveUsers(nextUsers);
  setSession(nextUser);
  return nextUser;
}

export function getNameChangeState(user: RovixUser, now = Date.now()) {
  const cooldownUntil = user.nameChangeCooldownUntil || 0;
  const remainingMs = Math.max(0, cooldownUntil - now);
  const changesInWindow = getRecentNameChanges(user, now).length;

  return {
    remainingMs,
    cooldownUntil: remainingMs > 0 ? cooldownUntil : undefined,
    changesInWindow,
    remainingChanges: Math.max(0, NAME_CHANGE_LIMIT - changesInWindow),
    limit: NAME_CHANGE_LIMIT
  };
}

export function changeUserName(user: RovixUser, nextName: string) {
  const users = getUsers();
  const currentUser = users.find((current) => current.id === user.id) || user;
  const now = Date.now();
  const state = getNameChangeState(currentUser, now);

  if (state.remainingMs > 0) {
    throw new Error("Aguarde o cooldown terminar para alterar o nome novamente.");
  }

  const cleanName = displayUserName(nextName);
  const normalizedName = normalizeUserName(cleanName);

  if (cleanName.length < 2) {
    throw new Error("Digite um nome de usuário válido.");
  }

  if (users.some((current) => current.id !== user.id && normalizeUserName(current.name) === normalizedName)) {
    throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
  }

  const recentChanges = getRecentNameChanges(currentUser, now);

  if (recentChanges.length >= NAME_CHANGE_LIMIT) {
    updateUser({
      ...currentUser,
      nameChangeLog: recentChanges,
      nameChangeCooldownUntil: now + NAME_CHANGE_COOLDOWN_MS
    });
    throw new Error("Você alterou o nome muitas vezes. Cooldown de 7 horas ativado.");
  }

  return updateUser({
    ...currentUser,
    ...user,
    name: cleanName,
    nameChangeLog: [...recentChanges, now],
    nameChangeCooldownUntil: undefined
  });
}

export function changeUserEmail(user: RovixUser, nextEmail: string) {
  const users = getUsers();
  const currentUser = users.find((current) => current.id === user.id) || user;
  const emailError = getEmailValidationError(nextEmail);
  if (emailError) {
    throw new Error(emailError);
  }

  const normalizedEmail = normalizeEmail(nextEmail);
  if (users.some((current) => current.id !== user.id && normalizeEmail(current.email) === normalizedEmail)) {
    throw new Error("Esse e-mail ja esta cadastrado.");
  }

  return updateUser({
    ...currentUser,
    ...user,
    email: normalizedEmail,
    emailVerified: true
  });
}

export function findUser(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return getUsers().find((user) => normalizeEmail(user.email) === normalizedEmail);
}

export function verifyUserPassword(user: RovixUser, password: string) {
  return normalizePassword(user.password) === normalizePassword(password);
}

export function isUserNameTaken(name: string, ignoredUserId?: string) {
  const normalizedName = normalizeUserName(name);
  if (!normalizedName) return false;
  return getUsers().some((user) => user.id !== ignoredUserId && normalizeUserName(user.name) === normalizedName);
}

export function isEmailTaken(email: string, ignoredUserId?: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  return getUsers().some((user) => user.id !== ignoredUserId && normalizeEmail(user.email) === normalizedEmail);
}

export function setSession(user: RovixUser) {
  if (typeof window === "undefined") return;
  const storedUser = normalizeStoredUser(user);
  if (!storedUser) return;

  const users = getUsers();
  const hasUser = users.some((currentUser) => currentUser.id === storedUser.id);
  const nextUsers = hasUser
    ? users.map((currentUser) => (currentUser.id === storedUser.id ? storedUser : currentUser))
    : [storedUser, ...users];

  saveUsers(nextUsers);
  window.localStorage.setItem(SESSION_KEY, storedUser.id);
}

export function getSessionUser() {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getUsers().find((user) => user.id === id) || null;
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
