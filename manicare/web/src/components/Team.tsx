import { masters, shortTitle, type Master } from '../data/content';
import { openBooking } from '../lib/booking';
import PhotoSlot from './PhotoSlot';
import SnapSlider from './SnapSlider';

const tones = ['#B3927A', '#735243', '#E2CFBB', '#8A6A58'];

function MasterCard({ m, i }: { m: Master; i: number }) {
  return (
    <article className="flex h-full flex-col bg-cream">
      {/* Фото майстра: web/public/team/<id>.jpg */}
      <PhotoSlot src={`/team/${m.id}.jpg`} alt={m.name} className="flex aspect-[4/5] items-end p-5" style={{ backgroundColor: tones[i % tones.length] }}>
        <span className={`font-serif text-6xl ${i % 4 === 2 ? 'text-espresso' : 'text-cream'}`}>{m.name.split(' ').map((p) => p[0]).join('')}</span>
      </PhotoSlot>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-2xl">{m.name}</h3>
        <p className="mt-1 text-sm text-cinnamon">{m.role}</p>
        <p className="mt-4 text-sm leading-relaxed">{m.about}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {m.serviceIds.map((id) => <li key={id} className="rounded-full border border-sand px-3 py-1 text-xs text-cinnamon">{shortTitle[id]}</li>)}
        </ul>
        <button onClick={() => openBooking({ masterId: m.id, serviceId: m.serviceIds[0] })}
          className="mt-6 w-full rounded-full border border-espresso py-3 text-sm transition-colors hover:bg-espresso hover:text-cream">Записатися до майстра</button>
      </div>
    </article>
  );
}

export default function Team() {
  return (
    <section id="team" className="bg-sand/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <h2 className="max-w-xl font-serif text-4xl leading-tight sm:text-6xl">Майстри, яким довіряють руки й погляд</h2>
        <SnapSlider items={masters} getId={(m) => m.id} getLabel={(m) => m.name.split(' ')[0]} layoutKey="team-tab" render={(m, i) => <MasterCard m={m} i={i} />} />
        <div className="mt-14 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {masters.map((m, i) => <div key={m.id} className="overflow-hidden"><MasterCard m={m} i={i} /></div>)}
        </div>
      </div>
    </section>
  );
}
