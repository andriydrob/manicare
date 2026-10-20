import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { reviews } from '../data/content';

export default function Reviews() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const [minH, setMinH] = useState(0);
  const figRef = useRef<HTMLElement | null>(null);

  const go = (d: number) => setState(([i]) => [(i + d + reviews.length) % reviews.length, d]);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    if (figRef.current) {
      const h = figRef.current.offsetHeight;
      setMinH((prev) => Math.max(prev, h));
    }
  });

  const r = reviews[index];
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="reviews" className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <h2 className="font-serif text-5xl sm:text-6xl">Що кажуть наші клієнтки</h2>

      {/* Контейнер фіксується по максимальній висоті відгуку */}
      <div className="relative mt-14 overflow-hidden" style={{ minHeight: minH || undefined }} aria-live="polite">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.figure key={index} ref={figRef} custom={dir}
            variants={{
              in:   (d: number) => ({ opacity: 0, x: d * 48 }),
              show: { opacity: 1, x: 0 },
              out:  (d: number) => ({ opacity: 0, x: d * -48 }),
            }}
            initial="in" animate="show" exit="out"
            transition={{ duration: 0.4, ease }}>
            <div className="flex justify-center gap-1" aria-label={`Оцінка ${r.rating} з 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={18} className={i < r.rating ? 'fill-beige text-beige' : 'text-sand'} />
              ))}
            </div>
            <blockquote className="mt-8 font-serif text-3xl leading-snug sm:text-4xl">
              «{r.text}»
            </blockquote>
            <figcaption className="mt-8 text-sm text-cinnamon">{r.name}, {r.service}</figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-center gap-6">
        <button aria-label="Попередній відгук" onClick={() => go(-1)}
          className="rounded-full border border-sand p-2.5 hover:border-espresso">
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button key={i} aria-label={`Відгук ${i + 1}`}
              onClick={() => setState([i, i > index ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-espresso' : 'w-1.5 bg-beige'}`} />
          ))}
        </div>
        <button aria-label="Наступний відгук" onClick={() => go(1)}
          className="rounded-full border border-sand p-2.5 hover:border-espresso">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}