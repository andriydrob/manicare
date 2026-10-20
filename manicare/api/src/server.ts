import Fastify, { type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { createBooking, getAvailability, getSlots, type Result } from './booking.js';

const app = Fastify({ logger: true });

const corsOrigin = process.env.CORS_ORIGIN || true;
await app.register(cors, { 
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

const send = (reply: FastifyReply, r: Result) => reply.code(r.status).send(r.body);
type Q = Record<string, string | undefined>;

app.get('/', async () => ({ ok: true, service: 'manicare-api' }));

app.get('/api/booking/availability', async (req, reply) => {
  const q = req.query as Q;
  return send(reply, getAvailability(q.month ?? null, q.serviceId ?? null));
});

app.get('/api/booking/masters-slots', async (req, reply) => {
  const q = req.query as Q;
  return send(reply, getSlots(q.date ?? null, q.serviceId ?? null));
});

app.post('/api/booking/confirm', async (req, reply) => send(reply, createBooking((req.body ?? {}) as Record<string, unknown>)));

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: '0.0.0.0' });
}

export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit('request', req, res);
};