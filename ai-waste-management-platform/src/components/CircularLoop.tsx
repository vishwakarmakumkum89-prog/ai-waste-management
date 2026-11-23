const STEPS = [
  { t: "Discard", d: "Material leaves the household or business" },
  { t: "Identify", d: "AI recognises the material in seconds" },
  { t: "Collect", d: "NGOs & waste-pickers route the pickup" },
  { t: "Process", d: "Sorted, cleaned, shredded or composted" },
  { t: "Create", d: "Products and raw materials are made" },
  { t: "Return", d: "Goods re-enter the community" },
];

export default function CircularLoop() {
  const R = 190;
  const C = 250;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[640px]">
      <svg viewBox="0 0 500 500" className="h-full w-full overflow-visible">
        <defs>
          <path id="ringpath" d={`M ${C},${C - R - 38} a ${R + 38},${R + 38} 0 1,1 -0.01,0`} />
        </defs>
        <g style={{ transformOrigin: "250px 250px", animation: "spin-slow 60s linear infinite" }}>
          <circle cx={C} cy={C} r={R + 62} fill="none" stroke="#C6E86B" strokeOpacity="0.25" strokeDasharray="2 10" strokeWidth="1.5" />
        </g>
        <g style={{ transformOrigin: "250px 250px", animation: "spin-rev 90s linear infinite" }}>
          <text className="label" fill="#A8BCA5" fontSize="9" letterSpacing="5">
            <textPath href="#ringpath">REDUCE · REUSE · RECYCLE · RECOVER · REIMAGINE · REDUCE · REUSE · RECYCLE · RECOVER · REIMAGINE ·</textPath>
          </text>
        </g>
        <circle cx={C} cy={C} r={R} fill="none" stroke="#F5F4EF" strokeOpacity="0.18" />
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="#C6E86B"
          strokeWidth="2"
          strokeDasharray="60 1134"
          style={{ transformOrigin: "250px 250px", animation: "spin-slow 9s linear infinite" }}
        />
        {STEPS.map((s, i) => {
          const a = (i / STEPS.length) * Math.PI * 2 - Math.PI / 2;
          const x = C + R * Math.cos(a);
          const y = C + R * Math.sin(a);
          return (
            <g key={s.t}>
              <circle cx={x} cy={y} r="22" fill="#173D32" stroke="#C6E86B" strokeWidth="1.5" />
              <text x={x} y={y + 4} textAnchor="middle" fill="#C6E86B" fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">
                0{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="label text-sage">The loop</p>
        <p className="display mt-2 text-[clamp(2.6rem,6vw,4.6rem)] text-paper">
          Closed<span className="text-lime">.</span>
        </p>
      </div>
      <ol className="sr-only">
        {STEPS.map((s) => (
          <li key={s.t}>
            {s.t}: {s.d}
          </li>
        ))}
      </ol>
    </div>
  );
}

export { STEPS as LOOP_STEPS };
