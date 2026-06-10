

"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileGuard } from "./useProfileGuard";

export function usePostTracking() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { requireProfile } = useProfileGuard();

  const trackView = async (
    postId: string,
    postRoute: string,
    userId?: string,
  ) => {
    // Profile guard — blocks new users before the FK violation hits Supabase
    // If profile incomplete: toast + redirect to /profile, do NOT navigate to post
    if (!requireProfile()) return;

    try {
      await supabase.from("post_views").insert({
        post_id: postId,
        user_id: userId,
      });

      queryClient.invalidateQueries({ queryKey: ["posts", "trending"] });
    } catch {
      // Tracking failure is silent — navigation still happens below
    } finally {
      router.push(postRoute);
    }
  };

  return { trackView };
}
