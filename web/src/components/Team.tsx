import { useEffect, useState } from "react";
import { openBooking } from "../lib/booking";
import PhotoSlot from "./PhotoSlot";
import SnapSlider from "./SnapSlider";

const API_URL = import.meta.env.PUBLIC_API_URL || "";
const tones = ["#B3927A", "#735243", "#E2CFBB", "#8A6A58"];

const shortTitle: Record<string, string> = {
  manicure: "Манікюр",
  pedicure: "Педикюр",
  "nail-extensions": "Нарощування нігтів",
  "lash-extensions": "Вії",
  brows: "Брови",
};

interface Master {
  id: string;
  name: string;
  role: string;
  about: string;
  photo_url: string;
  service_ids: string[];
}

function MasterCard({ m, i }: { m: Master; i: number }) {
  return (
    <article className="flex h-full flex-col bg-cream">
      <PhotoSlot
        src={m.photo_url}
        alt={m.name}
        className="flex aspect-[4/5] items-end p-5"
        style={{ backgroundColor: tones[i % tones.length] }}
      >
        <span
          className={`font-serif text-6xl ${i % 4 === 2 ? "text-espresso" : "text-cream"}`}
        >
          {m.name
            .split(" ")
            .map((p) => p[0])
            .join("")}
        </span>
      </PhotoSlot>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-2xl">{m.name}</h3>
        <p className="mt-1 text-sm text-cinnamon">{m.role}</p>
        <p className="mt-4 text-sm leading-relaxed">{m.about}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {m.service_ids.map((id) => (
            <li
              key={id}
              className="rounded-full border border-sand px-3 py-1 text-xs text-cinnamon"
            >
              {shortTitle[id] || id}
            </li>
          ))}
        </ul>
        <button
          onClick={() =>
            openBooking({ masterId: m.id, serviceId: m.service_ids[0] as any })
          }
          className="mt-6 w-full rounded-full border border-espresso py-3 text-sm transition-colors hover:bg-espresso hover:text-cream"
        >
          Записатися до майстра
        </button>
      </div>
    </article>
  );
}

function MasterSkeleton() {
  return (
    <article className="flex h-full animate-pulse flex-col bg-cream">
      <div className="aspect-[4/5] bg-sand" />
      <div className="flex flex-1 flex-col p-6">
        <div className="h-7 w-2/3 rounded bg-sand" />
        <div className="mt-2 h-4 w-1/2 rounded bg-sand/70" />
        <div className="mt-5 space-y-2">
          <div className="h-3 w-full rounded bg-sand/70" />
          <div className="h-3 w-full rounded bg-sand/70" />
          <div className="h-3 w-3/4 rounded bg-sand/70" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-sand/70" />
          <div className="h-6 w-24 rounded-full bg-sand/70" />
        </div>
        <div className="mt-6 h-11 w-full rounded-full bg-sand/70" />
      </div>
    </article>
  );
}

export default function Team() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/masters`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setMasters(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="team" className="bg-sand/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <h2 className="max-w-xl font-serif text-4xl leading-tight sm:text-6xl">
          Майстри, яким довіряють руки й погляд
        </h2>

        {loading ? (
          <>
            <div className="mt-10 md:hidden">
              <MasterSkeleton />
            </div>
            <div className="mt-14 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <MasterSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            <SnapSlider
              items={masters}
              getId={(m) => m.id}
              getLabel={(m) => m.name.split(" ")[0]}
              layoutKey="team-tab"
              render={(m, i) => <MasterCard m={m} i={i} />}
            />
            <div className="mt-14 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
              {masters.map((m, i) => (
                <div key={m.id} className="overflow-hidden">
                  <MasterCard m={m} i={i} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}