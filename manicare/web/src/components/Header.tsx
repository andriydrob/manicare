import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { openBooking } from '../lib/booking';

const links = [['#services', 'Послуги'], ['#about', 'Про нас'], ['#team', 'Команда'], ['#reviews', 'Відгуки'], ['#contacts', 'Контакти']];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [menu]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled ? 'border-b border-sand bg-cream/90 py-3 backdrop-blur' : 'py-4 sm:py-6'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6">
          <a href="#top" className="font-serif text-xl font-medium tracking-[0.26em] sm:text-2xl">MANICARE</a>
          <nav className="hidden items-center gap-9 text-sm text-cinnamon lg:flex" aria-label="Основна навігація" onMouseLeave={() => setHover(null)}>
            {links.map(([href, label]) => (
              <a key={href} href={href} onMouseEnter={() => setHover(href)} onFocus={() => setHover(href)} onBlur={() => setHover(null)}
                className={`relative py-1 transition-colors ${hover === href ? 'text-espresso' : ''}`}>
                {label}
                {hover === href && (
                  <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-px bg-espresso"
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }} />
                )}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ backgroundColor: '#2A1E1C', color: '#FBF8F5' }} whileTap={{ scale: 0.97 }} onClick={() => openBooking()}
              className="hidden rounded-full border border-espresso px-5 py-2.5 text-xs font-semibold tracking-[0.14em] sm:block">
              ЗАБРОНЮВАТИ ВІЗИТ
            </motion.button>
            <button aria-label="Відкрити меню" aria-expanded={menu} onClick={() => setMenu(true)} className="-mr-2 p-2 lg:hidden"><Menu size={26} /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.aside role="dialog" aria-modal="true" aria-label="Меню"
              className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-cream p-6"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 32 }}>
              <button aria-label="Закрити меню" onClick={() => setMenu(false)} className="-mr-2 self-end p-2"><X size={26} /></button>
              <nav className="mt-6 flex flex-col" aria-label="Мобільна навігація">
                {links.map(([href, label], i) => (
                  <motion.a key={href} href={href} onClick={() => setMenu(false)}
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b border-sand py-4 font-serif text-3xl">{label}</motion.a>
                ))}
              </nav>
              <button onClick={() => { setMenu(false); openBooking(); }}
                className="mt-auto rounded-full border border-espresso py-4 text-sm font-semibold tracking-[0.14em] active:bg-espresso active:text-cream">
                ОНЛАЙН ЗАПИС
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
