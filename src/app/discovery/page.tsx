import type { Metadata } from "next";
import { buildDiscoveryMeta } from "@/lib/metadata";
import DiscoveryPage from "./discoveryPage";

/**
 * Static metadata for the discovery page.
 * The feed content is dynamic but the page's SEO identity is fixed.
 */

/**
 * Server Component shell — owns the metadata export.
 * Delegates all UI and client logic to DiscoveryPage.
 */
export const metadata: Metadata = buildDiscoveryMeta();

export default function Page() {
  return <DiscoveryPage />;
}
