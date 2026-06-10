import type { Metadata } from "next";
import { buildProfileMeta } from "@/lib/metadata";
import UserProfilePage from "./profilePage";

/**
 * Server Component shell — owns the metadata export.
 * Profile is behind auth, so we noindex it (see buildProfileMeta).
 */
export const metadata: Metadata = buildProfileMeta();

export default function Page() {
  return <UserProfilePage />;
}