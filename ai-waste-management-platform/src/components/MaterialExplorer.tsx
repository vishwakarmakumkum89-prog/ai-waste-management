"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function MaterialExplorer({ counts }: { counts: Record<string, number> }) {
  const [active, setActive] = useState(0);
  const cat = CATEGORIES[active];

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <ul className="lg:col-span-7" onMouseLeave={() => undefined}>
        {CATEGORIES.map((c, i) => (
          <li key={c.slug} className="border-t border-paper/15 last:border-b">
            <button
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`group flex w-full items-baseline gap-5 py-4 text-left transition-all duration-500 md:py-5 ${
                i === active ? "pl-4 text-lime" : "text-paper/55 hover:text-paper"
              }`}
            >
              <span className="label w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span className="display text-[clamp(2rem,4.4vw,4.2rem)] flex-1">{c.name}</span>
              <span className="label hidden sm:block">{counts[c.slug] ?? 0} products</span>
              <span className={`transition-transform duration-500 ${i === active ? "translate-x-0" : "-translate-x-2 opacity-0"}`}>→</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div className="relative aspect-[4/5] overflow-hidden bg-forest">
            {CATEGORIES.map((c, i) => (
              <img
                key={c.slug}
                src={c.image}
                alt={c.name}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ${
                  i === active ? "scale-100 opacity-100" : "scale-110 opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-charcoal/30" />
            <div className="absolute left-5 top-5 flex gap-2">
              <span className="label bg-lime px-2 py-1 text-charcoal">{cat.code}</span>
            </div>
            <div className="absolute inset-x-5 bottom-5">
              <p className="text-paper/90 text-base leading-snug">{cat.blurb}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-4 text-paper">
            <div>
              <dt className="label text-ash">Recoverable</dt>
              <dd className="display mt-1 text-4xl text-lime">{cat.recoverability}%</dd>
            </div>
            <div>
              <dt className="label text-ash">CO₂ saved/kg</dt>
              <dd className="display mt-1 text-4xl">{cat.co2PerKg}</dd>
            </div>
            <div>
              <dt className="label text-ash">Persists</dt>
              <dd className="mt-2 text-sm leading-tight">{cat.persistence}</dd>
            </div>
          </dl>
          <Link href={`/ideas?category=${cat.slug}`} className="btn btn-ghost mt-6">
            See what it becomes <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
