"use client";

import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfileGuard } from "./useProfileGuard";

export function useFollows() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. FETCH LIVE FOLLOWED AUTHORS LIST ie fetch the list of authors the user is following
  const { data: followedAuthors = [], isLoading: isLoadingFollows } = useQuery({
    queryKey: ["followedAuthors", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("author_follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (error) throw new Error(error.message);
      // Map the rows into a clean array of strings: ['author_id_1', 'author_id_2']
      return data.map((row) => row.following_id);
    },
    enabled: !!user, // Only run query if a user is logged in
  });

  // 2. FOLLOW MUTATION
  // const followMutation = useMutation({
  //   mutationFn: async (authorId: string) => {
  //     if (!user) throw new Error("You must be logged in to follow authors.");

  //     const { data, error } = await supabase
  //       .from("author_follows")
  //       .insert([{ follower_id: user.id, following_id: authorId }])
  //       .select();

  //     if (error) throw new Error(error.message || "Create a Profile");
  //     return data;
  //   },
  //   onSuccess: () => {
  //     toast.success("Successfully followed author!");
  //     // Invalidate both lists to trigger UI re-renders instantly
  //     queryClient.invalidateQueries({
  //       queryKey: ["followedAuthors", user?.id],
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
  //   },
  //   onError: (error: any) => {
  //     // Check if the error message mentions the follower foreign key constraint
  //     if (error.message?.includes("author_follows_follower_id_fkey")) {
  //       toast.error(
  //         "Please complete setting up your profile before following authors!",
  //       );
  //     } else {
  //       // Fallback for any other unexpected database or network errors
  //       toast.error(error.message || "Failed to follow author.");
  //     }
  //   },
  // });
  const { requireProfile } = useProfileGuard();

  const followMutation = useMutation({
    mutationFn: async (authorId: string) => {
      // Guard before Supabase — prevents author_follows FK violation
      if (!requireProfile()) throw new Error("PROFILE_REQUIRED");

      const { data, error } = await supabase
        .from("author_follows")
        .insert([{ follower_id: user!.id, following_id: authorId }])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully followed author!");
      queryClient.invalidateQueries({
        queryKey: ["followedAuthors", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
    },
    onError: (error: any) => {
      // PROFILE_REQUIRED already toasted — swallow it
      if (error.message === "PROFILE_REQUIRED") return;
      toast.error(error.message || "Failed to follow author.");
    },
  });

  // 3. UNFOLLOW MUTATION
  const unfollowMutation = useMutation({
    mutationFn: async (authorId: string) => {
      if (!user) throw new Error("You must be logged in to unfollow authors.");

      const { error } = await supabase
        .from("author_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", authorId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Unfollowed author.");
      queryClient.invalidateQueries({
        queryKey: ["followedAuthors", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["posts", "discovery"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unfollow author.");
    },
  });

  return {
    followedAuthors,
    isLoadingFollows,
    // Pass the execution functions
    followAuthor: followMutation.mutate,
    unfollowAuthor: unfollowMutation.mutate,
    // Pass specific active variables to target loading indicators to individual buttons
    submittingFollowId: followMutation.isPending
      ? followMutation.variables
      : null,
    submittingUnfollowId: unfollowMutation.isPending
      ? unfollowMutation.variables
      : null,
  };
}

export function useProfileStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["profileStats", userId],
    queryFn: async () => {
      if (!userId) return { followers: 0, following: 0 };

      // 1. Count how many people follow this user
      const { count: followersCount, error: followersError } = await supabase
        .from("author_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      // 2. Count how many people this user is following
      const { count: followingCount, error: followingError } = await supabase
        .from("author_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      if (followersError) throw new Error(followersError.message);
      if (followingError) throw new Error(followingError.message);

      return {
        followers: followersCount || 0,
        following: followingCount || 0,
      };
    },
    enabled: !!userId, // Only run if we have a valid userId
  });
}
