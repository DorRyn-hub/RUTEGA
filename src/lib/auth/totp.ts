import { createHmac, randomBytes } from "node:crypto";

// TOTP / RFC 6238 minimal implementation. No external deps.

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(byteLength = 20): string {
  const buf = randomBytes(byteLength);
  return base32Encode(buf);
}

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return output;
}

export function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotp(secretBase32: string, time = Date.now(), step = 30, digits = 6): string {
  const counter = Math.floor(time / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const key = base32Decode(secretBase32);
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return String(code % 10 ** digits).padStart(digits, "0");
}

export function verifyTotp(token: string, secretBase32: string, window = 1): boolean {
  if (!/^\d{4,8}$/.test(token)) return false;
  const now = Date.now();
  for (let i = -window; i <= window; i += 1) {
    const candidate = generateTotp(secretBase32, now + i * 30_000);
    if (candidate === token) return true;
  }
  return false;
}

export function otpauthUri(params: {
  account: string;
  issuer: string;
  secret: string;
}): string {
  const label = encodeURIComponent(`${params.issuer}:${params.account}`);
  const qs = new URLSearchParams({
    secret: params.secret,
    issuer: params.issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${qs.toString()}`;
}

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const buf = randomBytes(5);
    codes.push(`${buf.toString("hex").slice(0, 4)}-${buf.toString("hex").slice(4, 8)}`);
  }
  return codes;
}
