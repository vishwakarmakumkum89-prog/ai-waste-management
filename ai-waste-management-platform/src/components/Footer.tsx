import Link from "next/link";
import { Logo, LINKS } from "./brand";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-charcoal text-paper">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10 pt-24 pb-10">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="label text-lime mb-6">Join the loop</p>
            <h3 className="display text-[clamp(3rem,7vw,7rem)] text-balance">
              Every material
              <br />
              has a <span className="serif text-lime normal-case">second</span> life.
            </h3>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/scan" className="btn btn-lime">
                Scan your waste <span className="arrow">→</span>
              </Link>
              <Link href="/network#partner" className="btn btn-ghost">
                Become a partner
              </Link>
            </div>
          </div>
          <div className="md:col-span-3 md:col-start-8">
            <p className="label text-ash mb-5">Platform</p>
            <ul className="space-y-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="u-link text-lg text-paper/90">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="label text-ash mb-5">Project</p>
            <ul className="space-y-3 text-paper/90">
              <li>Circular economy research</li>
              <li>Open to NGO partners</li>
              <li>Waste-picker first</li>
            </ul>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-6 border-t border-paper/10 pt-8 md:flex-row md:items-end md:justify-between">
          <Logo className="!text-[clamp(2.5rem,9vw,8rem)] text-paper/10" />
          <div className="label text-ash md:text-right space-y-2">
            <p>Photography · Pexels contributors</p>
            <p>© {new Date().getFullYear()} RE/SOURCE — Research prototype</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
