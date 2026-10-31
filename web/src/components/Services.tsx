import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { filters, services, shortTitle, type Service } from '../data/content';
import { openBooking } from '../lib/booking';
import SnapSlider from './SnapSlider';

function Card({ s }: { s: Service }) {
  return (
    <div className="group flex h-full flex-col bg-cream p-7 transition-colors duration-500 focus-within:bg-[#F4EBDF] md:p-8 md:hover:bg-[#F4EBDF]">
      <h3 className="font-serif text-3xl leading-tight">{s.title}</h3>
      <p className="mt-4 leading-relaxed text-cinnamon">{s.description}</p>
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
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Стан для відстеження можливості скролу вліво/вправо
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Функція перевірки позиції скролу
  const checkScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    
    // Чи є що скролити взагалі?
    const hasOverflow = el.scrollWidth > el.clientWidth;
    if (!hasOverflow) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    // Перевіряємо чи ми на початку (враховуємо 1px похибки для рендерингу)
    setCanScrollLeft(el.scrollLeft > 0);
    
    // Перевіряємо чи ми в кінці
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  // Перевіряємо стан при монтуванні, зміні фільтра та зміні розміру вікна
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [active]);

  // Функція для прокрутки
  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    
    // Прокручуємо на ширину видимої області (або можна на ширину картки)
    const scrollAmount = el.clientWidth * 0.8; // 80% ширини контейнера
    el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  };

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
        
        {/* ЛІВА СТРІЛКА (з'являється тільки якщо є куди скролити вліво) */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Прокрутити вліво"
            onClick={() => scrollBy(-1)}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-sand bg-cream p-2.5 shadow-sm transition hover:bg-espresso hover:text-cream lg:-left-6"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* ПРАВА СТРІЛКА (зникає, коли досягнуто кінця) */}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Прокрутити вправо"
            onClick={() => scrollBy(1)}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-sand bg-cream p-2.5 shadow-sm transition hover:bg-espresso hover:text-cream lg:-right-6"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div
          ref={scrollerRef}
          onScroll={checkScroll} // Відстежуємо скрол
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((s) => (
            <article key={s.id} className="w-full shrink-0 snap-start border border-sand bg-sand/0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <Card s={s} />
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}