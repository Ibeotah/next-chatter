import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addComment, deleteComment, fetchComments } from "@/lib/comments";
import { useAuth } from "@/context/auth-context";
import { CommentNode } from "@/types";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function useComments(postId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<CommentNode[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
    // @ts-ignore
    onError: (error: Error) => {
      toast.error(`Failed to load comments: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments:post:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // safest approach for nested tree
          queryClient.invalidateQueries({
            queryKey: ["comments", postId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return query;
}

export function useAddComment(postId: string) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string | null;
    }) => {
      if (!user?.id) {
        throw new Error("You must be logged in to post a comment");
      }
      return addComment(postId, user.id, content, parentId);
    },

    onMutate: async (newComment) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData<CommentNode[]>([
        "comments",
        postId,
      ]);

      queryClient.setQueryData<CommentNode[]>(
        ["comments", postId],
        (old = []) => {
          const optimisticComment: CommentNode = {
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            post_id: postId, // ✅ Added required field
            user_id: user.id, // ✅ From useAuth
            content: newComment.content,
            parent_id: newComment.parentId || null,
            profiles: profile
              ? {
                // ✅ Uses profile from useAuth
                name: profile.name,
                avatar_url: profile.avatar_url,
                username: profile.username,
              }
              : undefined,
            replies: [], // ✅ Empty array for new comments
          };
          return [...old, optimisticComment];
        },
      );

      return { previousComments };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },

    onError: (error: Error, _variables, context) => {
      queryClient.setQueryData(["comments", postId], context?.previousComments);
      toast.error(`Failed to post comment: ${error.message}`);
    },
  });
}

export function useDeleteComment(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => {
      if (!user?.id) {
        throw new Error("You must be logged in to delete a comment");
      }
      return deleteComment(commentId, user.id);
    },

    onMutate: async (commentId) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData<CommentNode[]>([
        "comments",
        postId,
      ]);

      queryClient.setQueryData<CommentNode[]>(
        ["comments", postId],
        (old = []) => {
          return old.filter((comment) => comment.id !== commentId);
        },
      );

      return { previousComments };
    },

    onSuccess: () => {
      toast.success("Comment deleted!");
    },

    onError: (error: Error, _variables, context) => {
      queryClient.setQueryData(["comments", postId], context?.previousComments);
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });
}
