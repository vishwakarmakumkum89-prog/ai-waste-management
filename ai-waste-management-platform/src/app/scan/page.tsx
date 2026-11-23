import type { Metadata } from "next";
import ScanClient from "@/components/ScanClient";
import { CITIES } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Scan your waste — RE/SOURCE" };

export default function ScanPage() {
  return <ScanClient cities={CITIES} />;
}
