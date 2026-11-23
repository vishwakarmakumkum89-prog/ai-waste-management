"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LINKS, Logo } from "./brand";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || open ? "bg-charcoal/85 backdrop-blur-xl py-3" : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 md:px-10 text-paper">
          <Link href="/" aria-label="RE/SOURCE home" className="relative z-10">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-9">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`label u-link py-1 ${active ? "text-lime" : "text-paper/80 hover:text-paper"}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/scan" className="btn btn-lime hidden sm:inline-flex !py-3 !px-5">
              Scan waste <span className="arrow">→</span>
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="md:hidden relative z-10 flex h-11 w-11 flex-col items-center justify-center gap-[6px]"
            >
              <span className={`h-px w-6 bg-paper transition-transform duration-500 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-6 bg-paper transition-transform duration-500 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-forest text-paper transition-[clip-path] duration-700 md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        <div className="flex h-full flex-col justify-center gap-2 px-8">
          {[{ href: "/", label: "Home" }, ...LINKS].map((l, i) => (
            <Link key={l.href} href={l.href} className="display text-[3.4rem] py-1 hover:text-lime transition-colors">
              <span className="label mr-4 align-middle text-sage">0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
