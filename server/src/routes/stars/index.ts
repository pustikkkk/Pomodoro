import type { FastifyInstance } from 'fastify'
import type { TemplateType } from '@prisma/client'
import { authenticate } from '../../middleware/authenticate.js'
import { badRequest } from '../../utils/errors.js'
import { TEMPLATE_DEFINITIONS } from '../../config/templates.js'

const VALID_TEMPLATES = Object.keys(TEMPLATE_DEFINITIONS) as TemplateType[]

export default async function starsRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] }

  // GET /stars — returns a zeroed map for all 4 template types even if the user has no stars yet,
  // so the client can always read stars[type] without null checks.
  app.get('/', auth, async (request, reply) => {
    const rows = await app.prisma.star.findMany({
      where: { userId: request.user.sub },
    })

    const stars: Record<TemplateType, number> = {
      short: 0,
      standard: 0,
      hybrid: 0,
      deep_work: 0,
    }
    for (const row of rows) {
      stars[row.templateType] = row.count
    }

    return reply.send({ stars })
  })

  // POST /stars/award — upserts the star row for the given template type.
  // Creates the row with count=1 on the first award, increments on subsequent ones.
  // Called by the client immediately when a timer block completes.
  app.post('/award', auth, async (request, reply) => {
    const { templateType } = request.body as { templateType: TemplateType }

    if (!VALID_TEMPLATES.includes(templateType)) {
      return badRequest(reply, `templateType must be one of: ${VALID_TEMPLATES.join(', ')}`)
    }

    const star = await app.prisma.star.upsert({
      where: {
        userId_templateType: {
          userId: request.user.sub,
          templateType,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        userId: request.user.sub,
        templateType,
        count: 1,
      },
    })

    return reply.send({ templateType, count: star.count })
  })
}
