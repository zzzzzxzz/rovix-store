export type RovixUser = {
  id: string;
  name: string;
  email: string;
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

function getRecentNameChanges(user: RovixUser, now = Date.now()) {
  const log = Array.isArray(user.nameChangeLog) ? user.nameChangeLog : [];
  return log.filter((timestamp) => typeof timestamp === "number" && now - timestamp < NAME_CHANGE_WINDOW_MS);
}

export function getUsers(): RovixUser[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || "[]") as RovixUser[];
  } catch {
    return [];
  }
}

export function saveUsers(users: RovixUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function createUser(name: string, email: string, password: string) {
  const users = getUsers();
  const cleanName = displayUserName(name);
  const normalizedName = normalizeUserName(cleanName);
  const normalizedEmail = email.trim().toLowerCase();

  if (cleanName.length < 2) {
    throw new Error("Digite um nome de usuário válido.");
  }

  if (users.some((user) => normalizeUserName(user.name) === normalizedName)) {
    throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
  }

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Esse e-mail já está cadastrado.");
  }

  const user: RovixUser = {
    id: `user_${Date.now().toString(36)}`,
    name: cleanName,
    email: normalizedEmail,
    password,
    twoFactorEnabled: false
  };

  saveUsers([user, ...users]);
  return user;
}

export function updateUser(updatedUser: RovixUser) {
  const users = getUsers();
  const cleanName = displayUserName(updatedUser.name);
  const normalizedName = normalizeUserName(cleanName);

  if (cleanName.length < 2) {
    throw new Error("Digite um nome de usuário válido.");
  }

  if (users.some((user) => user.id !== updatedUser.id && normalizeUserName(user.name) === normalizedName)) {
    throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
  }

  const nextUser = { ...updatedUser, name: cleanName };
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

export function findUser(email: string) {
  return getUsers().find((user) => user.email === email.trim().toLowerCase());
}

export function isUserNameTaken(name: string, ignoredUserId?: string) {
  const normalizedName = normalizeUserName(name);
  if (!normalizedName) return false;
  return getUsers().some((user) => user.id !== ignoredUserId && normalizeUserName(user.name) === normalizedName);
}

export function setSession(user: RovixUser) {
  window.localStorage.setItem(SESSION_KEY, user.id);
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
