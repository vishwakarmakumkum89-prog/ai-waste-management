// Shared (client + server safe) waste taxonomy used by the classifier,
// recommendation engine and UI.

export type CategorySlug =
  | "pet-plastic"
  | "hard-plastic"
  | "plastic-film"
  | "glass"
  | "metal"
  | "paper-cardboard"
  | "e-waste"
  | "organic"
  | "textile";

export type WasteCategory = {
  slug: CategorySlug;
  name: string;
  code: string; // short technical code shown in HUD
  blurb: string;
  image: string;
  co2PerKg: number; // kg CO2e avoided per kg recovered (indicative LCA midpoint)
  persistence: string;
  bin: string;
  tip: string;
  recoverability: number; // 0-100
  keywords: string[];
};

export const CATEGORIES: WasteCategory[] = [
  {
    slug: "pet-plastic",
    name: "PET Plastic",
    code: "PET-01",
    blurb: "Clear beverage bottles and food trays. The most valuable plastic stream in the loop.",
    image: "/img/plastic-heap.jpg",
    co2PerKg: 1.5,
    persistence: "450+ years",
    bin: "Dry recyclables — blue",
    tip: "Rinse, remove caps and crush flat. Labels are fine.",
    recoverability: 92,
    keywords: ["bottle", "pet", "water bottle", "soda", "plastic bottle", "beverage", "tray", "clear plastic", "polyester"],
  },
  {
    slug: "hard-plastic",
    name: "Rigid Plastic",
    code: "HDPE-02/PP-05",
    blurb: "Containers, crates, caps, buckets and household items made of HDPE or polypropylene.",
    image: "/img/caps.jpg",
    co2PerKg: 1.4,
    persistence: "500+ years",
    bin: "Dry recyclables — blue",
    tip: "Keep caps on HDPE bottles; separate by colour when you can.",
    recoverability: 84,
    keywords: ["hdpe", "pp", "polypropylene", "cap", "lid", "bucket", "crate", "container", "detergent", "shampoo", "toy", "bottle cap", "tub", "rigid"],
  },
  {
    slug: "plastic-film",
    name: "Plastic Film & Bags",
    code: "LDPE-04",
    blurb: "Carrier bags, wrappers and packaging film — light, contaminating, and rarely collected.",
    image: "/img/textile2.jpg",
    co2PerKg: 1.0,
    persistence: "20–1000 years",
    bin: "Film drop-off — never curbside",
    tip: "Collect clean, dry film in one bag and drop it with a film collector.",
    recoverability: 58,
    keywords: ["bag", "film", "wrapper", "ldpe", "sachet", "carrier bag", "polythene", "cling", "packaging", "shopping bag", "foil wrapper"],
  },
  {
    slug: "glass",
    name: "Glass",
    code: "GLS-70",
    blurb: "Bottles and jars — infinitely recyclable without loss of quality.",
    image: "/img/glass.jpg",
    co2PerKg: 0.3,
    persistence: "1 million years",
    bin: "Glass bank — by colour",
    tip: "Rinse; do not mix with ceramics, mirrors or window glass.",
    recoverability: 97,
    keywords: ["glass", "jar", "wine bottle", "beer bottle", "bottle glass", "mirror", "window", "cullet", "ceramic"],
  },
  {
    slug: "metal",
    name: "Metal & Cans",
    code: "ALU-41/FE-40",
    blurb: "Aluminium cans, steel tins and scrap — recovered at up to 95% energy saving.",
    image: "/img/cans.jpg",
    co2PerKg: 9.0,
    persistence: "50–500 years",
    bin: "Dry recyclables — blue",
    tip: "Crush aluminium cans; use a magnet to separate steel from aluminium.",
    recoverability: 95,
    keywords: ["can", "tin", "aluminium", "aluminum", "steel", "metal", "scrap", "iron", "copper", "foil", "soda can", "beer can"],
  },
  {
    slug: "paper-cardboard",
    name: "Paper & Cardboard",
    code: "PAP-20/22",
    blurb: "Corrugated board, newspaper, cartons and office paper.",
    image: "/img/cardboard.jpg",
    co2PerKg: 0.9,
    persistence: "2–6 months",
    bin: "Dry recyclables — blue",
    tip: "Keep dry and grease-free. Flatten boxes.",
    recoverability: 88,
    keywords: ["paper", "cardboard", "carton", "box", "newspaper", "magazine", "corrugated", "packaging box", "pizza box", "book"],
  },
  {
    slug: "e-waste",
    name: "Electronic Waste",
    code: "WEEE-E1",
    blurb: "Circuit boards, cables, batteries and devices carrying gold, copper and rare earths.",
    image: "/img/ewaste.jpg",
    co2PerKg: 2.0,
    persistence: "Toxic leachate risk",
    bin: "Certified e-waste take-back only",
    tip: "Never bin batteries. Wipe your data and use a certified collector.",
    recoverability: 76,
    keywords: ["phone", "laptop", "circuit", "pcb", "battery", "cable", "charger", "electronic", "e-waste", "ewaste", "keyboard", "device", "wire", "monitor", "motherboard"],
  },
  {
    slug: "organic",
    name: "Organic & Food Waste",
    code: "ORG-10",
    blurb: "Kitchen scraps, garden trimmings and agricultural residue — nutrients waiting to return to soil.",
    image: "/img/compost.jpg",
    co2PerKg: 0.4,
    persistence: "2–8 weeks",
    bin: "Compost / biogas stream",
    tip: "Keep separate from plastics; avoid meat and dairy in home compost.",
    recoverability: 90,
    keywords: ["food", "peel", "vegetable", "fruit", "compost", "organic", "kitchen", "garden", "leaves", "coffee", "scraps", "husk", "bio", "leftover"],
  },
  {
    slug: "textile",
    name: "Textiles",
    code: "TEX-60",
    blurb: "Clothing, offcuts and fabric — fibres that can be re-spun, re-worn or reborn as insulation.",
    image: "/img/textile.jpg",
    co2PerKg: 3.0,
    persistence: "20–200 years",
    bin: "Textile collection point",
    tip: "Donate wearable items; only wash-and-dry rags go to fibre recovery.",
    recoverability: 70,
    keywords: ["cloth", "clothes", "shirt", "jeans", "fabric", "textile", "cotton", "denim", "rag", "garment", "shoe", "sock", "curtain"],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, WasteCategory>;

export function isCategorySlug(v: unknown): v is CategorySlug {
  return typeof v === "string" && v in CATEGORY_MAP;
}
