"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/** Adds `.is-in` once the element enters the viewport. */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, seen };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  variant = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  variant?: "up" | "mask" | "img";
}) {
  const { ref, seen } = useInView<HTMLElement>();
  const cls = variant === "up" ? "reveal" : variant === "mask" ? "reveal-mask" : "reveal-img";
  return (
    <Tag
      ref={ref}
      className={`${cls} ${seen ? "is-in" : ""} ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Count-up number triggered on view. */
export function Counter({
  to,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1800,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const { ref, seen } = useInView<HTMLSpanElement>(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/** Words light up as the paragraph scrolls through the viewport. */
export function ScrollWords({
  text,
  className = "",
  accent = [],
}: {
  text: string;
  className?: string;
  accent?: string[];
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      setP(Math.max(0, Math.min(1, prog)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const on = p * words.length * 1.15 > i;
        const isAccent = accent.includes(w.replace(/[.,?!]/g, "").toLowerCase());
        return (
          <span
            key={i}
            className="transition-colors duration-500"
            style={{ color: on ? (isAccent ? "var(--color-forest)" : "var(--color-charcoal)") : "rgb(21 26 24 / 0.16)" }}
          >
            {w}{" "}
          </span>
        );
      })}
    </p>
  );
}
