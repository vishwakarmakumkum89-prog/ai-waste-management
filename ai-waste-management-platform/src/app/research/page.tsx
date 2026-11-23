import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Motion";
import { CATEGORIES } from "@/lib/categories";
import { FEATURE_KEYS } from "@/lib/features";

export const metadata: Metadata = { title: "Research — RE/SOURCE" };

const PIPELINE = [
  { t: "Capture", d: "A photograph from any phone camera. The image never leaves the device." },
  { t: "Describe", d: "In-browser extraction of 12 descriptors: colour distribution, saturation, texture energy, specular highlights and more." },
  { t: "Classify", d: "A softmax head scores nine material classes. Text from the user's description is blended in as a language prior." },
  { t: "Recommend", d: "The predicted class selects upcycling pathways and ranks organisations by acceptance, proximity and capacity." },
  { t: "Learn", d: "Users confirm or correct each result. Corrections are stored as labelled data for the next training cycle." },
];

export default function ResearchPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-charcoal px-6 pb-20 pt-40 text-paper md:px-10 md:pb-28 md:pt-48">
        <img src="/img/ewaste.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/50 to-charcoal" />
        <div className="mx-auto max-w-[1500px]">
          <p className="label text-lime mb-6">The research behind the platform</p>
          <h1 className="display text-[clamp(4rem,13vw,13rem)]">
            <span className="line-mask">
              <span>Vision for</span>
            </span>
            <span className="line-mask">
              <span style={{ animationDelay: "150ms" }}>
                a <span className="serif lowercase text-lime">circular</span> world
              </span>
            </span>
          </h1>
        </div>
      </section>

      <section className="bg-paper px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-12 md:grid-cols-12">
            <p className="label text-forest md:col-span-3">Pipeline</p>
            <ol className="md:col-span-9">
              {PIPELINE.map((p, i) => (
                <Reveal as="li" key={p.t} delay={i * 80} className="grid items-baseline gap-4 border-t border-charcoal/15 py-8 md:grid-cols-12">
                  <span className="label text-ash md:col-span-1">0{i + 1}</span>
                  <h3 className="display text-5xl md:col-span-4 md:text-6xl">{p.t}</h3>
                  <p className="text-lg text-charcoal/70 md:col-span-7">{p.d}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-forest px-6 py-24 text-paper md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-2">
          <div>
            <p className="label text-lime mb-6">Model card</p>
            <h2 className="display text-[clamp(3rem,7vw,7rem)]">
              RE/SOURCE <span className="serif lowercase text-lime">Vision</span> v0.1
            </h2>
            <dl className="mt-12 divide-y divide-paper/15 border-y border-paper/15">
              {[
                ["Task", "Single-label waste material classification (9 classes)"],
                ["Input", "Centre-cropped 96×96 image + optional free-text"],
                ["Architecture", "Hand-crafted descriptors → softmax regression (L2, Adam)"],
                ["Training data", "Labelled facility & household photographs with random-crop augmentation"],
                ["Output", "Class probabilities, never a single unqualified answer"],
                ["Integration point", "classifier.ts · swap in a CNN/ViT endpoint without changing the app"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-2 py-4 sm:grid-cols-3">
                  <dt className="label text-sage">{k}</dt>
                  <dd className="sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="label text-lime mb-6">Descriptors</p>
            <div className="flex flex-wrap gap-2">
              {FEATURE_KEYS.map((k) => (
                <span key={k} className="label border border-paper/25 px-3 py-2">
                  {k}
                </span>
              ))}
            </div>
            <p className="label mt-14 text-lime">Known limitations</p>
            <ul className="mt-6 space-y-4 text-paper/80">
              <li>— Photographs of mixed piles are ambiguous; the model works best with one dominant material.</li>
              <li>— Colour descriptors are sensitive to extreme lighting. Add a description to compensate.</li>
              <li>— Polymer grade (PET vs. PVC) cannot be confirmed visually; check resin codes when possible.</li>
              <li>— Reported confidence is calibrated on a small set — treat it as guidance, not a guarantee.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-paper px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1500px]">
          <h2 className="display text-[clamp(3rem,8vw,8rem)]">
            The <span className="serif lowercase text-forest">taxonomy</span>
          </h2>
          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="label border-b border-charcoal text-ash">
                  <th className="py-3 pr-4">Class</th>
                  <th className="pr-4">Code</th>
                  <th className="pr-4">Recoverability</th>
                  <th className="pr-4">CO₂e / kg</th>
                  <th>Persistence</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((c) => (
                  <tr key={c.slug} className="border-b border-charcoal/15">
                    <td className="display-wide py-4 pr-4 text-xl">{c.name}</td>
                    <td className="label pr-4 text-forest">{c.code}</td>
                    <td className="pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 bg-charcoal/10">
                          <div className="h-full bg-forest" style={{ width: `${c.recoverability}%` }} />
                        </div>
                        <span className="label">{c.recoverability}%</span>
                      </div>
                    </td>
                    <td className="pr-4">{c.co2PerKg}</td>
                    <td className="text-charcoal/70">{c.persistence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-10 max-w-2xl text-sm text-charcoal/55">
            The partner directory shown in this prototype is illustrative and will be replaced by verified organisations during the pilot.
          </p>
          <Link href="/scan" className="btn btn-dark mt-10">
            Test the model <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
