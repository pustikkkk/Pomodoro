// Validates all required environment variables at startup.
// Fail-fast: the process exits immediately if any variable is missing or malformed,
// so misconfiguration is caught before the server starts accepting traffic.
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  // Minimum 32 chars enforces a secret long enough to resist brute-force against HMAC-SHA256.
  JWT_SECRET: z.string().min(32),
  SENDGRID_API_KEY: z.string().min(1),
  SENDGRID_FROM_EMAIL: z.string().email(),
  CLIENT_ORIGIN: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
