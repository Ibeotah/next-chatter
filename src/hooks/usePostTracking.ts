// import { supabase } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";
// import { useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// export function usePostTracking() {
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const trackView = async (
//     postId: string,
//     postRoute: string,
//     userId?: string,
//   ) => {
//     try {
//       // 1. Perform the logging action
//       await supabase.from("post_views").insert({
//         post_id: postId,
//         user_id: userId,
//       });

//       // 2. SUCCESS: Invalidate the trending feed so it reflects the new view immediately
//       queryClient.invalidateQueries({ queryKey: ["posts", "trending"] });
//     } catch (err: any) {
//       // SILENT ERROR: We log to console for debugging, but don't bother the user
//       toast.error(err.message || "Failed to track view post.");
//     } finally {
//       // Always navigate regardless of whether the tracking succeeded
//       router.push(postRoute);
//     }
//   };

//   return { trackView };
// }

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
