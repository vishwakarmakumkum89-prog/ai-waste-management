import type { Metadata } from "next";
import NetworkClient from "@/components/NetworkClient";
import { getOrganizations } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Circular network — RE/SOURCE" };

export default async function NetworkPage({ searchParams }: { searchParams: Promise<{ category?: string; org?: string }> }) {
  const sp = await searchParams;
  const orgs = await getOrganizations();
  return <NetworkClient orgs={orgs} initialCategory={sp.category ?? ""} initialOrg={sp.org ?? ""} />;
}
