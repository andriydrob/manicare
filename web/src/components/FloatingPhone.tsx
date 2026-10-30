import { motion, useReducedMotion } from 'framer-motion';
import { Phone } from 'lucide-react';

export default function FloatingPhone() {
  const reduce = useReducedMotion();
  return (
    <a href="tel:+380739009073" aria-label="Зателефонувати в Manicare"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-cream shadow-lg shadow-espresso/30">
      {!reduce && <>
        <motion.span aria-hidden className="absolute inset-0 rounded-full bg-espresso/40"
          animate={{ scale: [1, 2], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.5 }} />
        <motion.span aria-hidden className="absolute inset-0 rounded-full bg-espresso/25"
          animate={{ scale: [1, 2.6], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5, repeatDelay: 0.5 }} />
      </>}
      <motion.span whileTap={{ scale: 0.88 }} className="relative"><Phone size={22} /></motion.span>
    </a>
  );
}