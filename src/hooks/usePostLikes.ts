import { getPostLikes, toggleLikeAction } from '@/components/discovery/likes/actions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; // Ensure this is installed

export function usePostLikes(postId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['post_likes', postId];

  // 1. SELECT: Fetch the current state
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getPostLikes(postId),
  });

  // 2. INSERT / DELETE: Mutation logic
  const mutation = useMutation({
    mutationFn: (isCurrentlyLiked: boolean) => toggleLikeAction(postId, isCurrentlyLiked),

    // Optimistic Update: Change UI before the server responds
    onMutate: async (isCurrentlyLiked) => {
      // Cancel ongoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Save previous state for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // Apply optimistic update
      queryClient.setQueryData(queryKey, {
        count: isCurrentlyLiked ? Math.max(0, (data?.count || 1) - 1) : (data?.count || 0) + 1,
        isLiked: !isCurrentlyLiked,
      });

      return { previousData };
    },

    // Handle Errors
    onError: (err: any, _, context) => {
      // Rollback on failure
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // User-facing Toast Messages
      if (err.message === "PROFILE_REQUIRED") {
        toast.error("Please create a profile before you can like posts.");
      } else if (err.message === "AUTH_REQUIRED") {
        toast.error("You need to sign in to interact with posts.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },

    // Refresh state after success or failure
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    likeCount: data?.count ?? 0,
    isLiked: data?.isLiked ?? false,
    isFetching: isLoading,
    toggleLike: () => {
      // Execute mutation using the current data
      if (data !== undefined) {
        mutation.mutate(data.isLiked);
      }
    },
  };
}