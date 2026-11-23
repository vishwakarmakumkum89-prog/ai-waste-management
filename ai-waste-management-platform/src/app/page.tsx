import Link from "next/link";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import MaterialExplorer from "@/components/MaterialExplorer";
import CircularLoop, { LOOP_STEPS } from "@/components/CircularLoop";
import { Counter, Reveal, ScrollWords } from "@/components/Motion";
import { getImpact, getOrganizations, getProducts } from "@/lib/data";
import { CATEGORY_MAP, type CategorySlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

const PROCESS = [
  {
    n: "01",
    title: "Identify",
    text: "Point a camera at any discarded item. Our vision model reads colour, texture and reflectance to classify the material and tells you how confident it is.",
    img: "/img/sorting-2.jpg",
    tag: "Computer vision",
  },
  {
    n: "02",
    title: "Transform",
    text: "Every material class maps to a library of proven upcycling pathways — from five-minute home projects to industrial-grade recovery.",
    img: "/img/shoes.jpg",
    tag: "Upcycling intelligence",
  },
  {
    n: "03",
    title: "Connect",
    text: "Matched with NGOs, cooperatives and certified recyclers near you that actually want that material. Request a pickup in one step.",
    img: "/img/volunteers.jpg",
    tag: "Circular network",
  },
];

export default async function Home() {
  const [products, orgs, impact] = await Promise.all([getProducts(), getOrganizations(), getImpact()]);
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;
  const rail = [...products].sort((a, b) => a.id - b.id).filter((_, i) => i % 2 === 0).slice(0, 9);
  const featuredOrgs = orgs.filter((o) => ["kijani-loop", "estrada-circular", "rotterdam-materials-lab"].includes(o.slug));

  return (
    <>
      <Hero />
      <Marquee />

      {/* MANIFESTO */}
      <section id="platform" className="relative bg-paper px-6 py-28 md:px-10 md:py-44">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 md:grid-cols-12">
            <p className="label text-forest md:col-span-2 md:pt-4">( 01 ) — Manifesto</p>
            <ScrollWords
              className="display-wide text-[clamp(2rem,4.6vw,4.6rem)] md:col-span-10"
              accent={["opportunity", "resource", "resources"]}
              text="Waste is not the end of a product's life. It is a design flaw — and an opportunity. Every bottle, every circuit board, every scrap of cloth is a resource that has simply been misplaced. We built the intelligence to find it again."
            />
          </div>

          <div className="mt-24 grid gap-px overflow-hidden bg-charcoal/15 md:grid-cols-4">
            {[
              { v: 2.0, d: 1, s: "bn t", l: "Municipal waste generated every year worldwide" },
              { v: 9, d: 0, s: "%", l: "Of all plastic ever made has been recycled" },
              { v: 33, d: 0, s: "%", l: "Of global waste is not managed in an environmentally safe way" },
              { v: 9, d: 0, s: " classes", l: "Materials identified by the RE/SOURCE vision model" },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 120} className="bg-paper p-8 md:p-10">
                <p className="display text-[clamp(3.5rem,6vw,6rem)] text-forest">
                  <Counter to={s.v} decimals={s.d} suffix={s.s} />
                </p>
                <p className="mt-4 max-w-[16rem] text-sm leading-snug text-charcoal/70">{s.l}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative bg-forest px-6 py-28 text-paper md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <Reveal>
              <p className="label text-lime mb-6">( 02 ) — How it works</p>
              <h2 className="display text-[clamp(3.5rem,11vw,11rem)]">
                From <span className="serif text-lime lowercase">discard</span>
                <br />
                to design.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="max-w-sm text-lg text-paper/75">Three connected systems turn a moment of disposal into a chain of value.</p>
            </Reveal>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 150} className={i === 1 ? "md:mt-20" : i === 2 ? "md:mt-40" : ""}>
                <article className="group photo-card">
                  <Reveal variant="img" className="relative aspect-[3/4] overflow-hidden">
                    <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-transparent to-transparent opacity-90" />
                    <span className="label absolute left-4 top-4 bg-paper px-2 py-1 text-charcoal">{p.tag}</span>
                    <span className="display absolute bottom-3 right-4 text-[7rem] text-lime/90 leading-none">{p.n}</span>
                  </Reveal>
                  <h3 className="display mt-6 text-5xl">{p.title}</h3>
                  <p className="mt-3 max-w-md text-paper/75 leading-relaxed">{p.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MATERIAL EXPLORER */}
      <section className="bg-charcoal px-6 py-28 text-paper md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-16 grid gap-8 md:grid-cols-12">
            <p className="label text-lime md:col-span-3">( 03 ) — Material intelligence</p>
            <h2 className="display text-[clamp(3rem,8vw,8rem)] md:col-span-9">
              Nine materials.
              <br />
              <span className="serif text-sage lowercase">Endless</span> second lives.
            </h2>
          </Reveal>
          <MaterialExplorer counts={counts} />
        </div>
      </section>

      {/* UPCYCLE RAIL */}
      <section className="overflow-hidden bg-paper py-28 md:py-40">
        <div className="mx-auto mb-14 flex max-w-[1500px] flex-col justify-between gap-6 px-6 md:flex-row md:items-end md:px-10">
          <Reveal>
            <p className="label text-forest mb-6">( 04 ) — Waste → worth</p>
            <h2 className="display text-[clamp(3rem,9vw,9rem)] text-charcoal">
              What waste <span className="serif text-forest lowercase">becomes</span>
            </h2>
          </Reveal>
          <Link href="/ideas" className="btn btn-outline-dark self-start md:self-end">
            Browse {products.length} pathways <span className="arrow">→</span>
          </Link>
        </div>
        <div className="hscroll flex snap-x gap-5 overflow-x-auto px-6 pb-4 md:px-10">
          {rail.map((p) => (
            <Link
              href={`/ideas?open=${p.slug}`}
              key={p.id}
              className="photo-card group relative w-[78vw] shrink-0 snap-start sm:w-[420px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-forest">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-transparent to-transparent" />
                <span className="label absolute left-4 top-4 bg-lime px-2 py-1 text-charcoal">{p.difficulty}</span>
                <div className="absolute inset-x-5 bottom-5 text-paper">
                  <p className="label text-sage">From {CATEGORY_MAP[p.category as CategorySlug].name}</p>
                  <h3 className="display-wide mt-2 text-3xl leading-[0.95]">{p.name}</h3>
                  <div className="label mt-4 flex gap-5 text-paper/70">
                    <span>~${p.valueUsd}/unit</span>
                    <span>{p.hours}h</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <div className="w-6 shrink-0" />
        </div>
      </section>

      {/* SCAN TEASER */}
      <section className="relative overflow-hidden bg-forest-deep px-6 py-28 text-paper md:px-10 md:py-40">
        <div className="mx-auto grid max-w-[1500px] items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="label text-lime mb-6">( 05 ) — The scanner</p>
              <h2 className="display text-[clamp(3.2rem,8.5vw,8.5rem)]">
                Show it.
                <br />
                We&apos;ll tell you
                <br />
                <span className="serif text-lime lowercase">what it&apos;s worth.</span>
              </h2>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-paper/75">
                Upload a photo, describe the item, and receive a ranked identification, upcycling blueprints and the nearest organisations
                ready to take it. Disagree with the model? Correct it — every correction trains the next version.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/scan" className="btn btn-lime">
                  Launch scanner <span className="arrow">→</span>
                </Link>
                <Link href="/research" className="btn btn-ghost">
                  How the model works
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="lg:col-span-6">
            <div className="relative mx-auto aspect-[4/5] max-w-[560px] overflow-hidden bg-charcoal">
              <img src="/img/glass2.jpg" alt="Glass bottles in a crate being scanned" className="h-full w-full object-cover opacity-90" loading="lazy" />
              <div className="absolute inset-0 bg-charcoal/20" />
              <div className="scan-line" />
              <div className="hud-box" style={{ left: "10%", top: "22%", width: "80%", height: "62%", "--d": "300ms" } as React.CSSProperties} />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="pulse-dot h-2 w-2 rounded-full bg-lime" />
                <span className="label text-lime">Analysing</span>
              </div>
              <div className="absolute inset-x-4 bottom-4 bg-charcoal/90 p-5 backdrop-blur">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="label text-ash">Top match</p>
                    <p className="display mt-1 text-4xl text-paper">Glass</p>
                  </div>
                  <p className="display text-5xl text-lime">96%</p>
                </div>
                <div className="mt-4 h-[3px] bg-paper/15">
                  <div className="bar-grow h-full w-[96%] bg-lime" />
                </div>
                <p className="label mt-3 text-sage">→ 2 pathways · 4 organisations nearby</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CIRCULAR LOOP */}
      <section className="bg-charcoal px-6 py-28 text-paper md:px-10 md:py-40">
        <div className="mx-auto grid max-w-[1500px] items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="label text-lime mb-6">( 06 ) — Circular economy</p>
              <h2 className="display text-[clamp(3rem,7.5vw,7.5rem)]">
                No end.
                <br />
                <span className="serif text-sage lowercase">Only</span> turns.
              </h2>
            </Reveal>
            <ol className="mt-12 divide-y divide-paper/10 border-y border-paper/10">
              {LOOP_STEPS.map((s, i) => (
                <Reveal as="li" key={s.t} delay={i * 70} className="flex items-baseline gap-5 py-4">
                  <span className="label w-8 text-lime">0{i + 1}</span>
                  <span className="display-wide w-28 text-xl">{s.t}</span>
                  <span className="text-sm text-paper/60">{s.d}</span>
                </Reveal>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-7">
            <CircularLoop />
          </div>
        </div>
      </section>

      {/* NETWORK */}
      <section className="bg-paper px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid items-end gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-8">
              <p className="label text-forest mb-6">( 07 ) — The network</p>
              <h2 className="display text-[clamp(3rem,9vw,9rem)]">
                Real people.
                <br />
                <span className="serif text-forest lowercase">Real</span> pickups.
              </h2>
            </Reveal>
            <Reveal delay={150} className="md:col-span-4">
              <p className="text-lg leading-relaxed text-charcoal/70">
                {impact.network.orgs} NGOs, cooperatives and recyclers across {impact.network.countries} countries — each with the materials they
                accept, the services they provide and a direct line to you.
              </p>
              <Link href="/network" className="btn btn-dark mt-6">
                Explore the network <span className="arrow">→</span>
              </Link>
            </Reveal>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {featuredOrgs.map((o, i) => (
              <Reveal key={o.id} delay={i * 120}>
                <Link href={`/network?org=${o.slug}`} className="photo-card group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-forest">
                    <img src={o.image} alt={o.name} loading="lazy" className="h-full w-full object-cover" />
                    <span className="label absolute left-4 top-4 bg-paper px-2 py-1">{o.type}</span>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-charcoal/15 pb-5">
                    <div>
                      <h3 className="display-wide text-2xl">{o.name}</h3>
                      <p className="label mt-2 text-ash">
                        {o.city}, {o.country}
                      </p>
                    </div>
                    <p className="label text-right text-forest">
                      {o.tonnesPerYear.toLocaleString()}
                      <br />t / year
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="bg-sage px-6 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <p className="label text-forest mb-10">( 08 ) — Measured impact</p>
          </Reveal>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { v: impact.network.tonnes, s: " t", l: "Material handled each year by network partners" },
              { v: Math.max(impact.scans, 0), s: "", l: "Items identified on the platform so far" },
              { v: impact.co2, s: " kg", l: "CO₂e avoided through scanned and routed material", d: 1 },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 120}>
                <p className="display text-[clamp(4rem,9vw,9.5rem)] text-forest">
                  <Counter to={s.v} suffix={s.s} decimals={s.d ?? 0} />
                </p>
                <p className="mt-3 max-w-xs border-t border-forest/30 pt-4 text-forest/80">{s.l}</p>
              </Reveal>
            ))}
          </div>
          <Link href="/impact" className="btn btn-dark mt-16">
            Live impact dashboard <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative isolate overflow-hidden px-6 py-40 text-paper md:px-10 md:py-64">
        <img src="/img/forest.jpg" alt="Forest canopy" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-forest-deep/70" />
        <Reveal className="mx-auto max-w-[1200px] text-center">
          <p className="serif text-[clamp(2.4rem,6.5vw,6.5rem)] leading-[1.02] text-balance">
            “In nature, there is no such thing as waste. We are simply learning to <span className="text-lime">remember</span> that.”
          </p>
          <p className="label mt-10 text-sage">— RE/SOURCE research principle</p>
        </Reveal>
      </section>
    </>
  );
}
