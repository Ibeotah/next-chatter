import type { Metadata } from "next";
import { buildDiscoveryMeta } from "@/lib/metadata";
import DiscoveryPage from "./discoveryPage";

export const metadata: Metadata = buildDiscoveryMeta();

export default function Page() {
  return <DiscoveryPage />;
}
