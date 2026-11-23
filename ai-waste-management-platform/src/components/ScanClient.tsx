"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_MAP, type CategorySlug } from "@/lib/categories";
import { featuresFromImage, type Features } from "@/lib/features";
import type { Organization, Product } from "@/db/schema";
import ConnectModal, { type ConnectTarget } from "./ConnectModal";

type Pred = { slug: CategorySlug; confidence: number };
type Result = {
  scanId: number;
  predictions: Pred[];
  usedImage: boolean;
  usedText: boolean;
  co2SavedKg: number;
  products: Product[];
  organizations: Organization[];
};

const SAMPLES = [
  { src: "/img/plastic-heap.jpg", label: "Bottles", name: "plastic bottles pet" },
  { src: "/img/glass2.jpg", label: "Glass", name: "glass bottles" },
  { src: "/img/cans2.jpg", label: "Cans", name: "aluminium cans" },
  { src: "/img/cardboard.jpg", label: "Cardboard", name: "cardboard boxes" },
  { src: "/img/ewaste2.jpg", label: "Circuit boards", name: "electronic circuit boards" },
  { src: "/img/compost.jpg", label: "Food scraps", name: "organic food scraps" },
  { src: "/img/textile.jpg", label: "Clothes", name: "clothes textile" },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

export default function ScanClient({ cities }: { cities: string[] }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [features, setFeatures] = useState<Features | null>(null);
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("1");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState<CategorySlug | null>(null);
  const [feedback, setFeedback] = useState<"confirmed" | "corrected" | null>(null);
  const [co2, setCo2] = useState(0);
  const [connect, setConnect] = useState<ConnectTarget | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const reset = () => {
    setResult(null);
    setSelected(null);
    setFeedback(null);
    setError(null);
  };

  const ingest = useCallback(async (src: string, name: string) => {
    reset();
    try {
      const img = await loadImage(src);
      setFeatures(featuresFromImage(img, img.naturalWidth, img.naturalHeight));
      setPreview(src);
      setFileName(name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that image.");
    }
  }, []);

  const onFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    ingest(URL.createObjectURL(f), f.name);
  };

  async function analyse() {
    if (!features && !description.trim()) {
      setError("Add a photo or describe the item first.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    setFeedback(null);
    try {
      const [res] = await Promise.all([
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features, description, fileName, weightKg: Number(weight) || 1, city: city || null }),
        }),
        new Promise((r) => setTimeout(r, 2200)),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
      setResult(data);
      setSelected(data.predictions[0].slug);
      setCo2(data.co2SavedKg);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  async function choose(slug: CategorySlug, kind: "confirmed" | "corrected") {
    if (!result) return;
    setSelected(slug);
    try {
      const res = await fetch("/api/scan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId: result.scanId, category: slug, weightKg: Number(weight) || 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ ...result, products: data.products, organizations: data.organizations });
      setCo2(data.co2SavedKg);
      setFeedback(kind);
    } catch {
      setError("Could not save your feedback. Please try again.");
    }
  }

  const top = result?.predictions[0];
  const active = selected ? CATEGORY_MAP[selected] : null;
  const lowConf = !!top && top.confidence < 0.5;

  return (
    <>
      {/* HEADER */}
      <section className="relative isolate overflow-hidden bg-forest-deep px-6 pb-20 pt-40 text-paper md:px-10 md:pb-28 md:pt-48">
        <img src="/img/sorting-3.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-deep/50 via-forest-deep/80 to-forest-deep" />
        <div className="mx-auto max-w-[1500px]">
          <p className="label text-lime mb-6 fade-up">RE/SOURCE Vision · Research prototype</p>
          <h1 className="display text-[clamp(4rem,14vw,14rem)]">
            <span className="line-mask">
              <span>Scan</span>
            </span>
            <span className="line-mask">
              <span style={{ ["--d" as string]: "150ms" }}>
                your <span className="serif lowercase text-lime">waste</span>
              </span>
            </span>
          </h1>
        </div>
      </section>

      {/* INPUT */}
      <section className="bg-charcoal px-6 pb-24 pt-4 text-paper md:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-px bg-paper/10 lg:grid-cols-2">
          {/* Dropzone */}
          <div className="bg-charcoal p-0 lg:pr-10">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                onFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => !busy && input.current?.click()}
              className={`relative aspect-[4/3] cursor-pointer overflow-hidden border border-dashed transition-colors ${
                drag ? "border-lime bg-lime/10" : "border-paper/30 hover:border-lime"
              }`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Selected waste item" className="h-full w-full object-cover" />
                  {busy && (
                    <>
                      <div className="absolute inset-0 bg-charcoal/40" />
                      <div className="scan-line" />
                      <div className="absolute inset-0 [background:linear-gradient(rgba(198,232,107,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(198,232,107,.12)_1px,transparent_1px)] [background-size:32px_32px]" />
                      <p className="label absolute bottom-4 left-4 bg-lime px-2 py-1 text-charcoal">Extracting descriptors…</p>
                    </>
                  )}
                  {!busy && <p className="label absolute bottom-4 left-4 bg-charcoal/80 px-2 py-1">Click to replace</p>}
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-lime text-2xl text-lime">+</div>
                  <p className="display-wide text-2xl">Drop a photo here</p>
                  <p className="label text-ash">or click to browse · use your camera on mobile</p>
                </div>
              )}
              <input
                ref={input}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </div>

            <div className="mt-6">
              <p className="label mb-3 text-ash">No waste at hand? Try a sample</p>
              <div className="hscroll flex gap-3 overflow-x-auto pb-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.src}
                    onClick={() => {
                      setDescription("");
                      ingest(s.src, s.name);
                    }}
                    className={`group relative h-20 w-24 shrink-0 overflow-hidden border ${
                      preview === s.src ? "border-lime" : "border-paper/20"
                    }`}
                  >
                    <img src={s.src} alt={s.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className="label absolute inset-x-0 bottom-0 bg-charcoal/80 py-1 text-center text-[0.55rem]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-charcoal p-0 lg:pl-10">
            <p className="label text-lime">Step 02 — Add context</p>
            <h2 className="display mt-3 text-5xl md:text-6xl">Tell us more</h2>
            <p className="mt-3 max-w-md text-paper/60">
              Words sharpen the image model. “Shampoo bottle with cap”, “old laptop charger”, “wine jar” — anything helps.
            </p>

            <div className="mt-8 space-y-6">
              <label className="block">
                <span className="label text-ash">Describe the item (optional)</span>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. empty water bottles, clear plastic"
                  className="mt-2 w-full border-b border-paper/30 bg-transparent py-3 text-lg text-paper outline-none placeholder:text-paper/30 focus:border-lime"
                />
              </label>
              <div className="grid grid-cols-2 gap-6">
                <label className="block">
                  <span className="label text-ash">Approx. weight (kg)</span>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-2 w-full border-b border-paper/30 bg-transparent py-3 text-lg text-paper outline-none focus:border-lime"
                  />
                </label>
                <label className="block">
                  <span className="label text-ash">Your city</span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-2 w-full border-b border-paper/30 bg-charcoal py-3 text-lg text-paper outline-none focus:border-lime"
                  >
                    <option value="">Anywhere</option>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {error && <p className="mt-6 border-l-2 border-red-400 pl-4 text-sm text-red-300">{error}</p>}

            <button onClick={analyse} disabled={busy} className="btn btn-lime mt-10 disabled:opacity-60">
              {busy ? "Analysing…" : "Identify material"} <span className="arrow">→</span>
            </button>
            <p className="label mt-5 normal-case tracking-normal text-ash">
              Photos are analysed in your browser. Only 12 numeric descriptors — never the image — are sent to the server.
            </p>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      {result && top && active && (
        <div ref={resultsRef} className="scroll-mt-20">
          <section className="bg-paper px-6 py-20 md:px-10 md:py-28">
            <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
                  <img src={preview ?? active.image} alt="" className="h-full w-full object-cover" />
                  <div className="hud-box" style={{ left: "12%", top: "14%", width: "76%", height: "70%", "--d": "200ms" } as React.CSSProperties}>
                    <span className="label absolute -top-6 left-0 whitespace-nowrap bg-lime px-2 py-[3px] text-[0.6rem] text-charcoal">
                      {active.code} · {Math.round((result.predictions.find((p) => p.slug === selected)?.confidence ?? top.confidence) * 100)}%
                    </span>
                  </div>
                </div>
                <p className="label mt-3 text-ash">
                  Scan #{result.scanId} · {result.usedImage ? "image descriptors" : ""}
                  {result.usedImage && result.usedText ? " + " : ""}
                  {result.usedText ? "language prior" : ""}
                </p>
              </div>

              <div className="lg:col-span-7">
                <p className="label text-forest">Identified as</p>
                <h2 className="display mt-3 text-[clamp(3.5rem,9vw,8.5rem)] text-charcoal">{active.name}</h2>
                <p className="mt-5 max-w-xl text-lg text-charcoal/70">{active.blurb}</p>

                <div className="mt-10">
                  <p className="label mb-4 text-ash">Model confidence — select to correct</p>
                  <ul className="space-y-3">
                    {result.predictions.map((p) => {
                      const c = CATEGORY_MAP[p.slug];
                      const isSel = p.slug === selected;
                      return (
                        <li key={p.slug}>
                          <button
                            onClick={() => choose(p.slug, p.slug === top.slug ? "confirmed" : "corrected")}
                            className={`group relative w-full overflow-hidden border px-5 py-4 text-left transition-colors ${
                              isSel ? "border-forest bg-forest text-paper" : "border-charcoal/15 hover:border-forest"
                            }`}
                          >
                            <span
                              className={`bar-grow absolute inset-y-0 left-0 ${isSel ? "bg-lime/25" : "bg-sage/30"}`}
                              style={{ width: `${Math.max(3, p.confidence * 100)}%` }}
                            />
                            <span className="relative flex items-baseline justify-between gap-4">
                              <span className="display-wide text-xl">{c.name}</span>
                              <span className="label">{(p.confidence * 100).toFixed(1)}%</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {lowConf && (
                    <p className="mt-4 border-l-2 border-forest pl-4 text-sm text-charcoal/70">
                      The model is unsure from the photo alone. Add a short description above and re-run, or pick the correct material — your
                      correction is stored as training feedback.
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button onClick={() => choose(selected!, selected === top.slug ? "confirmed" : "corrected")} className="btn btn-dark">
                      ✓ This is correct
                    </button>
                    <select
                      value=""
                      onChange={(e) => e.target.value && choose(e.target.value as CategorySlug, "corrected")}
                      className="label border border-charcoal/25 bg-transparent px-4 py-3 outline-none"
                    >
                      <option value="">Something else…</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {feedback && <span className="label text-forest">Feedback saved · thank you</span>}
                  </div>
                </div>

                <div className="mt-12 grid gap-px bg-charcoal/15 sm:grid-cols-3">
                  {[
                    { l: "CO₂e avoided", v: `${co2} kg`, s: `at ${active.co2PerKg} kg per kg recovered` },
                    { l: "Recoverability", v: `${active.recoverability}%`, s: "of material re-enters supply" },
                    { l: "Persists in nature", v: active.persistence, s: "if discarded" },
                  ].map((s) => (
                    <div key={s.l} className="bg-paper p-5">
                      <p className="label text-ash">{s.l}</p>
                      <p className="display mt-2 text-3xl text-forest">{s.v}</p>
                      <p className="mt-1 text-xs text-charcoal/55">{s.s}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-px grid gap-px bg-charcoal/15 sm:grid-cols-2">
                  <div className="bg-paper p-5">
                    <p className="label text-ash">Where it goes</p>
                    <p className="mt-2 text-charcoal">{active.bin}</p>
                  </div>
                  <div className="bg-paper p-5">
                    <p className="label text-ash">Prepare it</p>
                    <p className="mt-2 text-charcoal">{active.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Products */}
          <section className="bg-forest px-6 py-20 text-paper md:px-10 md:py-28">
            <div className="mx-auto max-w-[1500px]">
              <div className="mb-12 flex items-end justify-between gap-6">
                <h3 className="display text-[clamp(2.8rem,7vw,6.5rem)]">
                  Make something <span className="serif lowercase text-lime">from it</span>
                </h3>
                <Link href={`/ideas?category=${active.slug}`} className="btn btn-ghost hidden md:inline-flex">
                  All {active.name} ideas <span className="arrow">→</span>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {result.products.map((p) => (
                  <Link key={p.id} href={`/ideas?open=${p.slug}`} className="photo-card group block bg-forest-deep">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      <span className="label absolute left-3 top-3 bg-lime px-2 py-1 text-charcoal">{p.difficulty}</span>
                    </div>
                    <div className="p-6">
                      <h4 className="display-wide text-2xl leading-tight">{p.name}</h4>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-paper/65">{p.summary}</p>
                      <p className="label mt-5 text-sage">
                        ~${p.valueUsd}/unit · {p.hours}h · View blueprint →
                      </p>
                    </div>
                  </Link>
                ))}
                {result.products.length === 0 && <p className="text-paper/60">No pathways listed for this material yet.</p>}
              </div>
            </div>
          </section>

          {/* Organisations */}
          <section className="bg-paper px-6 py-20 md:px-10 md:py-28">
            <div className="mx-auto max-w-[1500px]">
              <div className="mb-12 flex items-end justify-between gap-6">
                <h3 className="display text-[clamp(2.8rem,7vw,6.5rem)]">
                  Who will <span className="serif lowercase text-forest">take it?</span>
                </h3>
                <Link href="/network" className="btn btn-outline-dark hidden md:inline-flex">
                  Full network <span className="arrow">→</span>
                </Link>
              </div>
              <ul className="divide-y divide-charcoal/15 border-y border-charcoal/15">
                {result.organizations.slice(0, 6).map((o) => {
                  const local = city && o.city === city;
                  return (
                    <li key={o.id} className="grid items-center gap-4 py-6 md:grid-cols-12">
                      <div className="md:col-span-4">
                        <p className="display-wide text-2xl">{o.name}</p>
                        <p className="label mt-1 text-ash">
                          {o.city}, {o.country} {local && <span className="ml-2 bg-lime px-2 py-0.5 text-charcoal">Near you</span>}
                        </p>
                      </div>
                      <p className="text-sm text-charcoal/65 md:col-span-4">{o.description}</p>
                      <p className="label text-forest md:col-span-2">{o.type}</p>
                      <div className="md:col-span-2 md:text-right">
                        <button
                          onClick={() =>
                            setConnect({
                              organizationId: o.id,
                              organizationName: o.name,
                              category: selected,
                              scanId: result.scanId,
                              quantityKg: Number(weight) || null,
                            })
                          }
                          className="btn btn-dark !px-5 !py-3"
                        >
                          Connect <span className="arrow">→</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
                {result.organizations.length === 0 && <li className="py-8 text-charcoal/60">No organisations accept this material yet — be the first to partner.</li>}
              </ul>
            </div>
          </section>
        </div>
      )}

      <ConnectModal target={connect} onClose={() => setConnect(null)} />
    </>
  );
}
