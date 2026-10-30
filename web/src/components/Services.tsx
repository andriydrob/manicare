import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { filters, services, shortTitle, type Service } from '../data/content';
import { openBooking } from '../lib/booking';
import SnapSlider from './SnapSlider';

function Card({ s }: { s: Service }) {
  return (
    <div className="group flex h-full flex-col bg-cream p-7 transition-colors duration-500 focus-within:bg-[#F4EBDF] md:p-8 md:hover:bg-[#F4EBDF]">
      <h3 className="font-serif text-3xl leading-tight">{s.title}</h3>
      <p className="mt-4 leading-relaxed text-cinnamon">{s.description}</p>
      {/* На десктопі з hover-пристроєм список з'являється плавно, без зміни висоти картки */}
      <ul className="mt-6 space-y-2 text-sm transition duration-500 md:[@media(hover:hover)]:translate-y-1 md:[@media(hover:hover)]:opacity-0 md:[@media(hover:hover)]:group-focus-within:translate-y-0 md:[@media(hover:hover)]:group-focus-within:opacity-100 md:[@media(hover:hover)]:group-hover:translate-y-0 md:[@media(hover:hover)]:group-hover:opacity-100">
        {s.includes.map((i) => (
          <li key={i} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-beige" />{i}</li>
        ))}
      </ul>
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

export default function Services() {
  const [active, setActive] = useState<(typeof filters)[number]['key']>('all');
  const list = services.filter((s) => active === 'all' || s.group === active);

  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="max-w-xl font-serif text-4xl leading-tight sm:text-6xl">Послуги, які хочеться повторювати</h2>
        <div role="tablist" className="hidden gap-1 md:flex">
          {filters.map((f) => (
            <button key={f.key} role="tab" aria-selected={active === f.key} onClick={() => setActive(f.key)} className="relative rounded-full px-5 py-2.5 text-sm">
              {active === f.key && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-espresso" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className={`relative transition-colors ${active === f.key ? 'text-cream' : 'text-cinnamon'}`}>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <SnapSlider items={services} getId={(s) => s.id} getLabel={(s) => shortTitle[s.id]} layoutKey="services-tab" render={(s) => <Card s={s} />} />

<motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
  className="relative mt-14 hidden md:block">
  <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {list.map((s) => (
      <article key={s.id} className="w-[360px] shrink-0 snap-start border border-sand bg-sand/0 lg:w-[400px]">
        <Card s={s} />
      </article>
    ))}
  </div>
</motion.div>
    </section>
  );
}
