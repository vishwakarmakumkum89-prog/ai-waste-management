"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const SLIDES = [
  {
    src: "/img/plastic-wall.jpg",
    caption: "Baled mixed plastics — Istanbul sorting yard",
    hud: [
      { x: 56, y: 40, w: 14, h: 30, label: "HDPE-02", conf: "94.1%" },
      { x: 12, y: 8, w: 13, h: 20, label: "PP-05", conf: "88.7%" },
      { x: 78, y: 62, w: 16, h: 24, label: "LDPE-04", conf: "81.3%" },
    ],
  },
  {
    src: "/img/sorting-1.jpg",
    caption: "Manual sorting line — Butwal, Nepal",
    hud: [
      { x: 28, y: 52, w: 20, h: 22, label: "FILM-04", conf: "91.6%" },
      { x: 52, y: 78, w: 16, h: 14, label: "PP-05", conf: "86.0%" },
      { x: 62, y: 24, w: 20, h: 30, label: "WORKER · SAFE", conf: "—" },
    ],
  },
  {
    src: "/img/plastic-heap.jpg",
    caption: "Post-consumer PET — recovery centre",
    hud: [
      { x: 62, y: 70, w: 15, h: 20, label: "PET-01", conf: "97.4%" },
      { x: 38, y: 36, w: 14, h: 18, label: "PET-01", conf: "95.2%" },
      { x: 10, y: 55, w: 15, h: 22, label: "PET-01", conf: "93.8%" },
    ],
  },
];

export default function Hero() {
  const [i, setI] = useState(0);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 9000);
    return () => clearInterval(t);
  }, []);

  // subtle pointer parallax on the photograph
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const on = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * -14;
      const y = (e.clientY / window.innerHeight - 0.5) * -10;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.04)`;
    };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, []);

  const slide = SLIDES[i];

  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-charcoal text-paper">
      <div ref={wrap} className="absolute inset-0 transition-transform duration-[1200ms] ease-out will-change-transform">
        {SLIDES.map((s, idx) => (
          <div key={s.src} className={`hero-slide ${idx === i ? "active" : ""}`}>
            <div className="absolute inset-0 overflow-hidden">
              <img src={s.src} alt={s.caption} className="hero-mono" fetchPriority={idx === 0 ? "high" : "auto"} />
              <div className="hero-color absolute inset-0">
                <img src={s.src} alt="" style={{ filter: "saturate(1.15) contrast(1.05) brightness(0.78)" }} />
              </div>
              <div className="hero-beam" />
              {s.hud.map((h, k) => (
                <div
                  key={k}
                  className="hud-box"
                  style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%`, "--d": `${1400 + k * 900}ms` } as CSSProperties}
                >
                  <span className="label absolute -top-6 left-0 whitespace-nowrap bg-lime px-2 py-[3px] text-[0.6rem] text-charcoal">
                    {h.label} {h.conf !== "—" && <b className="ml-1 font-semibold">{h.conf}</b>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cinematic grade */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-transparent to-transparent" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(21,26,24,0.65)_100%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1500px] flex-col justify-end px-6 pb-12 pt-32 md:px-10">
        <div className="mb-8 flex items-center gap-3 fade-up" style={{ "--d": "300ms" } as CSSProperties}>
          <span className="pulse-dot h-2 w-2 rounded-full bg-lime" />
          <span className="label text-paper/80">Vision model online · Circular network live</span>
        </div>

        <h1 className="display text-[clamp(3.6rem,13.4vw,14.5rem)] text-paper">
          <span className="line-mask">
            <span style={{ "--d": "250ms" } as CSSProperties}>What if waste</span>
          </span>
          <span className="line-mask">
            <span style={{ "--d": "420ms" } as CSSProperties}>
              was <span className="serif text-lime lowercase text-[1.08em] pr-[0.04em]">never</span> waste?
            </span>
          </span>
        </h1>

        <div className="mt-10 grid items-end gap-10 md:grid-cols-12">
          <p
            className="fade-up md:col-span-5 max-w-[34rem] text-lg leading-relaxed text-paper/85 md:text-xl"
            style={{ "--d": "900ms" } as CSSProperties}
          >
            Transforming discarded materials into valuable resources through intelligent waste identification, innovation and
            circular connections.
          </p>
          <div className="fade-up flex flex-wrap gap-3 md:col-span-4" style={{ "--d": "1100ms" } as CSSProperties}>
            <Link href="#platform" className="btn btn-lime">
              Explore the platform <span className="arrow">↓</span>
            </Link>
            <Link href="/scan" className="btn btn-ghost">
              Scan your waste <span className="arrow">→</span>
            </Link>
          </div>
          <div className="fade-up md:col-span-3 md:text-right" style={{ "--d": "1300ms" } as CSSProperties}>
            <p className="label text-lime">0{i + 1} / 0{SLIDES.length}</p>
            <p className="label mt-2 text-paper/60 normal-case tracking-wider">{slide.caption}</p>
            <div className="mt-4 flex gap-2 md:justify-end">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.src}
                  onClick={() => setI(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className="relative h-[3px] w-14 overflow-hidden bg-paper/25"
                >
                  <span
                    key={idx === i ? `on-${i}` : "off"}
                    className="absolute inset-0 origin-left bg-lime"
                    style={{
                      transform: idx === i ? undefined : idx < i ? "scaleX(1)" : "scaleX(0)",
                      animation: idx === i ? "bar-grow 9s linear both" : undefined,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 md:block md:right-10">
        <span className="label block origin-center rotate-90 whitespace-nowrap text-paper/50">Scroll to explore</span>
      </div>
    </section>
  );
}
