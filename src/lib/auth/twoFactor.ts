import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  generateRecoveryCodes,
  generateTotpSecret,
  otpauthUri,
  verifyTotp,
} from "./totp";

const ISSUER = "Rutega";

export async function startTwoFactorEnrollment(userId: string, email: string) {
  const secret = generateTotpSecret();
  const recoveryCodes = generateRecoveryCodes();
  const hashed = await Promise.all(recoveryCodes.map((c) => bcrypt.hash(c, 10)));

  await prisma.twoFactor.upsert({
    where: { userId },
    update: {
      secret,
      recoveryCodes: JSON.stringify(hashed),
      enabledAt: null,
    },
    create: {
      userId,
      secret,
      recoveryCodes: JSON.stringify(hashed),
    },
  });
  return {
    secret,
    otpauthUri: otpauthUri({ account: email, issuer: ISSUER, secret }),
    recoveryCodes,
  };
}

export async function confirmTwoFactor(userId: string, code: string): Promise<boolean> {
  const tf = await prisma.twoFactor.findUnique({ where: { userId } });
  if (!tf) return false;
  if (!verifyTotp(code, tf.secret)) return false;
  await prisma.twoFactor.update({
    where: { userId },
    data: { enabledAt: new Date() },
  });
  return true;
}

export async function disableTwoFactor(userId: string) {
  await prisma.twoFactor.delete({ where: { userId } }).catch(() => null);
}

export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const tf = await prisma.twoFactor.findUnique({ where: { userId } });
  return Boolean(tf?.enabledAt);
}

export async function verifyLoginToken(userId: string, code: string): Promise<boolean> {
  const tf = await prisma.twoFactor.findUnique({ where: { userId } });
  if (!tf || !tf.enabledAt) return false;
  if (verifyTotp(code, tf.secret)) return true;

  // Try recovery codes
  try {
    const hashes: string[] = JSON.parse(tf.recoveryCodes);
    if (!Array.isArray(hashes)) return false;
    for (let i = 0; i < hashes.length; i += 1) {
      const hash = hashes[i];
      if (!hash) continue;
      const ok = await bcrypt.compare(code, hash);
      if (ok) {
        const remaining = hashes.filter((_, idx) => idx !== i);
        await prisma.twoFactor.update({
          where: { userId },
          data: { recoveryCodes: JSON.stringify(remaining) },
        });
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

export async function getTwoFactorStatus(userId: string) {
  const tf = await prisma.twoFactor.findUnique({ where: { userId } });
  if (!tf) return { enrolled: false, enabled: false, recoveryRemaining: 0 };
  let remaining = 0;
  try {
    const arr = JSON.parse(tf.recoveryCodes);
    if (Array.isArray(arr)) remaining = arr.length;
  } catch {}
  return {
    enrolled: true,
    enabled: Boolean(tf.enabledAt),
    recoveryRemaining: remaining,
  };
}
