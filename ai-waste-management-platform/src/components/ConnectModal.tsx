"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export type ConnectTarget = {
  organizationId?: number | null;
  organizationName?: string | null;
  category?: string | null;
  scanId?: number | null;
  quantityKg?: number | null;
  kind?: "pickup" | "partner";
};

export default function ConnectModal({ target, onClose }: { target: ConnectTarget | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (target) {
      setCategory(target.category ?? "");
      setQty(target.quantityKg ? String(target.quantityKg) : "");
      setError(null);
      setDone(null);
    }
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [target, onClose]);

  if (!target) return null;
  const partner = target.kind === "partner";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          category: category || null,
          quantityKg: qty ? Number(qty) : null,
          message,
          organizationId: target?.organizationId ?? null,
          scanId: target?.scanId ?? null,
          kind: target?.kind ?? "pickup",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDone(data.organization ?? "the RE/SOURCE network");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full border-b border-charcoal/25 bg-transparent py-3 text-base text-charcoal outline-none transition-colors placeholder:text-charcoal/35 focus:border-forest";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-charcoal/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="modal-in relative max-h-[94svh] w-full max-w-xl overflow-y-auto bg-paper p-8 text-charcoal sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="label absolute right-6 top-6 text-charcoal/60 hover:text-charcoal">
          Close ✕
        </button>
        {done ? (
          <div className="py-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl">✓</div>
            <h3 className="display text-5xl">Connected.</h3>
            <p className="mt-4 text-charcoal/70">
              Your request has been sent to <strong>{done}</strong>. They will reply to <strong>{email}</strong> with next steps.
            </p>
            <button onClick={onClose} className="btn btn-dark mt-8">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="label text-forest">{partner ? "Join the network" : "Request a pickup"}</p>
            <h3 className="display mt-3 text-5xl">
              {partner ? "Become a partner" : target.organizationName ?? "Connect"}
            </h3>
            <p className="mt-3 text-sm text-charcoal/60">
              {partner
                ? "NGOs, cooperatives and recyclers: tell us what you accept and where you operate."
                : "Tell them what you have. They will confirm availability and logistics."}
            </p>
            <div className="mt-8 space-y-5">
              <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className={field} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="grid grid-cols-2 gap-5">
                <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">{partner ? "Materials you accept" : "Material"}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  className={field}
                  type="number"
                  min="0"
                  step="any"
                  placeholder={partner ? "Capacity kg / month" : "Quantity (kg)"}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <textarea
                className={`${field} min-h-[88px] resize-none`}
                placeholder={partner ? "About your organisation" : "Location, access, anything we should know"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="btn btn-dark mt-8 w-full justify-center disabled:opacity-60">
              {busy ? "Sending…" : partner ? "Submit application" : "Send request"} <span className="arrow">→</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
