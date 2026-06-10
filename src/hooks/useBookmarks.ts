"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useProfileGuard } from "./useProfileGuard";

export const useBookmark = (postId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { requireProfile } = useProfileGuard();
  const queryKey = ["bookmarks", postId, user?.id];

  // Fetch bookmark state
  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (isBookmarked: boolean) => {
      // Guard runs before any Supabase call — prevents FK violation
      if (!requireProfile()) throw new Error("PROFILE_REQUIRED");

      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user!.id);
      } else {
        await supabase
          .from("bookmarks")
          .insert({ post_id: postId, user_id: user!.id });
      }
    },

    onMutate: async (isBookmarked: boolean) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, !isBookmarked);
      return { previousValue };
    },

    onSuccess: (_, isBookmarked) => {
      toast.success(isBookmarked ? "Bookmark removed" : "Post bookmarked");
    },

    onError: (_err: any, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousValue);
      // PROFILE_REQUIRED already toasted by requireProfile()
      if (_err.message !== "PROFILE_REQUIRED") {
        toast.error("Failed to update bookmark.");
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    isBookmarked: !!data,
    isLoading,
    toggleBookmark: mutation.mutate,
  };
};
