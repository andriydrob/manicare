import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props<T> {
  items: T[];
  getId: (t: T) => string;
  getLabel: (t: T) => string;
  render: (t: T, i: number) => ReactNode;
  layoutKey: string;
}

// Мобільний слайдер: таби + свайп із прилипанням + крапки. Видимий лише до md.
export default function SnapSlider<T>({ items, getId, getLabel, render, layoutKey }: Props<T>) {
  const [idx, setIdx] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);

  const step = () => {
    const el = track.current?.firstElementChild as HTMLElement | undefined;
    return el ? el.offsetWidth + 16 : 1;
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setIdx(Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / step()))));
  };
  const goTo = (i: number) => track.current?.scrollTo({ left: i * step(), behavior: 'smooth' });

  useEffect(() => {
    const t = tabs.current;
    const b = t?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (t && b) t.scrollTo({ left: b.offsetLeft - (t.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
  }, [idx]);

  const hide = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
  return (
    <div className="md:hidden">
      <div ref={tabs} role="tablist" className={`-mx-5 mt-8 flex gap-1 overflow-x-auto px-5 ${hide}`}>
        {items.map((t, i) => (
          <button key={getId(t)} role="tab" aria-selected={i === idx} onClick={() => goTo(i)} className="relative shrink-0 rounded-full px-4 py-2.5 text-sm">
            {i === idx && <motion.span layoutId={layoutKey} className="absolute inset-0 rounded-full bg-espresso" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className={`relative ${i === idx ? 'text-cream' : 'text-cinnamon'}`}>{getLabel(t)}</span>
          </button>
        ))}
      </div>
      <div ref={track} onScroll={onScroll} className={`-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-2 ${hide}`}>
        {items.map((t, i) => (
          <div key={getId(t)} className="w-[84%] shrink-0 snap-center overflow-hidden border border-sand">{render(t, i)}</div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {items.map((t, i) => (
          <button key={getId(t)} aria-label={getLabel(t)} onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-espresso' : 'w-1.5 bg-beige'}`} />
        ))}
      </div>
    </div>
  );
}
