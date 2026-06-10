"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPostLikes(postId: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isLiked = false;
  if (user) {
    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .match({ post_id: postId, user_id: user.id })
      .maybeSingle();
    isLiked = !!data;
  }

  return { count: count || 0, isLiked };
}

export async function toggleLikeAction(
  postId: string,
  isCurrentlyLiked: boolean,
) {
  const supabase = await createClient();

  // 1. Authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("AUTH_REQUIRED");

  /*
   * 2. Profile existence check — the "bouncer".
   * post_likes.user_id → profiles.id (FK).
   * If profile row does not exist, the insert will fail with a FK violation.
   * We check explicitly and throw a meaningful error instead.
   */
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("id", user.id)
    .maybeSingle();

  // No profile row at all
  if (!profile) throw new Error("PROFILE_REQUIRED");

  // Profile row exists but name is empty — setup incomplete
  if (!profile.name?.trim()) throw new Error("PROFILE_REQUIRED");

  // 3. Toggle
  if (isCurrentlyLiked) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .match({ post_id: postId, user_id: user.id });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error) throw error;
  }
}
