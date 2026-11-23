import { db } from "@/db";
import {
  connectionRequests,
  organizations,
  products,
  scans,
  type Organization,
  type Product,
} from "@/db/schema";
import { count, desc, sql, sum } from "drizzle-orm";
import { SEED_ORGS, SEED_PRODUCTS } from "./seed-data";
import { CATEGORY_MAP, type CategorySlug } from "./categories";

let seedPromise: Promise<void> | null = null;

/** Idempotent, lazy seed so a fresh database is immediately usable. */
export function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [{ n }] = await db.select({ n: count() }).from(products);
      if (n === 0) {
        await db.insert(products).values(SEED_PRODUCTS).onConflictDoNothing();
      }
      const [{ m }] = await db.select({ m: count() }).from(organizations);
      if (m === 0) {
        await db
          .insert(organizations)
          .values(SEED_ORGS.map((o) => ({ ...o, verified: true })))
          .onConflictDoNothing();
      }
    })().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  return seedPromise;
}

export async function getProducts(): Promise<Product[]> {
  await ensureSeed();
  return db.select().from(products).orderBy(products.id);
}

export async function getOrganizations(): Promise<Organization[]> {
  await ensureSeed();
  return db.select().from(organizations).orderBy(organizations.id);
}

export async function recommend(category: CategorySlug, city?: string | null) {
  const [allProducts, allOrgs] = await Promise.all([getProducts(), getOrganizations()]);
  const prods = allProducts
    .filter((p) => p.category === category)
    .sort((a, b) => {
      const order = { Easy: 0, Workshop: 1, Industrial: 2 } as Record<string, number>;
      return order[a.difficulty] - order[b.difficulty];
    });
  const orgs = allOrgs
    .filter((o) => o.accepts.includes(category))
    .sort((a, b) => {
      const ac = city && a.city.toLowerCase() === city.toLowerCase() ? 1 : 0;
      const bc = city && b.city.toLowerCase() === city.toLowerCase() ? 1 : 0;
      return bc - ac || b.tonnesPerYear - a.tonnesPerYear;
    });
  return { products: prods, organizations: orgs };
}

export async function getImpact() {
  await ensureSeed();
  const [totals] = await db
    .select({
      scans: count(),
      kg: sum(scans.weightKg),
      co2: sum(scans.co2SavedKg),
    })
    .from(scans);
  const [reqs] = await db.select({ n: count() }).from(connectionRequests);
  const byCategory = await db
    .select({
      category: sql<string>`coalesce(${scans.correctedCategory}, ${scans.predictedCategory})`,
      n: count(),
      kg: sum(scans.weightKg),
    })
    .from(scans)
    .groupBy(sql`coalesce(${scans.correctedCategory}, ${scans.predictedCategory})`);
  const recent = await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(8);
  const [fb] = await db
    .select({
      reviewed: count(),
      agreed: sql<number>`count(*) filter (where ${scans.correctedCategory} = ${scans.predictedCategory})`,
    })
    .from(scans)
    .where(sql`${scans.correctedCategory} is not null`);
  const orgsAll = await db.select().from(organizations);
  return {
    scans: Number(totals.scans),
    kg: Number(totals.kg ?? 0),
    co2: Number(totals.co2 ?? 0),
    requests: Number(reqs.n),
    byCategory: byCategory.map((r) => ({
      category: r.category,
      n: Number(r.n),
      kg: Number(r.kg ?? 0),
    })),
    recent,
    feedback: { reviewed: Number(fb.reviewed), agreed: Number(fb.agreed) },
    network: {
      orgs: orgsAll.length,
      tonnes: orgsAll.reduce((a, o) => a + o.tonnesPerYear, 0),
      countries: new Set(orgsAll.map((o) => o.country)).size,
    },
  };
}

export function co2For(category: CategorySlug, kg: number) {
  return Math.round(CATEGORY_MAP[category].co2PerKg * kg * 100) / 100;
}
