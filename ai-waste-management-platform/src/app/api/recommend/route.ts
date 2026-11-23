import { isCategorySlug } from "@/lib/categories";
import { recommend } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  if (!isCategorySlug(category)) {
    return Response.json({ error: "Unknown category" }, { status: 400 });
  }
  return Response.json(await recommend(category, searchParams.get("city")));
}
