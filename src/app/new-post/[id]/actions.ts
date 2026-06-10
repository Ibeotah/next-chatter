import { createClient } from "@/lib/supabase/server";
import { Post, RawPostData } from "@/types";

export async function getPostById(id: string): Promise<Post | null> {
  // 1. Initialize the server-side Supabase client instance
  const supabase = await createClient();

  // 2. Query the 'posts' table for exactly ONE row where the column 'id' matches our function's argument
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, 
      title, 
      content, 
      status, 
      created_at,
      author_id,
      tags,
      profiles ( name, username, avatar_url )
    `,
    )
    .eq("id", id) // Find the exact post by ID
    .single(); // Tell Supabase to return a single object {}, not an array [{}]

  // 3. If there's an error (like the post doesn't exist), return null so the UI can show a 404 page
  if (error) {
    console.error(`Failed to fetch post: ${error.message}`);
    return null;
  }

  // 4. Cast the raw response single row item to our intermediate database interface structure
  const post = data as unknown as RawPostData;

  // 5. Safely handle whether Supabase sent profiles back as an object or a nested array
  const rawProfile = post.profiles;
  const profileDetails = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

  // 6. Return a single cleanly formatted Post object back to our Server Component page
  return {
    id: post.id,
    author_id: post.author_id,
    title: post.title,
    content: post.content,
    status: post.status,
    created_at: post.created_at,
    tags: post.tags,
    profiles: profileDetails || undefined, // Fallback if no profile is attached
  };
}
