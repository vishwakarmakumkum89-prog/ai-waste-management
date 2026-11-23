const WORDS = ["Identify", "Recover", "Reimagine", "Reconnect", "Repeat"];

export default function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center">
      {WORDS.concat(WORDS).map((w, i) => (
        <span key={i} className="flex items-center">
          <span className={`display text-[clamp(2.4rem,5vw,4.5rem)] px-8 ${i % 2 ? "serif !text-[clamp(2.6rem,5.4vw,4.9rem)] normal-case" : ""}`}>{w}</span>
          <span className="h-3 w-3 rotate-45 bg-charcoal" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee overflow-hidden bg-lime py-5 text-charcoal" aria-hidden>
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
