"use server";

import { createClient } from "@/lib/supabase/server";
import { Post, RawPostData } from "@/types";

// Aim: Accepted tag and page parameters directly into the server action function
export async function getAllPublishedPosts(
  searchQuery?: string,
  tag?: string,
  pageParam = 1,
): Promise<Post[]> {
  // 1. Initialize the Supabase client tailored for Server Components / Server Actions
  const supabase = await createClient();

  // 2. Retrieve the current authenticated user session from Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Initialize empty arrays to store follow records safely if a user is not logged in
  let followedAuthorIds: string[] = [];
  let followedTagNames: string[] = [];

  // 4. Only fetch profile-specific preferences if a valid logged-in user session exists
  if (user) {
    // 5. Run both preference queries concurrently in parallel to maximize execution speed
    const [authorsResponse, tagsResponse] = await Promise.all([
      // Fetch all author IDs that the logged-in user is currently following
      supabase
        .from("author_follows")
        .select("following_id")
        .eq("follower_id", user.id),
      // Fetch all unique tag names that the logged-in user has subscribed to
      supabase.from("tag_follows").select("tag_name").eq("user_id", user.id),
    ]);

    // 6. Extract and map matching author IDs into a clean string array if data returned
    if (authorsResponse.data) {
      followedAuthorIds = authorsResponse.data.map((row) => row.following_id);
    }

    // 7. Extract and map matching tag names into a clean string array if data returned
    if (tagsResponse.data) {
      followedTagNames = tagsResponse.data.map((row) => row.tag_name);
    }
  }

  // Aim: Define pagination index windows to enforce the 5-post display limit
  const itemsPerPage = 5; // Aim: Explicitly set the total records allowed per page batch
  const from = (pageParam - 1) * itemsPerPage; // Aim: Compute the starting row index for the database query
  const to = from + itemsPerPage - 1; // Aim: Compute the ending row index for the database query

  // 5. Define the exact columns and relation fragments we want up front
  const selectColumns = `
    id, 
    title, 
    content, 
    status, 
    created_at,
    author_id,
    tags,
    profiles ( name, username, avatar_url )
  `;

  //💡 CHANGED: Conditional query switching based on search string presence
  let query;

  if (searchQuery && searchQuery.trim() !== "") {
    // A. If searching, call the Supabase RPC function we created in your database
    query = supabase
      .rpc("search_published_posts", {
        search_term: searchQuery,
      })
      .select(selectColumns);
  } else {
    // B. Standard feed mode: Query the table directly, attach columns, and filter status
    query = supabase
      .from("posts")
      .select(selectColumns) // 👈 Moves into FilterBuilder status cleanly
      .eq("status", "published");
  }

  // Aim: Apply tag filtering directly at the database level if a tag filter is active
  if (tag && tag.trim() !== "") {
    // Aim: Filter rows where the "tags" array column contains the selected tag name
    query = query.contains("tags", [tag]);
  }

  // Execute the active query variation with your requested profile joins
  const { data, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false }); // Aim: Restrict the network response to exactly 5 items based on calculated offsets

  // 9. Halt execution and bubble up a clean error message if the main post retrieval fails
  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  // 10. Safeguard against missing rows and cast the result to our intermediate array type
  const dbPosts = (data || []) as unknown as RawPostData[];

  // 11. Reformat the raw database rows into structured objects matching the front-end Post interface
  const formattedPosts: Post[] = dbPosts.map((post) => {
    // Extract nested author info handles regardless of whether Supabase returns an object or an array
    const rawProfile = post.profiles;
    const profileDetails = Array.isArray(rawProfile)
      ? rawProfile[0]
      : rawProfile;

    // Return a cleanly unified structure matching the application design definitions
    return {
      id: post.id,
      author_id: post.author_id,
      title: post.title,
      content: post.content,
      status: post.status,
      created_at: post.created_at,
      tags: post.tags,
      profiles: profileDetails || undefined, // Provide an undefined fallback if profiles are missing
    };
  });

  // 12. Sort the formatted array dynamically using your personalized scoring algorithm rules
  formattedPosts.sort((a, b) => {
    // Start baseline score values for both posts at 0 points
    let scoreA = 0;
    let scoreB = 0;

    // --- SCORING CALCULATION FOR POST A ---
    // If the author of Post A is inside the user's followed checklist, add 10 points
    if (followedAuthorIds.includes(a.author_id)) {
      scoreA += 10;
    }
    // Count how many tags match the user's followed list and multiply by 5
    const matchingTagsA =
      a.tags?.filter((tag) => followedTagNames.includes(tag)).length || 0;
    scoreA += matchingTagsA * 5;

    // --- SCORING CALCULATION FOR POST B ---
    // Single check for followed author (Max 10 points)
    if (followedAuthorIds.includes(b.author_id)) {
      scoreB += 10;
    }
    // Count how many tags match the user's followed list and multiply by 5
    const matchingTagsB =
      b.tags?.filter((tag) => followedTagNames.includes(tag)).length || 0;
    scoreB += matchingTagsB * 5;

    // 13. Order Evaluation: Sort descending so the post with the higher weight score moves to the top
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // 14. Chronological Tie-Breaker: If points match perfectly, fallback to show the newest entries first
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  // 15. Return the perfectly ranked and personalized collection back to the UI view component
  return formattedPosts;
}
