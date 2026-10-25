import { FastifyInstance } from 'fastify'
import crypto from 'crypto'

function generateToken(login: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(login)
    .digest('hex')
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', async (request, reply) => {
    const { login, password } = request.body as { login: string; password: string }

    const validLogin = process.env.ADMIN_LOGIN
    const validPassword = process.env.ADMIN_PASSWORD
    const secret = process.env.ADMIN_SECRET

    if (!validLogin || !validPassword || !secret) {
      return reply.status(500).send({ ok: false, message: 'Server misconfigured' })
    }

    if (login !== validLogin || password !== validPassword) {
      return reply.status(401).send({ ok: false, message: 'Невірний логін або пароль' })
    }

    const token = generateToken(login, secret)
    return reply.send({ ok: true, token })
  })

  fastify.post('/auth/verify', async (request, reply) => {
    const { token } = request.body as { token: string }

    const validLogin = process.env.ADMIN_LOGIN
    const secret = process.env.ADMIN_SECRET

    if (!validLogin || !secret) {
      return reply.status(500).send({ ok: false })
    }

    const expected = generateToken(validLogin, secret)
    const valid = token === expected

    return reply.send({ ok: valid })
  })
}