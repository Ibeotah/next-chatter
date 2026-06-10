import type { Metadata } from "next";
import { buildDashboardMeta } from "@/lib/metadata";
import DashboardPage from "./dashboardPage";

export const metadata: Metadata = buildDashboardMeta();

export default function Page() {
  return <DashboardPage />;
}
