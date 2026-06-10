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
