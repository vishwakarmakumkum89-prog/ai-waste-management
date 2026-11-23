import type { Metadata } from "next";
import Link from "next/link";
import { Counter, Reveal } from "@/components/Motion";
import { getImpact } from "@/lib/data";
import { CATEGORY_MAP, type CategorySlug } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Impact — RE/SOURCE" };

function ago(d: Date) {
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export default async function ImpactPage() {
  const i = await getImpact();
  const rows = [...i.byCategory].sort((a, b) => b.kg - a.kg);
  const maxKg = Math.max(1, ...rows.map((r) => r.kg));
  const agreement = i.feedback.reviewed ? Math.round((i.feedback.agreed / i.feedback.reviewed) * 100) : null;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest-deep px-6 pb-20 pt-40 text-paper md:px-10 md:pb-28 md:pt-48">
        <img src="/img/forest2.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-deep/50 to-forest-deep" />
        <div className="mx-auto max-w-[1500px]">
          <p className="label text-lime mb-6 flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-lime" /> Live dashboard
          </p>
          <h1 className="display text-[clamp(4rem,13vw,13rem)]">
            <span className="line-mask">
              <span>Impact,</span>
            </span>
            <span className="line-mask">
              <span style={{ animationDelay: "150ms" }}>
                <span className="serif lowercase text-lime">measured</span>
              </span>
            </span>
          </h1>
        </div>
      </section>

      <section className="bg-paper px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-px bg-charcoal/15 md:grid-cols-4">
            {[
              { l: "Items identified", v: i.scans, s: "", d: 0 },
              { l: "Material scanned", v: i.kg, s: " kg", d: 1 },
              { l: "CO₂e avoided", v: i.co2, s: " kg", d: 1 },
              { l: "Pickup requests", v: i.requests, s: "", d: 0 },
            ].map((s, k) => (
              <Reveal key={s.l} delay={k * 100} className="bg-paper p-8">
                <p className="label text-ash">{s.l}</p>
                <p className="display mt-4 text-[clamp(3rem,5.5vw,5.5rem)] text-forest">
                  <Counter to={s.v} suffix={s.s} decimals={s.d} />
                </p>
              </Reveal>
            ))}
          </div>

          <div className="mt-24 grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="display text-5xl md:text-7xl">By material</h2>
              {rows.length === 0 ? (
                <p className="mt-8 text-charcoal/60">
                  No scans yet. <Link href="/scan" className="u-link text-forest">Run the first scan →</Link>
                </p>
              ) : (
                <ul className="mt-10 space-y-5">
                  {rows.map((r) => {
                    const c = CATEGORY_MAP[r.category as CategorySlug];
                    return (
                      <li key={r.category}>
                        <div className="flex items-baseline justify-between">
                          <span className="display-wide text-xl">{c?.name ?? r.category}</span>
                          <span className="label text-ash">
                            {r.n} scans · {r.kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
                          </span>
                        </div>
                        <div className="mt-2 h-3 bg-charcoal/10">
                          <div className="bar-grow h-full bg-forest" style={{ width: `${(r.kg / maxKg) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="lg:col-span-5">
              <h2 className="display text-5xl md:text-7xl">Live feed</h2>
              <ul className="mt-10 divide-y divide-charcoal/15 border-y border-charcoal/15">
                {i.recent.length === 0 && <li className="py-6 text-charcoal/60">Waiting for the first scan…</li>}
                {i.recent.map((s) => {
                  const slug = (s.correctedCategory ?? s.predictedCategory) as CategorySlug;
                  return (
                    <li key={s.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="display-wide text-lg">{CATEGORY_MAP[slug]?.name}</p>
                        <p className="label text-ash">
                          {s.weightKg} kg · {s.city ?? "Unlocated"} · {s.correctedCategory ? "human-verified" : "model only"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="label text-forest">{Math.round(s.confidence * 100)}%</p>
                        <p className="label text-ash">{ago(s.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sage px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label mb-6 text-forest">Human-in-the-loop</p>
            <h2 className="display text-[clamp(3rem,7vw,7rem)] text-forest">
              The model <span className="serif lowercase">learns</span> from you
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="display text-[clamp(5rem,12vw,11rem)] text-forest">{agreement === null ? "—" : `${agreement}%`}</p>
            <p className="label mt-2 text-forest/80">
              Agreement between model & users · {i.feedback.reviewed} reviewed scans
            </p>
            <p className="mt-6 max-w-lg text-forest/80">
              Every time someone confirms or corrects an identification, the label is stored next to the image descriptors. These pairs form the
              dataset for the next training run.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-charcoal px-6 py-24 text-paper md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-3">
          {[
            { v: i.network.orgs, l: "Network organisations" },
            { v: i.network.countries, l: "Countries" },
            { v: i.network.tonnes, l: "Tonnes handled / year", s: "" },
          ].map((s) => (
            <div key={s.l} className="border-t border-paper/20 pt-6">
              <p className="display text-[clamp(4rem,8vw,8rem)] text-lime">
                <Counter to={s.v} />
              </p>
              <p className="label mt-2 text-sage">{s.l}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-16 max-w-[1500px] text-sm text-paper/50">
          CO₂e figures use indicative life-cycle midpoints (kg CO₂e avoided per kg recovered) and are estimates. Partner tonnage is declared by
          each organisation.
        </p>
      </section>
    </>
  );
}
