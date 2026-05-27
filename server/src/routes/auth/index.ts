import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { hashPassword, comparePassword, generateVerificationCode } from '../../services/authService.js'
import { sendVerificationCode } from '../../services/emailService.js'
import { redisKeys } from '../../utils/redisKeys.js'
import { badRequest, unauthorized, conflict, tooManyRequests } from '../../utils/errors.js'

export default async function authRoutes(app: FastifyInstance) {
  // POST /auth/signup
  // Creates the user and sends a verification code. If the email delivery fails the user row
  // is deleted so the address can be retried cleanly — keeps the DB consistent.
  app.post('/signup', async (request, reply) => {
    const { username, email, password } = request.body as {
      username: string
      email: string
      password: string
    }

    if (!username || !email || !password) {
      return badRequest(reply, 'username, email and password are required')
    }
    if (password.length < 8) {
      return badRequest(reply, 'Password must be at least 8 characters')
    }

    const existing = await app.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      if (existing.email === email) return conflict(reply, 'Email already in use')
      return conflict(reply, 'Username already taken')
    }

    const passwordHash = await hashPassword(password)

    const user = await app.prisma.user.create({
      data: { username, email, passwordHash },
    })

    const code = generateVerificationCode()
    await app.redis.set(redisKeys.verifyCode(email), code, 'EX', 300)
    try {
      await sendVerificationCode(email, code)
    } catch {
      // Roll back the user and the Redis key so the address can be used again on retry.
      await app.redis.del(redisKeys.verifyCode(email))
      await app.prisma.user.delete({ where: { id: user.id } })
      return reply.status(502).send({ error: 'EMAIL_ERROR', message: 'Could not send a verification email to that address. Please double-check it and try again.' })
    }

    return reply.status(201).send({ message: 'Verification code sent', email })
  })

  // POST /auth/login
  // Validates credentials then sends a verification code (2FA step).
  // Returns the same 'Invalid credentials' message for both bad username and bad password
  // to avoid leaking which field was wrong (user enumeration prevention).
  app.post('/login', async (request, reply) => {
    const { username, password } = request.body as {
      username: string
      password: string
    }

    if (!username || !password) {
      return badRequest(reply, 'username and password are required')
    }

    const user = await app.prisma.user.findUnique({ where: { username } })
    if (!user) return unauthorized(reply, 'Invalid credentials')

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) return unauthorized(reply, 'Invalid credentials')

    const code = generateVerificationCode()
    await app.redis.set(redisKeys.verifyCode(user.email), code, 'EX', 300)
    await sendVerificationCode(user.email, code)

    return reply.send({ message: 'Verification code sent', email: user.email })
  })

  // POST /auth/send-code
  // Resend endpoint with a 60s rate limit per email address.
  // Always returns 200 even for unknown emails to avoid leaking account existence.
  app.post('/send-code', async (request, reply) => {
    const { email } = request.body as { email: string }
    if (!email) return badRequest(reply, 'email is required')

    const rateLimitKey = redisKeys.rateLimitSendCode(email)
    const limited = await app.redis.get(rateLimitKey)
    if (limited) return tooManyRequests(reply, 'Please wait 1 minute before requesting another code')

    const user = await app.prisma.user.findUnique({ where: { email } })
    if (!user) return reply.send({ message: 'If that email exists, a code was sent' })

    const code = generateVerificationCode()
    await app.redis.set(redisKeys.verifyCode(email), code, 'EX', 300)
    await app.redis.set(rateLimitKey, '1', 'EX', 60)
    await sendVerificationCode(email, code)

    return reply.send({ message: 'Verification code sent' })
  })

  // POST /auth/verify-code
  // Final step for both signup and login flows.
  // The code is deleted immediately after reading — it is single-use.
  // For signup, also marks the user as verified. For login, the user is already verified.
  // Issues a 7-day httpOnly cookie on success; the client never sees the raw JWT.
  app.post('/verify-code', async (request, reply) => {
    const { email, code, flow } = request.body as {
      email: string
      code: string
      flow: 'signup' | 'login'
    }

    if (!email || !code || !flow) {
      return badRequest(reply, 'email, code and flow are required')
    }

    const stored = await app.redis.get(redisKeys.verifyCode(email))
    if (!stored || stored !== code) {
      return badRequest(reply, 'Invalid or expired verification code')
    }

    // Delete the code so it cannot be reused even if the client re-submits.
    await app.redis.del(redisKeys.verifyCode(email))

    const user = await app.prisma.user.findUnique({ where: { email } })
    if (!user) return badRequest(reply, 'User not found')

    if (flow === 'signup') {
      await app.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      })
    }

    const token = app.jwt.sign({ sub: user.id, username: user.username })
    reply.setCookie('token', token, {
      httpOnly: true,   // inaccessible to JS, prevents XSS token theft
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,  // 7 days, mirrors jwt expiresIn
      secure: true,  // always HTTPS: mkcert locally, Railway TLS terminator in production
    })

    return reply.send({ user: { id: user.id, username: user.username, email: user.email } })
  })

  // POST /auth/logout
  app.post('/logout', { preHandler: [authenticate] }, async (_request, reply) => {
    reply.clearCookie('token', { path: '/' })
    return reply.send({ message: 'Logged out' })
  })

  // GET /auth/me — returns the currently authenticated user's profile.
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = await app.prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { id: true, username: true, email: true },
    })
    if (!user) return reply.status(404).send({ error: 'NOT_FOUND', message: 'User not found' })
    return reply.send(user)
  })
}
