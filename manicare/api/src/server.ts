import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';

const SERVICE_IDS = ['manicure', 'pedicure', 'nail-extensions', 'lash-extensions', 'brows'] as const;
type ServiceId = (typeof SERVICE_IDS)[number];
type Status = 'FULL' | 'AVAILABLE';

interface Master { id: string; name: string; role: string; serviceIds: ServiceId[] }
interface Appointment {
  comment: string; id: string; clientName: string; phone: string; serviceId: ServiceId;
  masterId: string; date: string; timeSlot: string; createdAt: string;
}

const MASTERS: Master[] = [
  { id: 'olena', name: 'Олена Коваль', role: 'Топ-майстер манікюру', serviceIds: ['manicure', 'nail-extensions'] },
  { id: 'maria', name: 'Марія Іванюк', role: 'Майстер педикюру', serviceIds: ['pedicure', 'manicure'] },
  { id: 'katerina', name: 'Катерина Бондар', role: 'Nail-майстер', serviceIds: ['manicure', 'pedicure', 'nail-extensions'] },
  { id: 'sofia', name: 'Софія Мельник', role: 'Лешмейкер', serviceIds: ['lash-extensions'] },
  { id: 'daryna', name: 'Дарина Шевчук', role: 'Архітектор брів', serviceIds: ['brows', 'lash-extensions'] },
];
const TIMES = ['10:00', '13:00', '15:00', '18:00'];
const appointments: Appointment[] = [];

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const parseDate = (s: string) => new Date(`${s}T12:00:00`);
const validDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(parseDate(s)) === s;
const isService = (s: unknown): s is ServiceId => SERVICE_IDS.includes(s as ServiceId);

// Demo load: part of the grid is pre-booked deterministically so the calendar shows both states.
function freeTimes(date: string, master: Master): string[] {
  const now = new Date();
  const today = iso(now);
  if (date < today || parseDate(date).getDay() === 0 || hash(date) % 6 === 0) return [];
  return TIMES.filter((t) => {
    if (date === today && t <= `${pad(now.getHours())}:${pad(now.getMinutes())}`) return false;
    if (hash(`${date}|${master.id}|${t}`) % 100 < 40) return false;
    return !appointments.some((a) => a.date === date && a.masterId === master.id && a.timeSlot === t);
  });
}
const mastersFor = (serviceId?: ServiceId) => MASTERS.filter((m) => !serviceId || m.serviceIds.includes(serviceId));

const app = Fastify({ logger: true });
await app.register(cors, { origin: process.env.CORS_ORIGIN ?? true });

app.get<{ Querystring: { month?: string; serviceId?: string } }>('/api/booking/availability', async (req, reply) => {
  const { month, serviceId } = req.query;
  const m = /^(\d{4})-(\d{2})$/.exec(month ?? '');
  if (!m || +m[2] < 1 || +m[2] > 12) return reply.code(400).send({ error: 'month має бути у форматі YYYY-MM' });
  if (serviceId && !isService(serviceId)) return reply.code(400).send({ error: 'Невідома послуга' });
  const masters = mastersFor(serviceId as ServiceId | undefined);
  const total = new Date(+m[1], +m[2], 0).getDate();
  const days = Array.from({ length: total }, (_, i) => {
    const date = `${m[1]}-${m[2]}-${pad(i + 1)}`;
    const status: Status = masters.some((x) => freeTimes(date, x).length) ? 'AVAILABLE' : 'FULL';
    return { date, status };
  });
  return { month, days };
});

app.get<{ Querystring: { date?: string; serviceId?: string } }>('/api/booking/masters-slots', async (req, reply) => {
  const { date, serviceId } = req.query;
  if (!validDate(date)) return reply.code(400).send({ error: 'date має бути у форматі YYYY-MM-DD' });
  if (!isService(serviceId)) return reply.code(400).send({ error: 'Невідома послуга' });
  const masters = mastersFor(serviceId)
    .map((m) => ({ masterId: m.id, name: m.name, role: m.role, times: freeTimes(date, m) }))
    .filter((m) => m.times.length);
  return { date, serviceId, masters };
});

app.post<{ Body: Record<string, unknown> }>('/api/booking/confirm', async (req, reply) => {
  const { clientName, phone, serviceId, masterId, date, timeSlot, comment } = req.body ?? {};
  const errors: Record<string, string> = {};
  if (typeof clientName !== 'string' || clientName.trim().length < 2 || clientName.length > 60) errors.clientName = "Вкажіть ім'я (від 2 символів)";
  if (typeof phone !== 'string' || !/^\+?[0-9\s()-]{10,16}$/.test(phone.trim())) errors.phone = 'Вкажіть коректний номер телефону';
  if (!isService(serviceId)) errors.serviceId = 'Оберіть послугу';
  const master = MASTERS.find((m) => m.id === masterId);
  if (!master || (isService(serviceId) && !master.serviceIds.includes(serviceId))) errors.masterId = 'Майстер не надає цю послугу';
  if (!validDate(date)) errors.date = 'Некоректна дата';
  if (typeof timeSlot !== 'string' || !TIMES.includes(timeSlot)) errors.timeSlot = 'Некоректний час';
  if (comment !== undefined && (typeof comment !== 'string' || comment.length > 500)) errors.comment = 'Коментар до 500 символів';
  if (Object.keys(errors).length) return reply.code(400).send({ error: 'Перевірте дані форми', errors });

  if (!freeTimes(date as string, master!).includes(timeSlot as string))
    return reply.code(409).send({ error: 'Цей час щойно зайняли. Оберіть інше вікно.' });

  const appointment: Appointment = {
    comment: typeof comment === 'string' ? comment.trim() : '', id: randomUUID(), clientName: (clientName as string).trim(), phone: (phone as string).trim(),
    serviceId: serviceId as ServiceId, masterId: master!.id, date: date as string,
    timeSlot: timeSlot as string, createdAt: new Date().toISOString(),
  };
  appointments.push(appointment);
  return reply.code(201).send({ success: true, message: 'Вас успішно записано! Ми зателефонуємо вам найближчим часом для підтвердження.', appointment });
});

await app.listen({ port: Number(process.env.PORT ?? 4000), host: '0.0.0.0' });
