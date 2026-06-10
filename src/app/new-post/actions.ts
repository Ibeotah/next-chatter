'use client'

import { supabase } from "@/lib/supabase/client";
import { Post } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";


export const useManagementPosts = (userId: string | undefined) => { // Pass current user ID
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["posts", "management", userId], 
    queryFn: async () => {
      // Extra safety check so the query doesn't run if userId is missing
      if (!userId) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, status")
        .eq("author_id", userId) // 👈 Ensures they only see their own posts to edit/publish
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!userId, // Only run if userId is defined
  });

  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          // 💡 This invalidates EVERYTHING starting with "posts" 
          // meaning both management AND discovery will refresh automatically!
          queryClient.invalidateQueries({ queryKey: ["posts"] }); 
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};