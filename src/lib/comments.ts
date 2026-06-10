import { supabase } from "@/lib/supabase/client";
import { buildCommentTree } from "./utils";
import { Comment, CommentNode } from "@/types";

// Fetch comments for a post (with profiles join) ie fetch the list of comments of a particular post, both parent and child comments with profiles join
export async function fetchComments(postId: string): Promise<CommentNode[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (name, avatar_url, username )
    `,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return buildCommentTree(data);
}

// Add a new comment or reply
export async function addComment(
  postId: string,
  userId: string,
  content: string,
  parentId: string | null = null,
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_id: parentId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a comment (only if user owns it)
export async function deleteComment(
  commentId: string,
  userId: string,
): Promise<string> {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) throw error;
  return commentId;
}
