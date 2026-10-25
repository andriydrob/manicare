import { FastifyInstance } from 'fastify'
import { supabase } from './supabase.js'
import { randomUUID } from 'node:crypto'

export async function adminRoutes(fastify: FastifyInstance) {

  // ===== МАЙСТРИ =====
  fastify.get('/masters', async (_, reply) => {
    const { data, error } = await supabase.from('masters').select('*').order('created_at')
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true, data })
  })

  fastify.post('/masters', async (req, reply) => {
    const body = req.body as any
    const { data, error } = await supabase.from('masters').insert({
      name: body.name, role: body.role, about: body.about || '',
      photo_url: body.photo_url || '', service_ids: body.service_ids || [],
    }).select().single()
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.code(201).send({ ok: true, data })
  })

  fastify.put('/masters/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as any
    const { data, error } = await supabase.from('masters').update({
      name: body.name, role: body.role, about: body.about,
      photo_url: body.photo_url, service_ids: body.service_ids,
    }).eq('id', id).select().single()
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true, data })
  })

  fastify.delete('/masters/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { error } = await supabase.from('masters').delete().eq('id', id)
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true })
  })

  // ===== ФОТО =====
  fastify.post('/masters/upload-photo', async (req, reply) => {
    const data = await req.file()
    if (!data) return reply.code(400).send({ ok: false, message: 'Файл не знайдено' })

    const buffer = await data.toBuffer()
    const ext = data.filename.split('.').pop()
    const fileName = `${randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from('masters')
      .upload(fileName, buffer, { contentType: data.mimetype })

    if (error) return reply.code(500).send({ ok: false, message: error.message })

    const { data: urlData } = supabase.storage.from('masters').getPublicUrl(fileName)
    return reply.send({ ok: true, url: urlData.publicUrl })
  })

  // ===== РОЗКЛАД =====
  fastify.get('/schedules/:masterId', async (req, reply) => {
    const { masterId } = req.params as { masterId: string }
    const { data, error } = await supabase
      .from('schedules').select('*').eq('master_id', masterId)
      .order('date').order('time')
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true, data })
  })

  fastify.post('/schedules', async (req, reply) => {
    const body = req.body as any
    const { data, error } = await supabase.from('schedules').insert({
      master_id: body.master_id, date: body.date, time: body.time,
    }).select().single()
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.code(201).send({ ok: true, data })
  })

  fastify.delete('/schedules/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true })
  })

  // ===== ВІДГУКИ =====
  fastify.get('/reviews', async (_, reply) => {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true, data })
  })

  fastify.post('/reviews', async (req, reply) => {
    const body = req.body as any
    const { data, error } = await supabase.from('reviews').insert({
      name: body.name, service: body.service, rating: body.rating || 5, text: body.text,
    }).select().single()
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.code(201).send({ ok: true, data })
  })

  fastify.put('/reviews/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as any
    const { data, error } = await supabase.from('reviews').update({
      name: body.name, service: body.service, rating: body.rating, text: body.text,
    }).eq('id', id).select().single()
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true, data })
  })

  fastify.delete('/reviews/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true })
  })

  // ===== ЗАПИСИ =====
  fastify.get('/appointments', async (_, reply) => {
    const { data, error } = await supabase
      .from('appointments').select('*').order('date', { ascending: false })
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true, data })
  })

fastify.put('/appointments/:id', async (req, reply) => {
  const { id } = req.params as { id: string }
  const body = req.body as any
  const { data, error } = await supabase.from('appointments').update({
    client_name: body.client_name,
    phone: body.phone,
    comment: body.comment,
    date: body.date,
    time_slot: body.time_slot,
  }).eq('id', id).select().single()
  if (error) return reply.code(500).send({ ok: false, message: error.message })
  return reply.send({ ok: true, data })
})

  fastify.delete('/appointments/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    // Знаходимо запис щоб звільнити слот
    const { data: appointment } = await supabase
      .from('appointments').select('schedule_id').eq('id', id).single()

    if (appointment?.schedule_id) {
      await supabase.from('schedules').update({ is_booked: false }).eq('id', appointment.schedule_id)
    }

    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) return reply.code(500).send({ ok: false, message: error.message })
    return reply.send({ ok: true })
  })
}