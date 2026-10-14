import { motion } from 'framer-motion';
import { openBooking } from '../lib/booking';
import PhotoSlot from './PhotoSlot';

const words = ['Мистецтво', 'відчувати', 'красу.'];
const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-5 pb-16 pt-28 sm:px-6 lg:flex lg:min-h-screen lg:items-center lg:pt-32">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <h1 className="font-serif text-[3.2rem] font-normal leading-[1] sm:text-7xl lg:text-8xl">
            {words.map((w, i) => (
              <span key={w} className="block overflow-hidden pb-1.5">
                <motion.span className={`block ${i === 1 ? 'pl-[0.5em] italic text-cinnamon' : ''}`}
                  initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.15 + i * 0.14, ease }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.div className="mt-8 max-w-xl sm:mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.9 }}>
            <p className="text-base leading-relaxed text-cinnamon sm:text-lg">
              Естетика нігтів, виразний погляд та турбота про тіло. Авторський манікюр, педикюр, нарощування та архітектура брів у просторі вашого комфорту.
            </p>
            <motion.button whileHover={{ backgroundColor: '#2A1E1C', color: '#FBF8F5' }} whileTap={{ scale: 0.97 }} onClick={() => openBooking()}
              className="mt-8 w-full rounded-full border border-espresso px-9 py-4 text-sm font-semibold tracking-[0.14em] sm:w-auto">
              ОНЛАЙН ЗАПИС
            </motion.button>
          </motion.div>
        </div>

        <motion.div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.4, ease }}>
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-full border border-beige" />
          {/* Покласти фото салону в \ web/public/salon.jpg\ */}
          <PhotoSlot src="/salon.jpg" alt="Інтер’єр салону Manicare" className="aspect-[3/4] rounded-t-full bg-sand">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-beige/70 to-transparent" />
            <p className="absolute inset-x-8 bottom-10 text-center font-serif text-xl italic text-cinnamon">Фото салону<span className="mt-1 block font-sans text-xs not-italic">public/salon.jpg</span></p>
          </PhotoSlot>
        </motion.div>
      </div>
    </section>
  );
}
