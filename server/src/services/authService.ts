import bcrypt from 'bcrypt'

// 12 rounds: slow enough to resist bulk brute-force (~250ms on a modern CPU), fast enough for interactive login.
const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generates a 6-digit code in the range [100000, 999999] (no leading zeros).
export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}
