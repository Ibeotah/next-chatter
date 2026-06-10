"use server";

import { createClient } from "@/lib/supabase/server";
import { Post } from "@/types";

export async function getTrendingPosts(
  searchQuery?: string,
  tag?: string,
  cursor?: string | null,
): Promise<Post[]> {
  const supabase = await createClient();

  // Executes the custom aggregate aggregation directly on Postgres
  const { data, error } = await supabase.rpc("get_trending_posts_cursor", {
    search_query: searchQuery || "",
    tag_filter: tag || "",
    last_created_at: cursor || null,
    items_per_page: 5,
  });

  if (error) {
    throw new Error(`Failed to fetch trending posts: ${error.message}`);
  }

  return (data || []) as unknown as Post[];
}
