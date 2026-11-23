import { db } from "@/db";
import { connectionRequests, organizations } from "@/db/schema";
import { isCategorySlug } from "@/lib/categories";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = str(body.name, 120);
  const email = str(body.email, 160);
  if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 422 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 422 });
  }
  const organizationId = body.organizationId ? Number(body.organizationId) : null;
  let orgName: string | null = null;
  if (organizationId) {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    if (!org) return Response.json({ error: "Organisation not found." }, { status: 404 });
    orgName = org.name;
  }
  const qty = Number(body.quantityKg);
  const [row] = await db
    .insert(connectionRequests)
    .values({
      organizationId,
      scanId: body.scanId ? Number(body.scanId) || null : null,
      name,
      email,
      category: isCategorySlug(body.category) ? body.category : null,
      quantityKg: Number.isFinite(qty) && qty > 0 ? qty : null,
      message: str(body.message, 800) || null,
      kind: body.kind === "partner" ? "partner" : "pickup",
    })
    .returning({ id: connectionRequests.id });
  return Response.json({ ok: true, id: row.id, organization: orgName });
}
