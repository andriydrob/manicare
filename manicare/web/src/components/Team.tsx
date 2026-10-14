import { motion } from 'framer-motion';
import { masters, services } from '../data/content';
import { openBooking } from '../lib/booking';
import PhotoSlot from './PhotoSlot';

const tones = ['#B3927A', '#735243', '#E2CFBB', '#8A6A58'];

export default function Team() {
  return (
    <section id="team" className="bg-sand/50 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="max-w-xl font-serif text-5xl leading-tight sm:text-6xl">Майстри, яким довіряють руки й погляд</h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {masters.map((m, i) => (
            <motion.article key={m.id} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex flex-col bg-cream">
              {/* Фото майстра: web/public/team/<id>.jpg (olena, maria, katerina, sofia, daryna) */}
              <PhotoSlot src={`/team/${m.id}.jpg`} alt={m.name} className="flex aspect-[4/5] items-end p-5" style={{ backgroundColor: tones[i % tones.length] }}>
                <span className={`font-serif text-6xl ${i === 4 ? 'text-espresso' : 'text-cream'}`}>
                  {m.name.split(' ').map((p) => p[0]).join('')}
                </span>
              </PhotoSlot>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-2xl">{m.name}</h3>
                <p className="mt-1 text-sm text-cinnamon">{m.role}</p>
                <p className="mt-4 text-sm leading-relaxed">{m.about}</p>
                <p className="mt-4 text-xs text-cinnamon">
                  {m.serviceIds.map((id) => services.find((s) => s.id === id)?.title).join(', ')}
                </p>
                <button onClick={() => openBooking({ masterId: m.id, serviceId: m.serviceIds[0] })}
                  className="mt-auto w-full rounded-full border border-espresso py-2.5 text-sm transition-colors hover:bg-espresso hover:text-cream">
                  Записатися до майстра
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
