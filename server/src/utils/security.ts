import crypto from "crypto";

export function generateSecureOtp(length: number = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashOtp(otp: string, salt: string): string {
  return crypto.pbkdf2Sync(otp, salt, 10000, 32, "sha256").toString("hex");
}

export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

