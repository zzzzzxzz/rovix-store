const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const period = 30;
const digits = 6;
const validationWindow = 4;

export function generateTotpSecret(length = 20) {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);

  let bits = "";
  bytes.forEach((byte) => {
    bits += byte.toString(2).padStart(8, "0");
  });

  let secret = "";
  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    secret += alphabet[parseInt(chunk, 2)];
  }

  return secret;
}

export function createOtpAuthUrl(email: string, secret: string) {
  const issuer = "RovixStore";
  const label = `${issuer}:${email}`;
  const params = [
    `secret=${encodeURIComponent(secret)}`,
    `issuer=${encodeURIComponent(issuer)}`,
    "algorithm=SHA1",
    `digits=${digits}`,
    `period=${period}`
  ].join("&");

  return `otpauth://totp/${encodeURIComponent(label)}?${params}`;
}

export function createQrUrl(otpAuthUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&margin=8&data=${encodeURIComponent(otpAuthUrl)}`;
}

function decodeBase32(secret: string) {
  const clean = secret.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = "";

  for (const char of clean) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  }

  return new Uint8Array(bytes);
}

function counterToBytes(counter: number) {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(counter), false);
  return bytes;
}

async function generateCode(secret: string, counter: number) {
  const key = await window.crypto.subtle.importKey(
    "raw",
    decodeBase32(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = new Uint8Array(await window.crypto.subtle.sign("HMAC", key, counterToBytes(counter)));
  const offset = signature[signature.length - 1] & 0x0f;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, "0");
}

export async function verifyTotp(secret: string, code: string) {
  const cleanCode = code.replace(/\D/g, "");
  if (cleanCode.length !== digits) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / period);
  const counters = Array.from({ length: validationWindow * 2 + 1 }, (_, index) => currentCounter - validationWindow + index);
  const results = await Promise.all(counters.map((counter) => generateCode(secret, counter)));

  return results.includes(cleanCode);
}
