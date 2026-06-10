"use client";

import { supabase } from "@/lib/supabase/client";
import { getAllPublishedPosts } from "@/app/discovery/actions";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useDiscoveryPosts(searchQuery: string = "", tag: string = "") {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["posts", "discovery", searchQuery, tag],
    queryFn: ({ pageParam = 1 }) =>
      getAllPublishedPosts(searchQuery, tag, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Assuming 5 items per page as defined in your server action
      return lastPage.length === 5 ? allPages.length + 1 : undefined;
    },
    refetchOnWindowFocus: true,
  });

  // Keep your existing Real-time listeners
  useEffect(() => {
    const uniqueChannelName = `discovery-feed-${Math.random().toString(36).substring(7)}`;

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
