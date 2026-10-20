import { randomUUID } from 'node:crypto';

export const SERVICE_IDS = ['manicure', 'pedicure', 'nail-extensions', 'lash-extensions', 'brows'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];
type Status = 'FULL' | 'AVAILABLE';
export interface Result { status: number; body: unknown }
interface Master { id: string; name: string; role: string; serviceIds: ServiceId[] }
interface Appointment {
  id: string; clientName: string; phone: string; comment: string; serviceId: ServiceId;
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
// Записи живуть у пам'яті процесу. Для реальної роботи підключіть базу даних.
const appointments: Appointment[] = [];

const out = (status: number, body: unknown): Result => ({ status, body });
const pad = (n: number) => String(n).padStart(2, '0');
const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const parseDate = (s: string) => new Date(`${s}T12:00:00Z`);
const validDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && parseDate(s).toISOString().slice(0, 10) === s;
const isService = (s: unknown): s is ServiceId => SERVICE_IDS.includes(s as ServiceId);

function kyivNow() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return { today: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour')}:${g('minute')}` };
}

// Демо-завантаженість: частина слотів зайнята детерміновано, щоб календар мав обидва стани.
function freeTimes(date: string, master: Master): string[] {
  const { today, time } = kyivNow();
  if (date < today || parseDate(date).getUTCDay() === 0 || hash(date) % 8 === 0) return [];
  return TIMES.filter((t) => {
    if (date === today && t <= time) return false;
    if (hash(`${date}|${master.id}|${t}`) % 100 < 30) return false;
    return !appointments.some((a) => a.date === date && a.masterId === master.id && a.timeSlot === t);
  });
}
const mastersFor = (serviceId?: ServiceId) => MASTERS.filter((m) => !serviceId || m.serviceIds.includes(serviceId));

export function getAvailability(month: string | null, serviceId: string | null): Result {
  const m = /^(\d{4})-(\d{2})$/.exec(month ?? '');
  if (!m || +m[2] < 1 || +m[2] > 12) return out(400, { error: 'month має бути у форматі YYYY-MM' });
  if (serviceId && !isService(serviceId)) return out(400, { error: 'Невідома послуга' });
  const masters = mastersFor((serviceId as ServiceId) || undefined);
  const total = new Date(Date.UTC(+m[1], +m[2], 0)).getUTCDate();
  const days = Array.from({ length: total }, (_, i) => {
    const date = `${m[1]}-${m[2]}-${pad(i + 1)}`;
    const status: Status = masters.some((x) => freeTimes(date, x).length) ? 'AVAILABLE' : 'FULL';
    return { date, status };
  });
  return out(200, { month, days });
}

export function getSlots(date: string | null, serviceId: string | null): Result {
  if (!validDate(date)) return out(400, { error: 'date має бути у форматі YYYY-MM-DD' });
  if (!isService(serviceId)) return out(400, { error: 'Невідома послуга' });
  const masters = mastersFor(serviceId)
    .map((m) => ({ masterId: m.id, name: m.name, role: m.role, times: freeTimes(date, m) }))
    .filter((m) => m.times.length);
  return out(200, { date, serviceId, masters });
}

export function createBooking(body: Record<string, unknown>): Result {
  const { clientName, phone, serviceId, masterId, date, timeSlot, comment } = body;
  const errors: Record<string, string> = {};
  if (typeof clientName !== 'string' || clientName.trim().length < 2 || clientName.length > 60) errors.clientName = "Вкажіть ім'я (від 2 символів)";
  if (typeof phone !== 'string' || !/^\+?[0-9\s()-]{10,16}$/.test(phone.trim())) errors.phone = 'Вкажіть коректний номер телефону';
  if (!isService(serviceId)) errors.serviceId = 'Оберіть послугу';
  const master = MASTERS.find((m) => m.id === masterId);
  if (!master || (isService(serviceId) && !master.serviceIds.includes(serviceId))) errors.masterId = 'Майстер не надає цю послугу';
  if (!validDate(date)) errors.date = 'Некоректна дата';
  if (typeof timeSlot !== 'string' || !TIMES.includes(timeSlot)) errors.timeSlot = 'Некоректний час';
  if (comment !== undefined && (typeof comment !== 'string' || comment.length > 500)) errors.comment = 'Коментар до 500 символів';
  if (Object.keys(errors).length) return out(400, { error: 'Перевірте дані форми', errors });

  if (!freeTimes(date as string, master!).includes(timeSlot as string))
    return out(409, { error: 'Цей час щойно зайняли. Оберіть інше вікно.' });

  const appointment: Appointment = {
    id: randomUUID(), clientName: (clientName as string).trim(), phone: (phone as string).trim(),
    comment: typeof comment === 'string' ? comment.trim() : '', serviceId: serviceId as ServiceId,
    masterId: master!.id, date: date as string, timeSlot: timeSlot as string, createdAt: new Date().toISOString(),
  };
  appointments.push(appointment);
  return out(201, { success: true, message: 'Вас успішно записано! Адміністратор зателефонує вам найближчим часом для підтвердження.', appointment });
}
