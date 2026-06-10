import { useState } from "react";
import { supabase } from "@/lib/supabase/client"; // adjust your path
import { toast } from "sonner"; // or your toast library
import { Post, PostStatus } from "@/types";
import { successMessages } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditPostInput {
  postId: string;
  title: string;
  content: string;
  tags: string[];
  status: PostStatus;
}

export const usePostActions = () => {
    const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false);

  const updatePostFields = async (
    postId: string,
    updates: {
      title?: string;
      content?: string;
      status?: PostStatus;
    },
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", postId);

      if (error) throw error;
      const status = updates.status;
      const message =
        status && status in successMessages
          ? successMessages[status]
          : "Post updated successfully!";
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(message);
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return { updatePostFields, loading };
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },

    // 1. Optimistic Update: Triggered immediately when delete is clicked
    onMutate: async (postId) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      // Optimistically update the cache by removing the deleted post
      queryClient.setQueryData(["posts"], (old: Post[] | undefined) =>
        old?.filter((post) => post.id !== postId),
      );

      return { previousPosts };
    },

    // 2. Error Handling: If it fails, roll back to previous state
    onError: (err, _postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      toast.error("Deletion failed: " + err.message);
    },

    // 3. Cleanup: Refetch to ensure cache is 100% synced with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    deletePost: mutation.mutate,
    deleting: mutation.isPending,
  };
};





export const useEditPost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ postId, title, content, tags, status }: EditPostInput) => {
      const { error } = await supabase
        .from("posts")
        .update({ title: title.trim(), content, tags, status })
        .eq("id", postId); // RLS "Allow users to update their own posts" enforces ownership

      if (error) throw error;
    },

    // 1. Optimistic update — same pattern as useDeletePost
    onMutate: async ({ postId, title, content, tags, status }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      queryClient.setQueriesData<Post[]>(
        { queryKey: ["posts"] },
        (old) =>
          old?.map((post) =>
            post.id === postId ? { ...post, title, content, tags, status } : post,
          ),
      );

      return { previousPosts };
    },

    // 2. Roll back on failure
    onError: (err, _vars, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      toast.error("Update failed: " + err.message);
    },

    onSuccess: (_data, { status }) => {
      toast.success(
        status in successMessages
          ? successMessages[status as keyof typeof successMessages]
          : "Post updated successfully!",
      );
    },

    // 3. Sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    editPost: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};