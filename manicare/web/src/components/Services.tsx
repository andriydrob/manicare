import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { filters, services, type Service } from '../data/content';
import { openBooking } from '../lib/booking';

function Card({ s }: { s: Service }) {
  return (
    <div className="group flex h-full flex-col bg-cream p-7 transition-colors duration-500 focus-within:bg-[#F4EBDF] md:p-8 md:hover:bg-[#F4EBDF]">
      <h3 className="font-serif text-3xl leading-tight">{s.title}</h3>
      <p className="mt-4 leading-relaxed text-cinnamon">{s.description}</p>
      <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 md:grid-rows-[0fr] md:group-focus-within:grid-rows-[1fr] md:group-hover:grid-rows-[1fr]">
        <ul className="space-y-2 overflow-hidden text-sm">
          {s.includes.map((i, idx) => (
            <li key={i} className={`flex gap-2 ${idx === 0 ? 'mt-6' : ''}`}><Check size={16} className="mt-0.5 shrink-0 text-beige" />{i}</li>
          ))}
        </ul>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-8">
        <div>
          <p className="font-serif text-2xl">{s.price}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-cinnamon"><Clock size={14} />{s.duration}</p>
        </div>
        <button onClick={() => openBooking({ serviceId: s.id })}
          className="rounded-full border border-espresso px-5 py-2.5 text-sm transition-colors hover:bg-espresso hover:text-cream">Записатися</button>
      </div>
    </div>
  );
}

const short: Record<string, string> = { manicure: 'Манікюр', pedicure: 'Педикюр', 'nail-extensions': 'Нарощування нігтів', 'lash-extensions': 'Вії', brows: 'Брови' };

export default function Services() {
  const [active, setActive] = useState<(typeof filters)[number]['key']>('all');
  const [slideIdx, setSlideIdx] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    tabs.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [slideIdx]);
  const list = services.filter((s) => active === 'all' || s.group === active);

  const onScroll = () => {
    const el = track.current;
    if (!el || !el.firstElementChild) return;
    const step = (el.firstElementChild as HTMLElement).offsetWidth + 16;
    setSlideIdx(Math.min(services.length - 1, Math.round(el.scrollLeft / step)));
  };
  const pick = (k: (typeof filters)[number]['key']) => {
    setActive(k); setSlideIdx(0);
    track.current?.scrollTo({ left: 0 });
  };
  const goTo = (i: number) => {
    const el = track.current;
    if (el?.firstElementChild) el.scrollTo({ left: i * ((el.firstElementChild as HTMLElement).offsetWidth + 16), behavior: 'smooth' });
  };

  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="max-w-xl font-serif text-4xl leading-tight sm:text-6xl">Послуги, які хочеться повторювати</h2>
        <div role="tablist" className="hidden gap-1 md:flex">
          {filters.map((f) => (
            <button key={f.key} role="tab" aria-selected={active === f.key} onClick={() => pick(f.key)} className="relative shrink-0 rounded-full px-5 py-2.5 text-sm">
              {active === f.key && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-espresso" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className={`relative transition-colors ${active === f.key ? 'text-cream' : 'text-cinnamon'}`}>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <div ref={tabs} role="tablist" className="-mx-5 mt-8 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {services.map((s, i) => (
            <button key={s.id} role="tab" aria-selected={i === slideIdx} onClick={() => goTo(i)} className="relative shrink-0 rounded-full px-4 py-2.5 text-sm">
              {i === slideIdx && <motion.span layoutId="m-tab" className="absolute inset-0 rounded-full bg-espresso" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className={`relative ${i === slideIdx ? 'text-cream' : 'text-cinnamon'}`}>{short[s.id]}</span>
            </button>
          ))}
        </div>
        <div ref={track} onScroll={onScroll} className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {services.map((s) => (
            <article key={s.id} className="w-[84%] shrink-0 snap-center border border-sand"><Card s={s} /></article>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {services.map((s, i) => (
            <button key={s.id} aria-label={s.title} onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? 'w-8 bg-espresso' : 'w-1.5 bg-beige'}`} />
          ))}
        </div>
      </div>

      <motion.div layout className="mt-14 hidden gap-px overflow-hidden border border-sand bg-sand md:grid md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s) => (
            <motion.article key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}><Card s={s} /></motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
