import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { masters as team, services, type ServiceId } from '../data/content';
import { BOOKING_EVENT, type BookingIntent } from '../lib/booking';

type Status = 'FULL' | 'AVAILABLE';
type Step = 'date' | 'time' | 'details' | 'done';
interface MasterSlots { masterId: string; name: string; role: string; times: string[] }

const API = (import.meta.env.PUBLIC_API_URL as string | undefined) ?? '';
const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const pad = (n: number) => String(n).padStart(2, '0');
const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const prettyDate = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', weekday: 'long' });

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error ?? 'Не вдалося виконати запит'), { status: res.status });
  return body as T;
}

const slide = {
  initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Booking() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('date');
  const [serviceId, setServiceId] = useState<ServiceId>('manicure');
  const [lockedMaster, setLockedMaster] = useState<string | null>(null);
  const [cursor, setCursor] = useState(startOfMonth());
  const [days, setDays] = useState<Record<string, Status>>({});
  const [date, setDate] = useState<string | null>(null);
  const [options, setOptions] = useState<MasterSlots[]>([]);
  const [masterId, setMasterId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<BookingIntent>).detail ?? {};
      setServiceId(d.serviceId ?? 'manicure');
      setLockedMaster(d.masterId ?? null);
      setStep('date'); setDate(null); setTime(null); setMasterId(null); setError(null);
      setCursor(startOfMonth());
      setOpen(true);
    };
    window.addEventListener(BOOKING_EVENT, onOpen);
    return () => window.removeEventListener(BOOKING_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true); setError(null);
    api<{ days: { date: string; status: Status }[] }>(`/api/booking/availability?month=${monthKey(cursor)}&serviceId=${serviceId}`)
      .then((r) => !cancelled && setDays(Object.fromEntries(r.days.map((d) => [d.date, d.status]))))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [open, cursor, serviceId]);

  const loadSlots = async (d: string) => {
    setLoading(true); setError(null);
    try {
      const r = await api<{ masters: MasterSlots[] }>(`/api/booking/masters-slots?date=${d}&serviceId=${serviceId}`);
      const list = lockedMaster ? r.masters.filter((m) => m.masterId === lockedMaster) : r.masters;
      setOptions(list);
      setMasterId(list[0]?.masterId ?? null);
      setTime(null);
      setDate(d);
      setStep('time');
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      await api('/api/booking/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: name, phone, serviceId, masterId, date, timeSlot: time, comment }),
      });
      setStep('done');
    } catch (e) {
      const err = e as Error & { status?: number };
      setError(err.message);
      if (err.status === 409 && date) await loadSlots(date);
    } finally { setLoading(false); }
  };

  const offset = (cursor.getDay() + 6) % 7;
  const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const isCurrentMonth = monthKey(cursor) === monthKey(new Date());
  const current = options.find((o) => o.masterId === masterId);
  const service = services.find((s) => s.id === serviceId)!;
  const masterName = team.find((m) => m.id === masterId)?.name ?? current?.name;
  const back = () => { setError(null); setStep(step === 'details' ? 'time' : 'date'); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="calendar" className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/60 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <motion.div role="dialog" aria-modal="true" aria-label="Онлайн-запис"
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto bg-cream p-6 sm:p-10"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-2xl">Запис на візит</span>
              <button aria-label="Закрити" onClick={close} className="rounded-full p-2 hover:bg-sand"><X size={20} /></button>
            </div>
              {(
                <motion.div key="date" {...slide}>
                  <label className="text-sm text-cinnamon" htmlFor="svc">Послуга</label>
                  <select id="svc" value={serviceId} onChange={(e) => setServiceId(e.target.value as ServiceId)}
                    className="mt-2 w-full border border-sand bg-transparent px-4 py-3">
                    {services.filter((s) => !lockedMaster || team.find((m) => m.id === lockedMaster)?.serviceIds.includes(s.id))
                      .map((s) => <option key={s.id} value={s.id}>{s.title}, {s.price}</option>)}
                  </select>

                  <div className="mt-8 flex items-center justify-between">
                    <h3 className="font-serif text-2xl">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</h3>
                    <div className="flex gap-2">
                      <button aria-label="Попередній місяць" disabled={isCurrentMonth} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                        className="rounded-full border border-sand p-2 disabled:opacity-30"><ChevronLeft size={16} /></button>
                      <button aria-label="Наступний місяць" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                        className="rounded-full border border-sand p-2"><ChevronRight size={16} /></button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-cinnamon">
                    {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
                  </div>
                  <div className={`mt-2 grid grid-cols-7 gap-1.5 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                    {cells.map((day, i) => {
                      if (!day) return <span key={`e${i}`} />;
                      const key = `${monthKey(cursor)}-${pad(day)}`;
                      const free = days[key] === 'AVAILABLE';
                      return (
                        <motion.button key={key} disabled={!free || loading} whileHover={free ? { scale: 1.08 } : undefined} whileTap={free ? { scale: 0.94 } : undefined}
                          onClick={() => loadSlots(key)}
                          aria-label={`${day} ${MONTHS[cursor.getMonth()]}: ${free ? 'є вільні віконця' : 'всі місця зайняті'}`}
                          className={`aspect-square rounded-full border text-sm ${free
                            ? 'border-[#B9D1B4] bg-[#E4EEE0] text-[#2F5D3A]'
                            : 'cursor-not-allowed border-[#E6C4BE] bg-[#F4DEDA] text-[#9A3B30]'}`}>
                          {day}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex gap-6 text-xs text-cinnamon">
                    <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full border border-[#B9D1B4] bg-[#E4EEE0]" />Є вільні віконця</span>
                    <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full border border-[#E6C4BE] bg-[#F4DEDA]" />Всі місця зайняті</span>
                  </div>
                </motion.div>
              )}


            {error && step === 'date' && <p role="alert" className="mt-5 border border-[#E6C4BE] bg-[#F4DEDA] px-4 py-3 text-sm text-[#9A3B30]">{error}</p>}
          </motion.div>
        </motion.div>
      )}

      {open && step !== 'date' && (
        <motion.div key="details-modal" className="fixed inset-0 z-[60] flex items-end justify-center bg-espresso/50 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && (step === 'done' ? close() : back())}>
          <motion.div role="dialog" aria-modal="true" aria-label="Деталі запису"
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto bg-cream p-6 shadow-2xl sm:p-9"
            initial={{ y: 80, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}>
            <div className="mb-6 flex items-center justify-between">
              {step === 'done'
                ? <span className="font-serif text-2xl">Дякуємо!</span>
                : <button onClick={back} className="flex items-center gap-1.5 text-sm text-cinnamon hover:text-espresso"><ArrowLeft size={16} />{step === 'details' ? 'Назад до часу' : 'До календаря'}</button>}
              <button aria-label="Закрити" onClick={close} className="rounded-full p-2 hover:bg-sand"><X size={20} /></button>
            </div>
            <AnimatePresence mode="wait">
              {step === 'time' && date && (
                <motion.div key="time" {...slide}>
                  <p className="text-sm text-cinnamon">{service.title}</p>
                  <h3 className="font-serif text-3xl first-letter:uppercase">{prettyDate(date)}</h3>
                  <p className="mt-8 text-sm text-cinnamon">Майстер</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {options.map((m) => (
                      <button key={m.masterId} onClick={() => { setMasterId(m.masterId); setTime(null); }}
                        className={`border px-4 py-2 text-left text-sm transition-colors ${masterId === m.masterId ? 'border-espresso bg-espresso text-cream' : 'border-sand hover:border-cinnamon'}`}>
                        {m.name}<span className="block text-xs opacity-70">{m.role}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-8 text-sm text-cinnamon">Вільний час</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {current?.times.map((t) => (
                      <button key={t} onClick={() => { setTime(t); setStep('details'); }}
                        className={`border py-3 text-sm transition-colors ${time === t ? 'border-espresso bg-espresso text-cream' : 'border-sand hover:border-cinnamon'}`}>{t}</button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'details' && date && time && (
                <motion.form key="details" {...slide} onSubmit={(e) => { e.preventDefault(); submit(); }}>
                  <p className="text-sm text-cinnamon">{service.title}, {masterName}</p>
                  <h3 className="font-serif text-3xl"><span className="first-letter:uppercase">{prettyDate(date)}</span>, {time}</h3>
                  <label htmlFor="n" className="mt-8 block text-sm text-cinnamon">Ім’я</label>
                  <input id="n" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                    className="mt-2 w-full border border-sand bg-transparent px-4 py-3" />
                  <label htmlFor="p" className="mt-5 block text-sm text-cinnamon">Телефон</label>
                  <input id="p" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+38 0__ ___ __ __" autoComplete="tel"
                    className="mt-2 w-full border border-sand bg-transparent px-4 py-3" />
                  <label htmlFor="c" className="mt-5 block text-sm text-cinnamon">Коментар (необов’язково)</label>
                  <textarea id="c" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)}
                    className="mt-2 w-full resize-none border border-sand bg-transparent px-4 py-3" />
                  <button type="submit" disabled={loading}
                    className="mt-10 w-full rounded-full bg-espresso py-4 text-sm font-semibold text-cream disabled:opacity-50">
                    {loading ? 'Надсилаємо…' : 'Далі, підтвердити'}
                  </button>
                </motion.form>
              )}

              {step === 'done' && date && time && (
                <motion.div key="done" {...slide} className="py-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E4EEE0] text-[#2F5D3A]"><Check size={30} /></motion.div>
                  <h3 className="mt-6 font-serif text-3xl">Вас успішно записано!</h3>
                  <p className="mx-auto mt-3 max-w-sm text-cinnamon">Адміністратор зателефонує вам найближчим часом для підтвердження.</p>
                  <dl className="mt-8 divide-y divide-sand border border-sand text-left text-sm">
                    {[['Послуга', service.title], ['Майстер', masterName ?? ''], ['День', prettyDate(date).split(',')[0]], ['Дата', prettyDate(date).split(',')[1]?.trim() ?? ''], ['Час', time]].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-5 py-3"><dt className="text-cinnamon">{k}</dt><dd className="text-right first-letter:uppercase">{v}</dd></div>
                    ))}
                  </dl>
                  <button onClick={close} className="mt-8 rounded-full border border-espresso px-8 py-3 text-sm hover:bg-espresso hover:text-cream">Закрити</button>
                </motion.div>
              )}
            </AnimatePresence>
            {error && <p role="alert" className="mt-5 border border-[#E6C4BE] bg-[#F4DEDA] px-4 py-3 text-sm text-[#9A3B30]">{error}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
