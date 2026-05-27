import type { FastifyInstance } from 'fastify'
import type { TemplateType } from '@prisma/client'
import { authenticate } from '../../middleware/authenticate.js'
import { badRequest, forbidden, notFound } from '../../utils/errors.js'
import { TEMPLATE_DEFINITIONS } from '../../config/templates.js'

const VALID_TEMPLATES = Object.keys(TEMPLATE_DEFINITIONS) as TemplateType[]
// 10 blocks × up to 60+30 min = 15 hours max; a reasonable upper bound for a single session.
const MAX_BLOCKS = 10

// Type guard that validates both the block values and the array length in one pass.
function validateBlocks(blocks: unknown): blocks is TemplateType[] {
  if (!Array.isArray(blocks) || blocks.length === 0 || blocks.length > MAX_BLOCKS) return false
  return blocks.every((b) => VALID_TEMPLATES.includes(b as TemplateType))
}

export default async function timerRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] }

  // GET /timers
  app.get('/', auth, async (request, reply) => {
    const timers = await app.prisma.timer.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ timers })
  })

  // POST /timers
  app.post('/', auth, async (request, reply) => {
    const { title, description, autoRestart, blocks } = request.body as {
      title: string
      description?: string
      autoRestart?: boolean
      blocks: TemplateType[]
    }

    if (!title?.trim()) return badRequest(reply, 'title is required')
    if (!validateBlocks(blocks)) {
      return badRequest(reply, `blocks must be a non-empty array (max ${MAX_BLOCKS}) of: ${VALID_TEMPLATES.join(', ')}`)
    }

    const timer = await app.prisma.timer.create({
      data: {
        userId: request.user.sub,
        title: title.trim(),
        description: description?.trim() || null,
        autoRestart: autoRestart ?? false,
        blocks,
      },
    })

    return reply.status(201).send(timer)
  })

  // GET /timers/:id
  app.get('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const timer = await app.prisma.timer.findUnique({ where: { id } })
    if (!timer) return notFound(reply, 'Timer not found')
    if (timer.userId !== request.user.sub) return forbidden(reply)
    return reply.send(timer)
  })

  // PATCH /timers/:id
  app.patch('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const timer = await app.prisma.timer.findUnique({ where: { id } })
    if (!timer) return notFound(reply, 'Timer not found')
    if (timer.userId !== request.user.sub) return forbidden(reply)

    const { title, description, autoRestart, blocks } = request.body as {
      title?: string
      description?: string
      autoRestart?: boolean
      blocks?: TemplateType[]
    }

    if (blocks !== undefined && !validateBlocks(blocks)) {
      return badRequest(reply, `blocks must be a non-empty array (max ${MAX_BLOCKS}) of: ${VALID_TEMPLATES.join(', ')}`)
    }

    const updated = await app.prisma.timer.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() || null }),
        ...(autoRestart !== undefined && { autoRestart }),
        ...(blocks !== undefined && { blocks }),
      },
    })

    return reply.send(updated)
  })

  // DELETE /timers/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const timer = await app.prisma.timer.findUnique({ where: { id } })
    if (!timer) return notFound(reply, 'Timer not found')
    if (timer.userId !== request.user.sub) return forbidden(reply)

    await app.prisma.timer.delete({ where: { id } })
    return reply.status(204).send()
  })
}
