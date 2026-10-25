import { randomUUID } from 'node:crypto'
import { supabase } from './supabase.js'

export const SERVICE_IDS = ['manicure', 'pedicure', 'nail-extensions', 'lash-extensions', 'brows'] as const
export type ServiceId = (typeof SERVICE_IDS)[number]
export interface Result { status: number; body: unknown }

const out = (status: number, body: unknown): Result => ({ status, body })
const isService = (s: unknown): s is ServiceId => SERVICE_IDS.includes(s as ServiceId)
const validDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const pad = (n: number) => String(n).padStart(2, '0')

function kyivNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date())
  const g = (t: string) => parts.find(p => p.type === t)!.value
  return { today: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour')}:${g('minute')}` }
}

export async function getAvailability(month: string | null, serviceId: string | null): Promise<Result> {
  const m = /^(\d{4})-(\d{2})$/.exec(month ?? '')
  if (!m || +m[2] < 1 || +m[2] > 12) return out(400, { error: 'month має бути у форматі YYYY-MM' })
  if (serviceId && !isService(serviceId)) return out(400, { error: 'Невідома послуга' })

  const { today } = kyivNow()
  const total = new Date(Date.UTC(+m[1], +m[2], 0)).getUTCDate()

  // Отримуємо майстрів з Supabase
  const { data: masters } = await supabase.from('masters').select('id, service_ids')
  if (!masters) return out(500, { error: 'Помилка бази даних' })

  const filteredMasters = serviceId
    ? masters.filter(m => m.service_ids?.includes(serviceId))
    : masters

  const masterIds = filteredMasters.map(m => m.id)

  // Отримуємо всі вільні слоти за місяць
  const { data: slots } = await supabase
    .from('schedules')
    .select('date, master_id, is_booked')
    .in('master_id', masterIds)
    .gte('date', `${m[1]}-${m[2]}-01`)
    .lte('date', `${m[1]}-${m[2]}-${pad(total)}`)

  const days = Array.from({ length: total }, (_, i) => {
    const date = `${m[1]}-${m[2]}-${pad(i + 1)}`
    if (date < today) return { date, status: 'FULL' }
    const hasAvailable = (slots || []).some(s => s.date === date && !s.is_booked)
    return { date, status: hasAvailable ? 'AVAILABLE' : 'FULL' }
  })

  return out(200, { month, days })
}

export async function getSlots(date: string | null, serviceId: string | null): Promise<Result> {
  if (!validDate(date)) return out(400, { error: 'date має бути у форматі YYYY-MM-DD' })
  if (!isService(serviceId)) return out(400, { error: 'Невідома послуга' })

  const { today, time: nowTime } = kyivNow()

  const { data: masters } = await supabase
    .from('masters')
    .select('id, name, role, service_ids')
    .contains('service_ids', [serviceId])

  if (!masters) return out(500, { error: 'Помилка бази даних' })

  const { data: slots } = await supabase
    .from('schedules')
    .select('*')
    .in('master_id', masters.map(m => m.id))
    .eq('date', date)
    .eq('is_booked', false)

  const result = masters.map(master => {
    let times = (slots || [])
      .filter(s => s.master_id === master.id)
      .map(s => s.time)

    if (date === today) {
      times = times.filter(t => t > nowTime)
    }

    return { masterId: master.id, name: master.name, role: master.role, times }
  }).filter(m => m.times.length > 0)

  return out(200, { date, serviceId, masters: result })
}

export async function createBooking(body: Record<string, unknown>): Promise<Result> {
  const { clientName, phone, serviceId, masterId, date, timeSlot, comment } = body

  const errors: Record<string, string> = {}
  if (typeof clientName !== 'string' || clientName.trim().length < 2) errors.clientName = "Вкажіть імʼя"
  if (typeof phone !== 'string' || !/^\+?[0-9\s()-]{10,16}$/.test(phone.trim())) errors.phone = 'Вкажіть коректний номер'
  if (!isService(serviceId)) errors.serviceId = 'Оберіть послугу'
  if (!validDate(date)) errors.date = 'Некоректна дата'
  if (typeof timeSlot !== 'string') errors.timeSlot = 'Оберіть час'
  if (Object.keys(errors).length) return out(400, { error: 'Перевірте дані', errors })

  // Знаходимо слот
  const { data: slot } = await supabase
    .from('schedules')
    .select('id, is_booked')
    .eq('master_id', masterId)
    .eq('date', date)
    .eq('time', timeSlot)
    .single()

  if (!slot) return out(404, { error: 'Слот не знайдено' })
  if (slot.is_booked) return out(409, { error: 'Цей час вже зайнятий. Оберіть інше вікно.' })

  // Перевіряємо майстра
  const { data: master } = await supabase
    .from('masters')
    .select('id, name, service_ids')
    .eq('id', masterId)
    .single()

  if (!master || !master.service_ids?.includes(serviceId)) {
    return out(400, { error: 'Майстер не надає цю послугу' })
  }

  // Створюємо запис і блокуємо слот атомарно
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      id: randomUUID(),
      client_name: (clientName as string).trim(),
      phone: (phone as string).trim(),
      comment: typeof comment === 'string' ? comment.trim() : '',
      service_id: serviceId,
      master_id: masterId,
      schedule_id: slot.id,
      date: date,
      time_slot: timeSlot,
    })
    .select()
    .single()

  if (error) return out(500, { error: 'Помилка збереження' })

  // Блокуємо слот
  await supabase.from('schedules').update({ is_booked: true }).eq('id', slot.id)

  return out(201, {
    success: true,
    message: 'Вас успішно записано! Адміністратор зателефонує найближчим часом.',
    appointment
  })
}