import { db } from "@/db";
import { scans } from "@/db/schema";
import { predict } from "@/lib/classifier";
import { CATEGORY_MAP, isCategorySlug } from "@/lib/categories";
import { FEATURE_KEYS } from "@/lib/features";
import { co2For, recommend } from "@/lib/data";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawFeatures = (body.features ?? null) as Record<string, unknown> | null;
  const features: Record<string, number> = {};
  if (rawFeatures && typeof rawFeatures === "object") {
    for (const k of FEATURE_KEYS) {
      const v = rawFeatures[k];
      if (typeof v === "number" && Number.isFinite(v)) features[k] = Math.min(1, Math.max(0, v));
    }
  }
  const description = typeof body.description === "string" ? body.description.slice(0, 300) : null;
  const fileName = typeof body.fileName === "string" ? body.fileName.slice(0, 120) : null;
  const city = typeof body.city === "string" && body.city ? body.city.slice(0, 80) : null;
  const weightKg = num(body.weightKg, 0.01, 100000, 1);

  const result = predict({ features, description, fileName });
  if (!result.usedImage && !result.usedText) {
    return Response.json({ error: "Upload a photo or describe the item." }, { status: 422 });
  }
  const top = result.predictions[0];
  const co2SavedKg = co2For(top.slug, weightKg);

  const [row] = await db
    .insert(scans)
    .values({
      predictedCategory: top.slug,
      confidence: top.confidence,
      scores: Object.fromEntries(result.predictions.map((p) => [p.slug, p.confidence])),
      features: Object.keys(features).length ? features : null,
      description,
      weightKg,
      city,
      co2SavedKg,
    })
    .returning({ id: scans.id });

  const rec = await recommend(top.slug, city);
  return Response.json({
    scanId: row.id,
    predictions: result.predictions.slice(0, 4),
    usedImage: result.usedImage,
    usedText: result.usedText,
    co2SavedKg,
    ...rec,
  });
}

/** Human-in-the-loop correction: user confirms or overrides the model's label. */
export async function PATCH(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const scanId = Number(body.scanId);
  if (!Number.isInteger(scanId) || !isCategorySlug(body.category)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
  const [existing] = await db.select().from(scans).where(eq(scans.id, scanId));
  if (!existing) return Response.json({ error: "Scan not found" }, { status: 404 });
  const weightKg = body.weightKg !== undefined ? num(body.weightKg, 0.01, 100000, existing.weightKg) : existing.weightKg;
  const co2SavedKg = Math.round(CATEGORY_MAP[body.category].co2PerKg * weightKg * 100) / 100;
  await db
    .update(scans)
    .set({ correctedCategory: body.category, weightKg, co2SavedKg })
    .where(eq(scans.id, scanId));
  const rec = await recommend(body.category, existing.city);
  return Response.json({ ok: true, co2SavedKg, ...rec });
}
