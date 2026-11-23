export const LINKS = [
  { href: "/scan", label: "Scan" },
  { href: "/ideas", label: "Upcycle" },
  { href: "/network", label: "Network" },
  { href: "/impact", label: "Impact" },
  { href: "/research", label: "Research" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`display-wide inline-flex items-baseline text-[1.35rem] leading-none ${className}`}>
      RE<span className="text-lime mx-[1px]">/</span>SOURCE
    </span>
  );
}
