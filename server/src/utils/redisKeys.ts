// Centralised Redis key templates to prevent typos and key collisions across different features.
export const redisKeys = {
  // Stores a one-time 6-digit code, TTL = 300s (5 min).
  verifyCode: (email: string) => `verifyCode:${email}`,
  // Stores a flag to enforce a 60s cooldown between resend requests.
  rateLimitSendCode: (email: string) => `rateLimitSendCode:${email}`,
}
