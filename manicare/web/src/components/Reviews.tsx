import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { reviews } from '../data/content';

export default function Reviews() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const go = (d: number) => setState(([i]) => [(i + d + reviews.length) % reviews.length, d]);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [paused]);

  const r = reviews[index];
  return (
    <section id="reviews" className="mx-auto max-w-4xl px-6 py-28 text-center"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <h2 className="font-serif text-5xl sm:text-6xl">Що кажуть наші клієнтки</h2>
      <div className="relative mt-14 min-h-[17rem]" aria-live="polite">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.figure key={index} custom={dir}
            variants={{ in: (d: number) => ({ opacity: 0, x: d * 60 }), show: { opacity: 1, x: 0 }, out: (d: number) => ({ opacity: 0, x: d * -60 }) }}
            initial="in" animate="show" exit="out" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex justify-center gap-1" aria-label={`Оцінка ${r.rating} з 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={18} className={i < r.rating ? 'fill-beige text-beige' : 'text-sand'} />
              ))}
            </div>
            <blockquote className="mt-8 font-serif text-3xl leading-snug sm:text-4xl">«{r.text}»</blockquote>
            <figcaption className="mt-8 text-sm text-cinnamon">{r.name}, {r.service}</figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-10 flex items-center justify-center gap-6">
        <button aria-label="Попередній відгук" onClick={() => go(-1)} className="rounded-full border border-sand p-2.5 hover:border-espresso"><ChevronLeft size={18} /></button>
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button key={i} aria-label={`Відгук ${i + 1}`} onClick={() => setState([i, i > index ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-espresso' : 'w-1.5 bg-beige'}`} />
          ))}
        </div>
        <button aria-label="Наступний відгук" onClick={() => go(1)} className="rounded-full border border-sand p-2.5 hover:border-espresso"><ChevronRight size={18} /></button>
      </div>
    </section>
  );
}
