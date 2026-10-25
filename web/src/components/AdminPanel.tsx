import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Plus, Trash2, Pencil, Check } from 'lucide-react'

const API_URL = import.meta.env.PUBLIC_API_URL || ''
const SERVICES = [
  { id: 'manicure', label: 'Манікюр' },
  { id: 'pedicure', label: 'Педикюр' },
  { id: 'nail-extensions', label: 'Нарощування нігтів' },
  { id: 'lash-extensions', label: 'Нарощування вій' },
  { id: 'brows', label: 'Брови' },
]

type Tab = 'masters' | 'reviews' | 'appointments'

interface Master { id: string; name: string; role: string; about: string; photo_url: string; service_ids: string[] }
interface Schedule { id: string; master_id: string; date: string; time: string; is_booked: boolean }
interface Review { id: string; name: string; service: string; rating: number; text: string }
interface Appointment { id: string; client_name: string; phone: string; service_id: string; master_id: string; date: string; time_slot: string; comment: string }

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const MONTHS = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень']

function pad(n: number) { return String(n).padStart(2, '0') }

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const offset = (first === 0 ? 6 : first - 1)
  const total = new Date(year, month + 1, 0).getDate()
  return { offset, total }
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm mx-4">
        <p className="text-white text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-[#aaa] border border-[#333] rounded-lg hover:text-white transition-colors">
            Скасувати
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
            Видалити
          </button>
        </div>
      </div>
    </div>
  )
}

function MasterSchedule({ master, onClose }: { master: Master; onClose: () => void }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [timeInput, setTimeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState<{ id: string } | null>(null)

  const loadSchedules = async () => {
    const res = await fetch(`${API_URL}/api/admin/schedules/${master.id}`)
    const data = await res.json()
    if (data.ok) setSchedules(data.data)
  }

  useEffect(() => { loadSchedules() }, [])

  const { offset, total } = getCalendarDays(year, month)

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const dateStr = (day: number) => `${year}-${pad(month + 1)}-${pad(day)}`
  const slotsForDate = (date: string) => schedules.filter(s => s.date === date)
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  const addSlot = async () => {
    if (!selectedDate || !timeInput) return
    setLoading(true)
    await fetch(`${API_URL}/api/admin/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ master_id: master.id, date: selectedDate, time: timeInput }),
    })
    setTimeInput('')
    await loadSchedules()
    setLoading(false)
  }

  const deleteSlot = async (id: string) => {
    await fetch(`${API_URL}/api/admin/schedules/${id}`, { method: 'DELETE' })
    await loadSchedules()
    setConfirm(null)
  }

  const selectedSlots = selectedDate ? slotsForDate(selectedDate) : []

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {confirm && (
          <ConfirmModal
            message="Видалити цей слот?"
            onConfirm={() => deleteSlot(confirm.id)}
            onCancel={() => setConfirm(null)}
          />
        )}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h3 className="font-semibold">Розклад — {master.name}</h3>
          <button onClick={onClose} className="text-[#aaa] hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg border border-[#333] text-[#aaa] hover:text-white transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg border border-[#333] text-[#aaa] hover:text-white transition-colors"><ChevronRight size={16} /></button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs text-[#555] py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: total }).map((_, i) => {
              const date = dateStr(i + 1)
              const slots = slotsForDate(date)
              const isSelected = selectedDate === date
              const isPast = date < today
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(isSelected ? null : date)}
                  disabled={isPast}
                  className={`relative aspect-square rounded-xl text-sm flex flex-col items-center justify-center transition-colors
                    ${isPast ? 'text-[#444] cursor-not-allowed' : 'hover:bg-[#2a2a2a]'}
                    ${isSelected ? 'bg-white text-black hover:bg-white' : ''}
                  `}
                >
                  <span>{i + 1}</span>
                  {slots.length > 0 && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-white'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-5 pt-5 border-t border-[#2a2a2a]">
              <p className="text-sm text-[#aaa] mb-3">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="time"
                  value={timeInput}
                  onChange={e => setTimeInput(e.target.value)}
                  className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors"
                />
                <button
                  onClick={addSlot}
                  disabled={loading || !timeInput}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#eee] disabled:opacity-50 transition-colors"
                >
                  <Plus size={14} /> Додати
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSlots.length === 0 && <p className="text-sm text-[#555]">Немає слотів на цей день</p>}
                {selectedSlots.sort((a, b) => a.time.localeCompare(b.time)).map(slot => (
                  <div key={slot.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm
                    ${slot.is_booked ? 'border-red-900 text-red-400' : 'border-[#333] text-[#ddd]'}`}>
                    <span>{slot.time}</span>
                    {slot.is_booked && <span className="text-xs text-red-500">зайнято</span>}
                    {!slot.is_booked && (
                      <button onClick={() => setConfirm({ id: slot.id })} className="text-[#555] hover:text-red-400 transition-colors">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('masters')
  const [masters, setMasters] = useState<Master[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleFor, setScheduleFor] = useState<Master | null>(null)
  const [confirm, setConfirm] = useState<{ type: 'master' | 'review' | 'appointment'; id: string; label: string } | null>(null)

  const emptyMaster = { name: '', role: '', about: '', photo_url: '', service_ids: [] as string[] }
  const [masterForm, setMasterForm] = useState(emptyMaster)
  const [editingMaster, setEditingMaster] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showMasterForm, setShowMasterForm] = useState(false)

  const emptyReview = { name: '', service: '', rating: 5, text: '' }
  const [reviewForm, setReviewForm] = useState(emptyReview)
  const [editingReview, setEditingReview] = useState<string | null>(null)

  const [editingAppointment, setEditingAppointment] = useState<string | null>(null)
  const [appointmentForm, setAppointmentForm] = useState({ client_name: '', phone: '', comment: '', date: '', time_slot: '' })

  const [filterService, setFilterService] = useState('')
  const [sortDate, setSortDate] = useState<'asc' | 'desc'>('desc')

  const filteredAppointments = appointments
    .filter(a => filterService ? a.service_id === filterService : true)
    .sort((a, b) => sortDate === 'desc'
      ? b.date.localeCompare(a.date) || b.time_slot.localeCompare(a.time_slot)
      : a.date.localeCompare(b.date) || a.time_slot.localeCompare(b.time_slot)
    )

  const api = async (path: string, method = 'GET', body?: unknown) => {
    const headers: Record<string, string> = {}
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    const res = await fetch(`${API_URL}/api/admin${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  }

  const loadAll = async () => {
    const [m, r, a] = await Promise.all([api('/masters'), api('/reviews'), api('/appointments')])
    if (m.ok) setMasters(m.data)
    if (r.ok) setReviews(r.data)
    if (a.ok) setAppointments(a.data)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile) return masterForm.photo_url
    const fd = new FormData()
    fd.append('file', photoFile)
    const res = await fetch(`${API_URL}/api/admin/masters/upload-photo`, { method: 'POST', body: fd })
    const data = await res.json()
    return data.ok ? data.url : masterForm.photo_url
  }

  const saveMaster = async () => {
    if (!masterForm.name || !masterForm.role) return
    const photo_url = await uploadPhoto()
    const payload = { ...masterForm, photo_url }
    if (editingMaster) {
      await api(`/masters/${editingMaster}`, 'PUT', payload)
    } else {
      await api('/masters', 'POST', payload)
    }
    setMasterForm(emptyMaster)
    setEditingMaster(null)
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowMasterForm(false)
    loadAll()
  }

  const startEditMaster = (m: Master) => {
    setEditingMaster(m.id)
    setMasterForm({ name: m.name, role: m.role, about: m.about, photo_url: m.photo_url, service_ids: m.service_ids })
    setPhotoPreview(m.photo_url || null)
    setShowMasterForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleService = (id: string) => {
    setMasterForm(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(id)
        ? prev.service_ids.filter(s => s !== id)
        : [...prev.service_ids, id]
    }))
  }

  const saveReview = async () => {
    if (!reviewForm.name || !reviewForm.text) return
    if (editingReview) {
      await api(`/reviews/${editingReview}`, 'PUT', reviewForm)
    } else {
      await api('/reviews', 'POST', reviewForm)
    }
    setReviewForm(emptyReview)
    setEditingReview(null)
    loadAll()
  }

  const startEditReview = (r: Review) => {
    setEditingReview(r.id)
    setReviewForm({ name: r.name, service: r.service, rating: r.rating, text: r.text })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = async () => {
    if (!confirm) return
    if (confirm.type === 'master') await api(`/masters/${confirm.id}`, 'DELETE')
    if (confirm.type === 'review') await api(`/reviews/${confirm.id}`, 'DELETE')
    if (confirm.type === 'appointment') await api(`/appointments/${confirm.id}`, 'DELETE')
    setConfirm(null)
    loadAll()
  }

  const startEditAppointment = (a: Appointment) => {
    setEditingAppointment(a.id)
    setAppointmentForm({ client_name: a.client_name, phone: a.phone, comment: a.comment, date: a.date, time_slot: a.time_slot })
  }

  const saveAppointment = async () => {
    if (!editingAppointment) return
    await api(`/appointments/${editingAppointment}`, 'PUT', appointmentForm)
    setEditingAppointment(null)
    loadAll()
  }

  const logout = () => { sessionStorage.removeItem('admin_token'); window.location.href = '/adminmanicare' }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <p className="text-[#aaa] text-sm">Завантаження...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {confirm && (
        <ConfirmModal
          message={`Видалити "${confirm.label}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      {scheduleFor && <MasterSchedule master={scheduleFor} onClose={() => setScheduleFor(null)} />}

      <header className="border-b border-[#222] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0f0f0f] z-30">
        <h1 className="text-lg font-semibold">Manicare · Адмін</h1>
        <button onClick={logout} className="text-sm text-[#aaa] hover:text-white transition-colors">Вийти</button>
      </header>

      <div className="flex">
        <nav className="w-48 shrink-0 border-r border-[#222] min-h-[calc(100vh-57px)] p-4 sticky top-[57px] self-start">
          {(['masters', 'reviews', 'appointments'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors
                ${tab === t ? 'bg-white text-black font-medium' : 'text-[#aaa] hover:text-white hover:bg-[#1a1a1a]'}`}>
              {t === 'masters' ? 'Майстри' : t === 'reviews' ? 'Відгуки' : 'Записи'}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-6 max-w-4xl">

          {/* ===== МАЙСТРИ ===== */}
          {tab === 'masters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Майстри ({masters.length})</h2>
                <button onClick={() => { setShowMasterForm(true); setEditingMaster(null); setMasterForm(emptyMaster); setPhotoPreview(null) }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#eee] transition-colors">
                  <Plus size={14} /> Додати майстра
                </button>
              </div>

              {showMasterForm && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-medium">{editingMaster ? 'Редагувати майстра' : 'Новий майстер'}</h3>
                    <button onClick={() => { setShowMasterForm(false); setEditingMaster(null); setMasterForm(emptyMaster) }}
                      className="text-[#aaa] hover:text-white transition-colors"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#aaa] block mb-1.5">Імʼя</label>
                      <input value={masterForm.name} onChange={e => setMasterForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Катерина" className="w-full bg-[#111] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#555] transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-[#aaa] block mb-1.5">Роль</label>
                      <input value={masterForm.role} onChange={e => setMasterForm(p => ({ ...p, role: e.target.value }))}
                        placeholder="ТОП майстер манікюру" className="w-full bg-[#111] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#555] transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#aaa] block mb-1.5">Опис</label>
                      <textarea value={masterForm.about} onChange={e => setMasterForm(p => ({ ...p, about: e.target.value }))}
                        placeholder="Короткий опис майстра..." rows={2}
                        className="w-full bg-[#111] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#555] transition-colors resize-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#aaa] block mb-1.5">Фото</label>
                      <div className="flex items-center gap-4">
                        {photoPreview && <img src={photoPreview} alt="" className="w-16 h-16 rounded-full object-cover bg-[#333]" />}
                        <label className="cursor-pointer px-4 py-2 border border-[#333] rounded-lg text-sm text-[#aaa] hover:text-white hover:border-[#555] transition-colors">
                          Вибрати фото
                          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#aaa] block mb-2">Послуги</label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICES.map(s => (
                          <button key={s.id} onClick={() => toggleService(s.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors
                              ${masterForm.service_ids.includes(s.id) ? 'bg-white text-black border-white' : 'bg-transparent text-[#aaa] border-[#333] hover:border-[#555]'}`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={saveMaster} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-[#eee] transition-colors">
                      {editingMaster ? 'Зберегти' : 'Додати'}
                    </button>
                    <button onClick={() => { setShowMasterForm(false); setEditingMaster(null); setMasterForm(emptyMaster) }}
                      className="px-5 py-2.5 border border-[#333] text-[#aaa] text-sm rounded-lg hover:text-white transition-colors">
                      Скасувати
                    </button>
                  </div>
                </div>
              )}

              {masters.map(m => (
                <div key={m.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    {m.photo_url
                      ? <img src={m.photo_url} alt={m.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      : <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-lg shrink-0">{m.name[0]}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-[#aaa]">{m.role}</p>
                      {m.about && <p className="text-xs text-[#666] mt-1 line-clamp-1">{m.about}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.service_ids.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-[#2a2a2a] rounded-md text-[#aaa]">
                            {SERVICES.find(sv => sv.id === s)?.label || s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setScheduleFor(m)}
                        className="px-3 py-1.5 text-xs border border-[#333] rounded-lg text-[#aaa] hover:text-white transition-colors">
                        Розклад
                      </button>
                      <button onClick={() => startEditMaster(m)}
                        className="p-1.5 border border-[#333] rounded-lg text-[#aaa] hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirm({ type: 'master', id: m.id, label: m.name })}
                        className="p-1.5 border border-red-900 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== ВІДГУКИ ===== */}
          {tab === 'reviews' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Відгуки ({reviews.length})</h2>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                <h3 className="font-medium mb-5">{editingReview ? 'Редагувати відгук' : 'Додати відгук'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#aaa] block mb-1.5">Імʼя</label>
                    <input value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Катя С." className="w-full bg-[#111] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#555] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-[#aaa] block mb-1.5">Послуга</label>
                    <select value={reviewForm.service} onChange={e => setReviewForm(p => ({ ...p, service: e.target.value }))}
                      className="w-full bg-[#111] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#555] transition-colors">
                      <option value="">Оберіть послугу</option>
                      {SERVICES.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#aaa] block mb-1.5">Рейтинг</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                          className={`w-9 h-9 rounded-lg border text-sm transition-colors
                            ${reviewForm.rating >= n ? 'bg-white text-black border-white' : 'bg-transparent text-[#aaa] border-[#333]'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-[#aaa] block mb-1.5">Текст</label>
                    <textarea value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                      placeholder="Текст відгуку..." rows={3}
                      className="w-full bg-[#111] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#555] transition-colors resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={saveReview} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-[#eee] transition-colors">
                    {editingReview ? 'Зберегти' : 'Додати відгук'}
                  </button>
                  {editingReview && (
                    <button onClick={() => { setEditingReview(null); setReviewForm(emptyReview) }}
                      className="px-5 py-2.5 border border-[#333] text-[#aaa] text-sm rounded-lg hover:text-white transition-colors">
                      Скасувати
                    </button>
                  )}
                </div>
              </div>

              {reviews.map(r => (
                <div key={r.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 flex justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{r.name}</span>
                      <span className="text-xs text-[#555]">·</span>
                      <span className="text-xs text-[#aaa]">{r.service}</span>
                      <span className="text-xs text-yellow-400">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-sm text-[#ccc]">{r.text}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEditReview(r)}
                      className="p-1.5 border border-[#333] rounded-lg text-[#aaa] hover:text-white transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirm({ type: 'review', id: r.id, label: r.name })}
                      className="p-1.5 border border-red-900 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== ЗАПИСИ ===== */}
          {tab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-semibold text-lg">Записи ({filteredAppointments.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <select value={filterService} onChange={e => setFilterService(e.target.value)}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors text-[#aaa]">
                    <option value="">Всі послуги</option>
                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select value={sortDate} onChange={e => setSortDate(e.target.value as 'asc' | 'desc')}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors text-[#aaa]">
                    <option value="desc">Спочатку нові</option>
                    <option value="asc">Спочатку старі</option>
                  </select>
                </div>
              </div>

              {filteredAppointments.length === 0 && <p className="text-[#555] text-sm">Записів немає</p>}

              {filteredAppointments.map(a => (
                <div key={a.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
                  {editingAppointment === a.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#aaa] block mb-1">Імʼя</label>
                          <input value={appointmentForm.client_name}
                            onChange={e => setAppointmentForm(p => ({ ...p, client_name: e.target.value }))}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs text-[#aaa] block mb-1">Телефон</label>
                          <input value={appointmentForm.phone}
                            onChange={e => setAppointmentForm(p => ({ ...p, phone: e.target.value }))}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs text-[#aaa] block mb-1">Дата</label>
                          <input type="date" value={appointmentForm.date}
                            onChange={e => setAppointmentForm(p => ({ ...p, date: e.target.value }))}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs text-[#aaa] block mb-1">Час</label>
                          <input type="time" value={appointmentForm.time_slot}
                            onChange={e => setAppointmentForm(p => ({ ...p, time_slot: e.target.value }))}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-[#aaa] block mb-1">Коментар</label>
                          <input value={appointmentForm.comment}
                            onChange={e => setAppointmentForm(p => ({ ...p, comment: e.target.value }))}
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#555] transition-colors" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveAppointment}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#eee] transition-colors">
                          <Check size={14} /> Зберегти
                        </button>
                        <button onClick={() => setEditingAppointment(null)}
                          className="px-4 py-2 border border-[#333] text-[#aaa] text-sm rounded-lg hover:text-white transition-colors">
                          Скасувати
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{a.client_name}</p>
                        <p className="text-sm text-[#aaa] mt-0.5">{a.phone}</p>
                        {a.comment && <p className="text-sm text-[#666] mt-1">"{a.comment}"</p>}
                        <p className="text-xs text-[#555] mt-2">
                          {SERVICES.find(s => s.id === a.service_id)?.label || a.service_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#aaa]">{a.date} · {a.time_slot}</p>
                        <div className="flex gap-2 mt-3 justify-end">
                          <button onClick={() => startEditAppointment(a)}
                            className="p-1.5 border border-[#333] rounded-lg text-[#aaa] hover:text-white transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setConfirm({ type: 'appointment', id: a.id, label: a.client_name })}
                            className="p-1.5 border border-red-900 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}