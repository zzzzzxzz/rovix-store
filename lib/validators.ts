export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getEmailValidationError(value: string) {
  const email = normalizeEmail(value);

  if (!email) return "Informe um e-mail.";
  if (email.length > 254) return "E-mail muito longo.";
  if (/\s/.test(email)) return "E-mail nao pode ter espacos.";

  const parts = email.split("@");
  if (parts.length !== 2) return "Informe um e-mail valido.";

  const [local, domain] = parts;
  if (!local || !domain) return "Informe um e-mail valido.";
  if (local.length > 64) return "E-mail muito longo antes do @.";
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return "Informe um e-mail valido.";
  }

  const domainParts = domain.split(".");
  if (domainParts.length < 2) return "Informe um dominio de e-mail valido.";

  const validDomain = domainParts.every((part) => {
    return part.length > 0 && part.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(part);
  });

  if (!validDomain) return "Informe um dominio de e-mail valido.";

  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return "Informe um dominio de e-mail valido.";

  return "";
}

export function isValidEmail(value: string) {
  return getEmailValidationError(value) === "";
}

function hasRepeatedDigits(document: string) {
  return /^(\d)\1+$/.test(document);
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || hasRepeatedDigits(cpf)) return false;

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(cpf[index]) * (10 - index);
  }

  let digit = 11 - (sum % 11);
  const firstDigit = digit >= 10 ? 0 : digit;
  if (firstDigit !== Number(cpf[9])) return false;

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(cpf[index]) * (11 - index);
  }

  digit = 11 - (sum % 11);
  const secondDigit = digit >= 10 ? 0 : digit;
  return secondDigit === Number(cpf[10]);
}

export function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || hasRepeatedDigits(cnpj)) return false;

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = weights.reduce((total, weight, index) => total + Number(base[index]) * weight, 0);
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (firstDigit !== Number(cnpj[12])) return false;

  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return secondDigit === Number(cnpj[13]);
}

export function getDocumentValidationError(value: string) {
  const document = onlyDigits(value);

  if (!document) return "Informe um CPF ou CNPJ.";
  if (![11, 14].includes(document.length)) return "CPF precisa ter 11 digitos ou CNPJ 14 digitos.";
  if (document.length === 11 && !isValidCpf(document)) return "CPF invalido.";
  if (document.length === 14 && !isValidCnpj(document)) return "CNPJ invalido.";

  return "";
}

export function normalizeDocument(value: string) {
  return onlyDigits(value);
}
