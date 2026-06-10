// "use client";

// import { supabase } from "@/lib/supabase/client";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// // 1. Fetch followed tags for a user
// export function useFollowedTags(userId: string | undefined) {
//   return useQuery({
//     queryKey: ["followedTags", userId],
//     queryFn: async () => {
//       if (!userId) return [];

//       const { data, error } = await supabase
//         .from("tag_follows")
//         .select("tag_name")
//         .eq("user_id", userId);

//       if (error) throw new Error(error.message);

//       // Map the rows into a clean array of strings: ['Technology', 'Design']
//       return data.map((row) => row.tag_name);
//     },
//     enabled: !!userId,
//   });
// }

// // 2. Toggle tag follow status (Follow / Unfollow)
// export function useToggleTagFollow(userId: string | undefined) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       tagName,
//       isFollowing,
//     }: {
//       tagName: string;
//       isFollowing: boolean;
//     }) => {
//       if (!userId) throw new Error("You must be logged in to follow topics.");

//       if (isFollowing) {
//         // If already following, remove the row
//         const { error } = await supabase
//           .from("tag_follows")
//           .delete()
//           .eq("user_id", userId)
//           .eq("tag_name", tagName);

//         if (error) throw error;
//         return { tagName, action: "unfollowed" };
//       } else {
//         // If not following, insert a new row
//         const { error } = await supabase
//           .from("tag_follows")
//           .insert({ user_id: userId, tag_name: tagName });

//         if (error) throw error;
//         return { tagName, action: "followed" };
//       }
//     },
//     onSuccess: (data) => {
//       // Invalidate the cache to instantly update the UI elements
//       queryClient.invalidateQueries({ queryKey: ["followedTags", userId] });
//        queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
//       toast.success(
//         data.action === "followed"
//           ? `Now following #${data.tagName}`
//           : `Unfollowed #${data.tagName}`,
//       );
//     },
//     onError: (error: any) => {
//       toast.error(error.message || "Failed to update topic preference.");
//     },
//   });
// }

// "use client";

// import { supabase } from "@/lib/supabase/client";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { useProfileGuard } from "./useProfileGuard";

// // ── Fetch followed tags ───────────────────────────────────────────────────────
// export function useFollowedTags(userId: string | undefined) {
//   return useQuery({
//     queryKey: ["followedTags", userId],
//     queryFn: async () => {
//       if (!userId) return [];

//       const { data, error } = await supabase
//         .from("tag_follows")
//         .select("tag_name")
//         .eq("user_id", userId);

//       if (error) throw new Error(error.message);
//       return data.map((row) => row.tag_name) as string[];
//     },
//     enabled: !!userId,
//   });
// }

// // ── Toggle follow/unfollow a tag ──────────────────────────────────────────────
// export function useToggleTagFollow(userId: string | undefined) {
//   const queryClient = useQueryClient();
//   const { requireProfile } = useProfileGuard();

//   return useMutation({
//     mutationFn: async ({
//       tagName,
//       isFollowing,
//     }: {
//       tagName: string;
//       isFollowing: boolean;
//     }) => {
//       // Profile-first guard — throws before any Supabase call
//       // so the FK violation never reaches the DB
//       if (!requireProfile()) throw new Error("PROFILE_REQUIRED");

//       if (isFollowing) {
//         const { error } = await supabase
//           .from("tag_follows")
//           .delete()
//           .eq("user_id", userId!)
//           .eq("tag_name", tagName);

//         if (error) throw error;
//         return { tagName, action: "unfollowed" as const };
//       } else {
//         const { error } = await supabase
//           .from("tag_follows")
//           .insert({ user_id: userId!, tag_name: tagName });

//         if (error) throw error;
//         return { tagName, action: "followed" as const };
//       }
//     },

//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["followedTags", userId] });
//       queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
//       toast.success(
//         data.action === "followed"
//           ? `Now following #${data.tagName}`
//           : `Unfollowed #${data.tagName}`,
//       );
//     },

//     onError: (error: any) => {
//       // PROFILE_REQUIRED is already handled by requireProfile() toast above
//       // Swallow it here so we don't double-toast
//       if (error.message === "PROFILE_REQUIRED") return;
//       toast.error(error.message || "Failed to update topic preference.");
//     },
//   });
// }

// // ── Create and immediately follow a custom tag ────────────────────────────────
// /**
//  * tag_name is free text in tag_follows — no FK to a tags table.
//  * We can insert any string the user provides.
//  * Validation: 2–30 chars, letters/numbers/spaces/hyphens only.
//  */
// export function useCreateCustomTag(userId: string | undefined) {
//   const queryClient = useQueryClient();
//   const { requireProfile } = useProfileGuard();

//   return useMutation({
//     mutationFn: async (tagName: string) => {
//       if (!requireProfile()) throw new Error("PROFILE_REQUIRED");

//       const trimmed = tagName.trim();

//       // Client-side validation
//       if (trimmed.length < 2) {
//         throw new Error("Tag must be at least 2 characters.");
//       }
//       if (trimmed.length > 30) {
//         throw new Error("Tag must be 30 characters or fewer.");
//       }
//       if (!/^[a-zA-Z0-9 \-]+$/.test(trimmed)) {
//         throw new Error(
//           "Tag can only contain letters, numbers, spaces, or hyphens.",
//         );
//       }

//       // Check if already following this tag (case-insensitive)
//       const { data: existing } = await supabase
//         .from("tag_follows")
//         .select("id")
//         .eq("user_id", userId!)
//         .ilike("tag_name", trimmed)
//         .maybeSingle();

//       if (existing) throw new Error(`You are already following #${trimmed}.`);

//       // Insert — tag_name is free text, no separate tags table needed
//       const { error } = await supabase
//         .from("tag_follows")
//         .insert({ user_id: userId!, tag_name: trimmed });

//       if (error) throw error;
//       return trimmed;
//     },

//     onSuccess: (tagName) => {
//       queryClient.invalidateQueries({ queryKey: ["followedTags", userId] });
//       queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
//       toast.success(`Now following #${tagName}`);
//     },

//     onError: (error: any) => {
//       if (error.message === "PROFILE_REQUIRED") return;
//       toast.error(error.message || "Failed to create tag.");
//     },
//   });
// }

"use client";

import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfileGuard } from "./useProfileGuard";

// ── Fetch followed tags ───────────────────────────────────────────────────────
export function useFollowedTags(userId: string | undefined) {
  return useQuery({
    queryKey: ["followedTags", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("tag_follows")
        .select("tag_name")
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return data.map((row) => row.tag_name) as string[];
    },
    enabled: !!userId,
  });
}

// ── Toggle follow / unfollow a tag ───────────────────────────────────────────
export function useToggleTagFollow(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { requireProfile } = useProfileGuard();

  return useMutation({
    mutationFn: async ({
      tagName,
      isFollowing,
    }: {
      tagName: string;
      isFollowing: boolean;
    }) => {
      /*
       * Profile guard runs BEFORE any Supabase call.
       * This is what prevents the FK violation:
       *   tag_follows.user_id → profiles.id
       * If profiles row does not exist yet, requireProfile()
       * shows the toast + redirect and returns false.
       * We throw to abort the mutation and skip onSuccess.
       */
      if (!requireProfile()) throw new Error("PROFILE_REQUIRED");

      if (isFollowing) {
        const { error } = await supabase
          .from("tag_follows")
          .delete()
          .eq("user_id", userId!)
          .eq("tag_name", tagName);
        if (error) throw error;
        return { tagName, action: "unfollowed" as const };
      } else {
        const { error } = await supabase
          .from("tag_follows")
          .insert({ user_id: userId!, tag_name: tagName });
        if (error) throw error;
        return { tagName, action: "followed" as const };
      }
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["followedTags", userId] });
      queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
      toast.success(
        data.action === "followed"
          ? `Now following #${data.tagName}`
          : `Unfollowed #${data.tagName}`,
      );
    },

    onError: (error: any) => {
      // PROFILE_REQUIRED is already toasted by requireProfile()
      // Swallowing it here prevents a double toast
      if (error.message === "PROFILE_REQUIRED") return;
      toast.error(error.message || "Failed to update topic preference.");
    },
  });
}

// ── Create and immediately follow a custom tag (for authors in /new-post) ────
/*
 * tag_name is free text in tag_follows — no FK to a separate tags table.
 * This means any string is valid at the DB level.
 * We apply client-side validation to keep tags clean.
 */
export function useCreateCustomTag(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { requireProfile } = useProfileGuard();

  return useMutation({
    mutationFn: async (tagName: string) => {
      if (!requireProfile()) throw new Error("PROFILE_REQUIRED");

      const trimmed = tagName.trim();

      // Validation
      if (trimmed.length < 2) {
        throw new Error("Tag must be at least 2 characters.");
      }
      if (trimmed.length > 30) {
        throw new Error("Tag must be 30 characters or fewer.");
      }
      if (!/^[a-zA-Z0-9 \-]+$/.test(trimmed)) {
        throw new Error(
          "Tag can only contain letters, numbers, spaces, or hyphens.",
        );
      }

      // Check if already following this tag (case-insensitive)
      const { data: existing } = await supabase
        .from("tag_follows")
        .select("id")
        .eq("user_id", userId!)
        .ilike("tag_name", trimmed)
        .maybeSingle();

      if (existing) {
        throw new Error(`You are already following #${trimmed}.`);
      }

      const { error } = await supabase
        .from("tag_follows")
        .insert({ user_id: userId!, tag_name: trimmed });

      if (error) throw error;
      return trimmed;
    },

    onSuccess: (tagName) => {
      queryClient.invalidateQueries({ queryKey: ["followedTags", userId] });
      queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
      toast.success(`Now following #${tagName}`);
    },

    onError: (error: any) => {
      if (error.message === "PROFILE_REQUIRED") return;
      toast.error(error.message || "Failed to create tag.");
    },
  });
}
