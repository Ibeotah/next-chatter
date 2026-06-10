"use client";

import { ProfilePageError } from "@/components/profile/profile-page-error";


 
export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ProfilePageError message={error.message} onRetry={reset} />;
}