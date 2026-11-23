"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_MAP, type CategorySlug } from "@/lib/categories";
import type { Product } from "@/db/schema";

const LEVELS = ["All", "Easy", "Workshop", "Industrial"] as const;

export default function IdeasClient({
  products,
  initialCategory,
  initialOpen,
}: {
  products: Product[];
  initialCategory: string;
  initialOpen: string;
}) {
  const [cat, setCat] = useState<string>(initialCategory || "all");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Product | null>(products.find((p) => p.slug === initialOpen) ?? null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (level === "All" || p.difficulty === level) &&
        (!s || p.name.toLowerCase().includes(s) || p.summary.toLowerCase().includes(s)),
    );
  }, [products, cat, level, q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const chip = (active: boolean) =>
    `label whitespace-nowrap border px-4 py-2.5 transition-colors ${
      active ? "border-lime bg-lime text-charcoal" : "border-paper/25 text-paper/75 hover:border-lime hover:text-lime"
    }`;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-charcoal px-6 pb-16 pt-40 text-paper md:px-10 md:pt-48">
        <img src="/img/caps.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/60 to-charcoal" />
        <div className="mx-auto max-w-[1500px]">
          <p className="label text-lime mb-6">Upcycling library · {products.length} pathways</p>
          <h1 className="display text-[clamp(4rem,13vw,13rem)]">
            <span className="line-mask">
              <span>Waste</span>
            </span>
            <span className="line-mask">
              <span style={{ animationDelay: "150ms" }}>
                <span className="serif lowercase text-lime">becomes</span> —
              </span>
            </span>
          </h1>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[58px] z-30 border-y border-paper/10 bg-charcoal/90 px-6 py-4 text-paper backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="hscroll flex gap-2 overflow-x-auto">
            <button onClick={() => setCat("all")} className={chip(cat === "all")}>
              All materials
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.slug} onClick={() => setCat(c.slug)} className={chip(cat === c.slug)}>
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`label px-3 py-2 ${level === l ? "text-lime underline underline-offset-8" : "text-paper/55 hover:text-paper"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-40 border-b border-paper/30 bg-transparent py-2 text-sm outline-none placeholder:text-paper/35 focus:border-lime"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-paper px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <p className="label mb-10 text-ash">{list.length} results</p>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setOpen(p)}
                className={`photo-card group text-left ${i % 3 === 1 ? "lg:mt-16" : i % 3 === 2 ? "lg:mt-8" : ""}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-forest">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  <span className="label absolute left-4 top-4 bg-paper px-2 py-1">{p.difficulty}</span>
                  <span className="label absolute bottom-4 right-4 bg-lime px-2 py-1 text-charcoal opacity-0 transition-opacity group-hover:opacity-100">
                    View blueprint →
                  </span>
                </div>
                <p className="label mt-5 text-forest">{CATEGORY_MAP[p.category as CategorySlug]?.name}</p>
                <h3 className="display-wide mt-2 text-[1.7rem] leading-[1]">{p.name}</h3>
                <p className="mt-3 line-clamp-2 text-charcoal/65">{p.summary}</p>
                <p className="label mt-4 flex gap-5 text-ash">
                  <span>~${p.valueUsd}/unit</span>
                  <span>{p.hours}h</span>
                </p>
              </button>
            ))}
          </div>
          {list.length === 0 && (
            <p className="py-24 text-center text-xl text-charcoal/50">
              Nothing matches. <button className="u-link text-forest" onClick={() => { setCat("all"); setLevel("All"); setQ(""); }}>Reset filters</button>
            </p>
          )}
        </div>
      </section>

      {/* Detail modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-charcoal/70 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="modal-in relative h-full w-full max-w-3xl overflow-y-auto bg-paper"
            role="dialog"
            aria-modal="true"
          >
            <button onClick={() => setOpen(null)} className="label absolute right-5 top-5 z-10 bg-paper px-3 py-2">
              Close ✕
            </button>
            <div className="relative aspect-[16/10] overflow-hidden bg-forest">
              <img src={open.image} alt={open.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
              <div className="absolute inset-x-8 bottom-6 text-paper">
                <p className="label text-lime">
                  {CATEGORY_MAP[open.category as CategorySlug]?.name} · {open.difficulty}
                </p>
                <h2 className="display mt-2 text-[clamp(2.4rem,6vw,4.4rem)]">{open.name}</h2>
              </div>
            </div>
            <div className="p-8 md:p-10">
              <p className="text-lg leading-relaxed text-charcoal/80">{open.summary}</p>
              <div className="mt-8 grid grid-cols-3 gap-px bg-charcoal/15">
                {[
                  { l: "Time", v: `${open.hours}h` },
                  { l: "Value / unit", v: `$${open.valueUsd}` },
                  { l: "Waste / unit", v: `${open.kgPerUnit} kg` },
                ].map((s) => (
                  <div key={s.l} className="bg-paper p-4">
                    <p className="label text-ash">{s.l}</p>
                    <p className="display mt-1 text-3xl text-forest">{s.v}</p>
                  </div>
                ))}
              </div>
              <p className="label mt-10 text-forest">Blueprint</p>
              <ol className="mt-4 space-y-4">
                {open.steps.map((s, i) => (
                  <li key={i} className="flex gap-5 border-b border-charcoal/10 pb-4">
                    <span className="display text-3xl text-lime [-webkit-text-stroke:1px_#173D32]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="pt-1">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="label mt-8 text-forest">You will need</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {open.tools.map((t) => (
                  <span key={t} className="border border-charcoal/20 px-3 py-1.5 text-sm">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={`/network?category=${open.category}`} className="btn btn-dark">
                  Find partners for this material <span className="arrow">→</span>
                </Link>
                <Link href="/scan" className="btn btn-outline-dark">
                  Scan an item
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
