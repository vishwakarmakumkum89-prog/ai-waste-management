"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_MAP, type CategorySlug } from "@/lib/categories";
import type { Organization } from "@/db/schema";
import ConnectModal, { type ConnectTarget } from "./ConnectModal";

const TYPES = ["All", "NGO", "Recycler", "Social Enterprise", "Municipal"];

export default function NetworkClient({
  orgs,
  initialCategory,
  initialOrg,
}: {
  orgs: Organization[];
  initialCategory: string;
  initialOrg: string;
}) {
  const [cat, setCat] = useState(initialCategory || "all");
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");
  const [focus] = useState(initialOrg);
  const [connect, setConnect] = useState<ConnectTarget | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orgs
      .filter(
        (o) =>
          (cat === "all" || o.accepts.includes(cat)) &&
          (type === "All" || o.type === type) &&
          (!s || `${o.name} ${o.city} ${o.country} ${o.services.join(" ")}`.toLowerCase().includes(s)),
      )
      .sort((a, b) => (a.slug === focus ? -1 : b.slug === focus ? 1 : 0));
  }, [orgs, cat, type, q, focus]);

  const chip = (active: boolean) =>
    `label whitespace-nowrap border px-4 py-2.5 transition-colors ${
      active ? "border-forest bg-forest text-paper" : "border-charcoal/20 text-charcoal/70 hover:border-forest"
    }`;

  const tonnes = orgs.reduce((a, o) => a + o.tonnesPerYear, 0);
  const countries = new Set(orgs.map((o) => o.country)).size;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest px-6 pb-20 pt-40 text-paper md:px-10 md:pb-28 md:pt-48">
        <img src="/img/volunteers.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest/40 via-forest/70 to-forest" />
        <div className="mx-auto max-w-[1500px]">
          <p className="label text-lime mb-6">Circular network · {orgs.length} organisations</p>
          <h1 className="display text-[clamp(4rem,13vw,13rem)]">
            <span className="line-mask">
              <span>The people</span>
            </span>
            <span className="line-mask">
              <span style={{ animationDelay: "150ms" }}>
                <span className="serif lowercase text-lime">behind</span> the loop
              </span>
            </span>
          </h1>
          <div className="mt-14 grid max-w-3xl grid-cols-3 gap-6">
            {[
              { v: orgs.length, l: "Partners" },
              { v: countries, l: "Countries" },
              { v: `${(tonnes / 1000).toFixed(1)}k`, l: "Tonnes / year" },
            ].map((s) => (
              <div key={s.l}>
                <p className="display text-5xl text-lime md:text-7xl">{s.v}</p>
                <p className="label mt-2 text-sage">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-6">
            <div className="hscroll flex gap-2 overflow-x-auto">
              <button onClick={() => setCat("all")} className={chip(cat === "all")}>
                Any material
              </button>
              {CATEGORIES.map((c) => (
                <button key={c.slug} onClick={() => setCat(c.slug)} className={chip(cat === c.slug)}>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`label px-3 py-2 ${type === t ? "text-forest underline underline-offset-8" : "text-charcoal/50 hover:text-charcoal"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search city, country, service…"
                className="w-full border-b border-charcoal/30 bg-transparent py-2 text-base outline-none placeholder:text-charcoal/35 focus:border-forest sm:w-72"
              />
            </div>
          </div>

          <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
            {list.map((o) => (
              <li key={o.id} className={`group ${o.slug === focus ? "md:col-span-2" : ""}`}>
                <div className={`grid gap-6 ${o.slug === focus ? "md:grid-cols-2" : ""}`}>
                  <div className="photo-card relative aspect-[16/10] overflow-hidden bg-forest">
                    <img src={o.image} alt={o.name} loading="lazy" className="h-full w-full object-cover" />
                    <span className="label absolute left-4 top-4 bg-paper px-2 py-1">{o.type}</span>
                    {o.verified && <span className="label absolute right-4 top-4 bg-lime px-2 py-1 text-charcoal">✓ Verified</span>}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="display-wide text-3xl leading-none">{o.name}</h3>
                        <p className="label mt-2 text-ash">
                          {o.city}, {o.country}
                        </p>
                      </div>
                      <p className="display text-right text-3xl text-forest">
                        {o.tonnesPerYear.toLocaleString()}
                        <span className="label block text-ash">t / year</span>
                      </p>
                    </div>
                    <p className="mt-4 text-charcoal/70">{o.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {o.accepts.map((a) => (
                        <span
                          key={a}
                          className={`label px-2 py-1 ${a === cat ? "bg-lime text-charcoal" : "border border-charcoal/20 text-charcoal/70"}`}
                        >
                          {CATEGORY_MAP[a as CategorySlug]?.name}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-charcoal/55">{o.services.join(" · ")}</p>
                    <div className="mt-6">
                      <button
                        onClick={() =>
                          setConnect({
                            organizationId: o.id,
                            organizationName: o.name,
                            category: cat !== "all" ? cat : o.accepts[0],
                          })
                        }
                        className="btn btn-dark"
                      >
                        Request pickup <span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {list.length === 0 && (
            <p className="py-24 text-center text-xl text-charcoal/50">
              No organisation matches yet. Be the first —{" "}
              <button className="u-link text-forest" onClick={() => setConnect({ kind: "partner", category: cat !== "all" ? cat : null })}>
                become a partner
              </button>
              .
            </p>
          )}
        </div>
      </section>

      <section id="partner" className="relative isolate overflow-hidden bg-charcoal px-6 py-28 text-paper md:px-10 md:py-40">
        <img src="/img/sorting-4.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" />
        <div className="mx-auto grid max-w-[1500px] items-end gap-10 md:grid-cols-12">
          <h2 className="display text-[clamp(3.2rem,9vw,9rem)] md:col-span-8">
            Run a recycling <span className="serif lowercase text-lime">organisation?</span>
          </h2>
          <div className="md:col-span-4">
            <p className="text-lg text-paper/70">
              List what you accept and receive verified, pre-identified material from households and businesses in your area.
            </p>
            <button onClick={() => setConnect({ kind: "partner" })} className="btn btn-lime mt-6">
              Join the network <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      <ConnectModal target={connect} onClose={() => setConnect(null)} />
    </>
  );
}
