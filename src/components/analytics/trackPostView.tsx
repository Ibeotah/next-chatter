"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

interface TrackPostViewProps {
  postId: string;
}

export default function TrackPostView({ postId }: TrackPostViewProps) {
  const { user } = useAuth();
  const hasFired = useRef(false);

  useEffect(() => {
    // If no authenticated user, do nothing.
    // This shouldn't happen since PostDetailPage is auth-protected,
    // but this is a safety net.
    if (!user) return;

    // Prevent React Strict Mode from firing this twice in development
    if (hasFired.current) return;
    hasFired.current = true;

    const trackView = async () => {
      try {
        // getSession() reads from the local cookie/storage cache.
        // It does NOT make a network request — safe and fast.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          toast.warning("[TrackPostView] No active session found. Skipping.");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-view`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Required by Supabase to identify your project
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
              // JWT sent so the edge function verifies the real user
              // server-side — userId is never trusted from the body
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ postId }),
          },
        );

        if (!response.ok) {
          toast.warning("Something went wrong while loading this page.", {
            description:
              "Don't worry — your reading experience isn't affected.",
            duration: 4000,
          });
        }
      } catch (_err) {
        // Silent fail — network errors, cold starts, timeouts.
        // The user's reading experience is completely unaffected.
        toast.warning("[TrackPostView] Failed to track view:");
      }
    };

    trackView();

    // Re-fires only if the user navigates directly between two post
    // detail pages without unmounting (e.g., related posts navigation)
  }, [postId, user]);

  // Renders nothing — purely a behaviour component
  return null;
}
