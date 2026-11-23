import type { Metadata } from "next";
import IdeasClient from "@/components/IdeasClient";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Upcycling library — RE/SOURCE" };

export default async function IdeasPage({ searchParams }: { searchParams: Promise<{ category?: string; open?: string }> }) {
  const sp = await searchParams;
  const products = await getProducts();
  return <IdeasClient products={products} initialCategory={sp.category ?? ""} initialOpen={sp.open ?? ""} />;
}
