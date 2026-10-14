import { motion, useReducedMotion } from 'framer-motion';
import { Phone } from 'lucide-react';

export default function FloatingPhone() {
  const reduce = useReducedMotion();
  return (
    <a href="tel:+380000000000" aria-label="Зателефонувати в Manicare"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-cream shadow-lg shadow-espresso/30">
      {!reduce && (
        <motion.span aria-hidden className="absolute inset-0 rounded-full border border-cinnamon"
          animate={{ scale: [1, 1.7], opacity: [0.7, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} />
      )}
      <motion.span whileTap={{ scale: 0.88 }} className="relative"><Phone size={22} /></motion.span>
    </a>
  );
}
